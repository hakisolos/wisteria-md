import {
	useMultiFileAuthState,
	DisconnectReason,
	makeWASocket,
	Browsers,
	fetchLatestBaileysVersion
} from 'baileys';

import chalk from 'chalk';
import { Boom } from '@hapi/boom';
import pino from 'pino';
import fs from 'fs';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { serializeMessage } from './serialize.js';
import { loadCommands } from './cmd.js';
import handleMessage from './handlemessage.js';

import config from '../config.js';

let connectionState = {
	isConnected: false,
	lastConnected: null,
	reconnectAttempts: 0
};

async function startWisteria() {
	const { version } = await fetchLatestBaileysVersion();

	await loadCommands();

	const { state, saveCreds } = await useMultiFileAuthState('./lib/session');

	const sock = makeWASocket({
		auth: {
			creds: state.creds,
			keys: state.keys,
		},
		agent: config.PROXY ? new HttpsProxyAgent(config.PROXY) : undefined,
		version,
		keepAliveIntervalMs: 2000,
		logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
		browser: Browsers.macOS("Safari"),
		syncFullHistory: true,
		emitOwnEvents: true,
		generateHighQualityLinkPreview: true,
		linkPreviewImageThumbnailWidth: 1920,
		markOnlineOnConnect: true,
	});

	sock.ev.on('connection.update', async update => {
		const { connection, lastDisconnect, qr } = update;

		if (qr && config.PRINT_QR) {
			const { generate } = await import('qrcode-terminal');
			generate(qr, { small: true });
		}

		if (connection === 'close') {
			connectionState.isConnected = false;
			connectionState.reconnectAttempts++;

			const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
			switch (reason) {
				case DisconnectReason.badSession:
				case DisconnectReason.loggedOut:
					fs.rmSync('./lib/session', { recursive: true, force: true });
					break;
				default:
					break;
			}

			if (connectionState.reconnectAttempts > 5) {
				connectionState.reconnectAttempts = 0;
			}

			return startWisteria();
		}

		if (connection === 'open') {
			connectionState.isConnected = true;
			connectionState.lastConnected = Date.now();
			connectionState.reconnectAttempts = 0;

			const jid = sock.user.id;

			await sock.sendMessage(jid, {
				image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
				caption: `🌸Konnichiwa🌸\nWisteria Md Connected Successfully\n🧼 Anti-delete: DISABLED`,
			});
		}
	});

	sock.ev.on('creds.update', saveCreds);

	sock.ev.on('messages.upsert', async m => {
		try {
			const msg = m.messages[0];
			if (m.type !== 'notify') return;

			const serialized = await serializeMessage(msg, sock);
			if (!serialized) return;

			const pushname = msg.pushName || "Unknown";
			const jid = msg.key.remoteJid || "Unknown";
			const senderJid = msg.key.participant || msg.key.remoteJid;
			const timestamp = new Date((msg.messageTimestamp || Date.now()) * 1000).toLocaleString();
			const messageType = Object.keys(msg.message || {})[0] || "Unknown";

			console.log(
				chalk.bold.blue(`💌 Incoming Message`) + '\n' +
				chalk.green(`   💖 From: `) + chalk.yellow(pushname) + '\n' +
				chalk.green(`   📱 JID: `) + chalk.cyan(jid) + '\n' +
				chalk.green(`   🆔 Sender JID: `) + chalk.cyan(senderJid) + '\n' +
				chalk.green(`   🕒 Time: `) + chalk.magenta(timestamp) + '\n' +
				chalk.green(`   ✉️ Type: `) + chalk.red(messageType) + '\n' +
				chalk.gray('---------------------------------------------')
			);

			await handleMessage(serialized);
		} catch (err) {
			console.error(chalk.red('❌ Message processing error:'), err);
		}
	});

	sock.ev.on('groups.update', async events => {
		for (const event of events) {
			try {
				await sock.groupMetadata(event.id);
			} catch (error) {
				console.error(`Error updating group ${event.id}:`, error);
			}
		}
	});

	sock.ev.on('group-participants.update', async event => {
		try {
			await sock.groupMetadata(event.id);
		} catch (error) {
			console.error(`Error in group participant update:`, error);
		}
	});

	return sock;
}

export { startWisteria };
