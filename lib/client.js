/** @format */
const makeWASocket = require('baileys-pro').default;
const {
	useMultiFileAuthState,
	DisconnectReason,
} = require('@im-dims/baileys-md');
const { Boom } = require('@hapi/boom');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const fs = require('fs');
const { serializeMessage } = require('./serilize');
const { loadCommands } = require('./cmd');
const handleMessage = require('./handlemessage');
const { setupAd } = require('./antidelete');
const conn = require('./mongodb');
const { initializeStore } = require('./database/sql_init');

global.sock = null;

async function startWisteria() {
	await initializeStore();
	await conn();
	await loadCommands();

	const { state, saveCreds } = await useMultiFileAuthState('./lib/session');

	sock = makeWASocket({
		auth: state,
		printQRInTerminal: true,
		browser: ['Nikka', 'Chrome', '1.0.0'],
		syncFullHistory: false,
		cachedGroupMetadata: async jid => {
			const cachedData = global.cache.groups.get(jid);
			if (cachedData) return cachedData;

			const metadata = await sock.groupMetadata(jid);
			global.cache.groups.set(jid, metadata);
			return metadata;
		},
		markOnlineOnConnect: true,
		logger: pino({ level: 'silent' }),
	});

	global.store.bind(sock.ev);
	sock.ev.on('creds.update', saveCreds);

	sock.ev.on('messages.upsert', async m => {
		try {
			const msg = m.messages[0];
			if (m.type !== 'notify') return;

			const msgId = msg.key.id;
			if (global.cache.messages.get(msgId)) return;

			global.cache.messages.set(msgId, true);

			const serialized = serializeMessage(msg, sock);
			if (serialized) {
				await handleMessage(serialized);
			}
		} catch (err) {
			console.error('Message processing error:', err);
		}
	});

	sock.ev.on('connection.update', async update => {
		const { connection, lastDisconnect, qr } = update;
		if (qr) qrcode.generate(qr, { small: true });

		if (connection === 'close') {
			const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
			switch (reason) {
				case DisconnectReason.badSession:
					fs.rmSync('./lib/session', { recursive: true, force: true });
					startWisteria();
					break;
				case DisconnectReason.connectionClosed:
				case DisconnectReason.connectionLost:
					startWisteria();
					break;
				case DisconnectReason.loggedOut:
					fs.rmSync('./lib/session', { recursive: true, force: true });
					break;
				default:
					startWisteria();
			}
		}

		if (connection === 'open') {
			let jid = sock.user.id;
			await sock.sendMessage(jid, { text: 'Connected' });
		}
	});

	sock.ev.on('messages.update', async updates => {
		try {
			const relevantUpdates = updates.filter(
				update =>
					update.update.message === null || update.update.messageStubType === 2
			);

			if (relevantUpdates.length === 0) return;

			const antideleteModule = await setupAd(sock, global.store);
			for (const update of relevantUpdates) {
				await antideleteModule.execute(sock, update, { store: global.store });
			}
		} catch (error) {
			console.error('Error in message update handling:', error);
		}
	});

	sock.ev.on('groups.update', async events => {
		for (const event of events) {
			const metadata = await sock.groupMetadata(event.id);
			global.cache.groups.set(event.id, metadata);
		}
	});

	sock.ev.on('group-participants.update', async event => {
		const metadata = await sock.groupMetadata(event.id);
		global.cache.groups.set(event.id, metadata);
	});

	return sock;
}

module.exports = { startWisteria };
