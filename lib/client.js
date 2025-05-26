const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeWASocket,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion 
} = require('baileys');

const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const crypto = require('crypto');
const NodeCache = require("node-cache");
const { HttpsProxyAgent } = require('https-proxy-agent'); // You forgot to require this baby 😘

const cache = new NodeCache();
global.sock = null;

// Custom modules
const { serializeMessage } = require('./serilize');
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
		printQRInTerminal: false,
        keepAliveIntervalMs: 2000,
        browser: Browsers.windows('chrome'),
        syncFullHistory: true,
        emitOwnEvents: true,
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 1920,
        msgRetryCounterCache: cache,
        mediaCache: cache,
        userDevicesCache: cache,
        callOfferCache: cache,
    });

    // 🧩 Pairing Code Setup
    if (!sock.authState?.creds?.registered) {
        const phoneNumber = "2349112171078";
        if (phoneNumber.length < 11) {
            console.error('Please input a valid number');
            process.exit(1);
        }

        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log(`Pairing Code: ${await sock.requestPairingCode(phoneNumber)}`);

        await new Promise(resolve => {
            const interval = setInterval(() => {
                if (sock.authState?.creds?.registered) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });
    }

    global.store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    // ✨ Message Handler
    sock.ev.on('messages.upsert', async m => {
        try {
            const msg = m.messages[0];
            if (m.type !== 'notify') return;

            const msgId = msg.key.id;
            if (global.cache.messages.get(msgId)) return;

            global.cache.messages.set(msgId, true);
            const serialized = serializeMessage(msg, sock);

            if (serialized) await handleMessage(serialized);
        } catch (err) {
            console.error('Message processing error:', err);
        }
    });

    // 🔁 Connection Handler
    sock.ev.on('connection.update', async update => {
        const { connection, lastDisconnect } = update;

        if (connection === 'close') {
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (reason) {
                case DisconnectReason.badSession:
                case DisconnectReason.loggedOut:
                    fs.rmSync('./lib/session', { recursive: true, force: true });
                    break;
                case DisconnectReason.connectionClosed:
                case DisconnectReason.connectionLost:
                default:
                    break;
            }
            return startWisteria(); // Reconnect
        }

        if (connection === 'open') {
            const jid = sock.user.id;
            await sock.sendMessage(jid, {
                image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
                caption: `🌸Konnichiwa🌸\nWisteria Md Connected Successfully`,
            });
        }
    });

    // 🛡️ Anti-delete Handler
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

    // 👥 Group Metadata Handlers
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
