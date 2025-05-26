const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeWASocket,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion 
} = require('baileys');
const patchLidSupport = require('./lidpatch'); 
const chalk = require('chalk')
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const crypto = require('crypto');
const NodeCache = require("node-cache");
const { HttpsProxyAgent } = require('https-proxy-agent');

const cache = new NodeCache();
global.sock = null;

const { serializeMessage } = require('./serialize');
const { loadCommands } = require('./cmd');
const handleMessage = require('./handlemessage');
const { setupAd } = require('./antidelete');
const conn = require('./mongodb');
const { initializeStore } = require('./database/sql_init');
const config = require('../config');

async function startWisteria() {
    const { version } = await fetchLatestBaileysVersion();

    await initializeStore();
    await conn();
    await loadCommands();

    const { state, saveCreds } = await useMultiFileAuthState('./lib/session');

    sock = makeWASocket({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys),
        },
        agent: config.PROXY ? new HttpsProxyAgent(config.PROXY) : undefined,
        version,
        printQRInTerminal: config.PRINT_QR || false,
        keepAliveIntervalMs: 2000,
        logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
        browser: Browsers.macOS("Safari"),
        syncFullHistory: true,
        emitOwnEvents: true,
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 1920,
        msgRetryCounterCache: cache,
        markOnlineOnConnect: true,
        mediaCache: cache,
        userDevicesCache: cache,
        callOfferCache: cache,
    });
	patchLidSupport(sock);
	

    if (!sock.authState?.creds?.registered && !config.PRINT_QR) {
        const phoneNumber = "2349112171078";
        if (phoneNumber.length < 11) {
            console.error('Invalid phone number');
            process.exit(1);
        }

        await new Promise(resolve => setTimeout(resolve, 1500));

        const rawCode = await sock.requestPairingCode(phoneNumber.replace(/[^0-9]/g, ''));
        const formattedCode = rawCode?.match(/.{1,4}/g)?.join('-');
        console.log(`Pairing Code: ${formattedCode}`);

        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (sock.authState?.creds?.registered) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });

        console.log('Registered successfully');
    }
    sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && config.PRINT_QR) {
            const QRCode = require('qrcode-terminal');
            QRCode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (reason) {
                case DisconnectReason.badSession:
                case DisconnectReason.loggedOut:
                    fs.rmSync('./lib/session', { recursive: true, force: true });
                    break;
                default:
                    break;
            }
            return startWisteria();
        }

        if (connection === 'open') {
            const jid = sock.user.id;
            await sock.sendMessage(jid, {
                image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
                caption: `🌸Konnichiwa🌸\nWisteria Md Connected Successfully`,
            });
        }
    });

    global.store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    // Replace both 'messages.upsert' listeners with this single one:

sock.ev.on('messages.upsert', async m => {
    try {
        const msg = m.messages[0];
        if (m.type !== 'notify') return;

        const msgId = msg.key.id;
        if (global.cache.messages.get(msgId)) return;

        global.cache.messages.set(msgId, true);
        const serialized = serializeMessage(msg, sock);
        if (!serialized) return;

        // Log the message details
        const pushname = msg.pushName || "Unknown";
        const jid = msg.key.remoteJid || "Unknown";
		const senderJid = msg.key.participant || jid;
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

        // Handle the message
        await handleMessage(serialized);
    } catch (err) {
        console.error(chalk.red('❌ Message processing error:'), err);
    }
});

    sock.ev.on('messages.update', async updates => {
        try {
            const relevantUpdates = updates.filter(
                update => update.update.message === null || update.update.messageStubType === 2
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
