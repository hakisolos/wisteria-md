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
const { lightningCache, cacheHelpers } = require('./cache');

const cache = lightningCache.mediaCache;
global.sock = null;

const { serializeMessage } = require('./serialize');
const { loadCommands } = require('./cmd');
const handleMessage = require('./handlemessage');
const { setupAd } = require('./antidelete');
const conn = require('./mongodb');
const { initializeStore } = require('./database/sql_init');
const config = require('../config');
const {user} = require("./economy")
let connectionState = {
    isConnected: false,
    lastConnected: null,
    reconnectAttempts: 0
};

async function startWisteria() {
    const { version } = await fetchLatestBaileysVersion();

    await initializeStore();
    await conn();
    await user.initEconomy()
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

    setInterval(async () => {
        try {
            const groups = await sock.groupFetchAllParticipating();
            
            Object.keys(groups).forEach(groupId => {
                cacheHelpers.cacheGroup(groupId, groups[groupId]);
            });
            
            console.log(`✅ Cached ${Object.keys(groups).length} groups`);
        } catch (error) {
            console.error('❌ Error fetching groups:', error.message);
        }
    }, 60000);

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
            connectionState.isConnected = false;
            connectionState.reconnectAttempts++;
            
            const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
            switch (reason) {
                case DisconnectReason.badSession:
                case DisconnectReason.loggedOut:
                    fs.rmSync('./lib/session', { recursive: true, force: true });
                    cacheHelpers.clearCache('all');
                    break;
                default:
                    break;
            }
            
            if (connectionState.reconnectAttempts > 5) {
                lightningCache.emergencyClear();
                connectionState.reconnectAttempts = 0;
            }
            
            return startWisteria();
        }

        if (connection === 'open') {
            connectionState.isConnected = true;
            connectionState.lastConnected = Date.now();
            connectionState.reconnectAttempts = 0;
            
            const jid = sock.user.id;
            
            cacheHelpers.cacheUser(jid, {
                id: jid,
                name: sock.user.name || 'Wisteria Bot',
                isBot: true,
                connectedAt: Date.now()
            });
            
            await sock.sendMessage(jid, {
                image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
                caption: `🌸Konnichiwa🌸\nWisteria Md Connected Successfully\n⚡ Lightning Cache: ENABLED`,
            });
        }
    });

    global.store.bind(sock.ev);
    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async m => {
        try {
            const msg = m.messages[0];
            if (m.type !== 'notify') return;

            const msgId = msg.key.id;
            
            if (cacheHelpers.isMessageDuplicate(msgId)) {
                return;
            }

            const serialized = serializeMessage(msg, sock);
            if (!serialized) return;

            const senderJid = msg.key.participant || msg.key.remoteJid;
            const pushname = msg.pushName || "Unknown";
            
            if (senderJid && !serialized.fromMe) {
                const existingUser = cacheHelpers.getUser(senderJid);
                if (!existingUser) {
                    cacheHelpers.cacheUser(senderJid, {
                        jid: senderJid,
                        pushname,
                        lastSeen: Date.now(),
                        messageCount: 1
                    });
                } else {
                    existingUser.lastSeen = Date.now();
                    existingUser.messageCount = (existingUser.messageCount || 0) + 1;
                    existingUser.pushname = pushname;
                    cacheHelpers.cacheUser(senderJid, existingUser);
                }
            }

            const jid = msg.key.remoteJid || "Unknown";
            const timestamp = new Date((msg.messageTimestamp || Date.now()) * 1000).toLocaleString();
            const messageType = Object.keys(msg.message || {})[0] || "Unknown";

            console.log(
                chalk.bold.blue(`💌 Incoming Message`) + chalk.gray(` [⚡ Cached]`) + '\n' +
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
        const batchUpdates = [];
        
        for (const event of events) {
            try {
                let metadata = cacheHelpers.getGroup(event.id);
                
                if (!metadata) {
                    metadata = await sock.groupMetadata(event.id);
                }
                
                batchUpdates.push({ id: event.id, metadata });
            } catch (error) {
                console.error(`Error updating group ${event.id}:`, error);
            }
        }
        
        batchUpdates.forEach(({ id, metadata }) => {
            cacheHelpers.cacheGroup(id, metadata);
        });
        
        console.log(`⚡ Cached ${batchUpdates.length} group updates`);
    });

    sock.ev.on('group-participants.update', async event => {
        try {
            let metadata = cacheHelpers.getGroup(event.id);
            
            if (!metadata) {
                metadata = await sock.groupMetadata(event.id);
            }
            
            if (event.participants) {
                event.participants.forEach(participant => {
                    const existingUser = cacheHelpers.getUser(participant);
                    if (existingUser) {
                        existingUser.lastGroupActivity = Date.now();
                        existingUser.groupAction = event.action;
                        cacheHelpers.cacheUser(participant, existingUser);
                    }
                });
            }
            
            cacheHelpers.cacheGroup(event.id, metadata);
        } catch (error) {
            console.error(`Error in group participant update:`, error);
        }
    });

    setInterval(() => {
        const stats = cacheHelpers.getStats();
        console.log(chalk.cyan('⚡ Cache Stats:'), {
            totalKeys: stats.messages.keys + stats.users.keys + stats.groups.keys + stats.commands.keys,
            hitRate: `${Math.round((stats.messages.hits / (stats.messages.hits + stats.messages.misses)) * 100) || 0}%`,
            memoryUsage: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`
        });
    }, 300000);

    setInterval(() => {
        const memUsage = process.memoryUsage();
        const memUsageMB = memUsage.heapUsed / 1024 / 1024;
        
        if (memUsageMB > 500) {
            console.log(chalk.yellow('🧹 High memory usage detected, cleaning cache...'));
            lightningCache.emergencyClear();
        }
    }, 120000);

    return sock;
}

global.lightningCache = lightningCache;
global.cacheHelpers = cacheHelpers;

module.exports = { startWisteria };