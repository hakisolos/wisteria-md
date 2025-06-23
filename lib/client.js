const { 
    useMultiFileAuthState, 
    DisconnectReason, 
    makeWASocket,
    makeCacheableSignalKeyStore,
    Browsers,
    fetchLatestBaileysVersion 
} = require('baileys');
const chalk = require('chalk');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const fs = require('fs');
const { HttpsProxyAgent } = require('https-proxy-agent');
const { File } = require("megajs");
const { serializeMessage } = require('./serialize');
const { loadCommands } = require('./cmd');
const handleMessage = require('./handlemessage');
const conn = require('./mongodb');
const config = require('../config');

global.sock = null;

let connectionState = {
    isConnected: false,
    lastConnected: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5
};

const logger = {
    info: (msg, data = '') => console.log(chalk.blue('ℹ️ '), chalk.white(msg), data),
    success: (msg, data = '') => console.log(chalk.green('✅'), chalk.white(msg), data),
    warning: (msg, data = '') => console.log(chalk.yellow('⚠️ '), chalk.white(msg), data),
    error: (msg, error = '') => console.log(chalk.red('❌'), chalk.white(msg), error?.message || error)
};

async function handleSessionSetup() {
    const sessionPath = "./lib/session/";
    const credsPath = sessionPath + "creds.json";
    const sessionPrefix = "WMDx";

    try {
        if (config.PRINT_QR || fs.existsSync(credsPath)) {
            return logger.info("Session setup skipped - QR mode or existing session");
        }

        if (!config.SESSION_ID?.startsWith(sessionPrefix)) {
            throw new Error("Invalid session ID format. Must start with " + sessionPrefix);
        }

        logger.info("Downloading session from MEGA...");
        
        const megaId = config.SESSION_ID.replace(sessionPrefix, "");
        const megaUrl = `https://mega.nz/file/${megaId}`;
        const file = File.fromURL(megaUrl);
        
        await file.loadAttributes();
        
        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }
        
        const sessionData = await file.downloadBuffer();
        fs.writeFileSync(credsPath, sessionData);
        
        logger.success("Session downloaded successfully");
        
    } catch (error) {
        logger.error("Session setup failed:", error);
        throw error;
    }
}

function setupConnectionHandlers(sock, saveCreds) {
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr && config.PRINT_QR) {
            const QRCode = require('qrcode-terminal');
            QRCode.generate(qr, { small: true });
            logger.info("QR Code generated - scan to connect");
        }

        if (connection === 'close') {
            await handleDisconnection(lastDisconnect);
        }

        if (connection === 'open') {
            await handleSuccessfulConnection(sock);
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

async function handleDisconnection(lastDisconnect) {
    connectionState.isConnected = false;
    connectionState.reconnectAttempts++;
    
    const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
    const reasonText = getDisconnectReason(reason);
    
    logger.warning(`Connection closed: ${reasonText}`);
    
    switch (reason) {
        case DisconnectReason.badSession:
        case DisconnectReason.loggedOut:
            logger.warning("Clearing session due to bad session/logout");
            try {
                fs.rmSync('./lib/session', { recursive: true, force: true });
            } catch (error) {
                logger.error("Error clearing session:", error);
            }
            break;
        default:
            break;
    }
    
    if (connectionState.reconnectAttempts > connectionState.maxReconnectAttempts) {
        logger.warning("Too many reconnection attempts");
        connectionState.reconnectAttempts = 0;
    }
    
    logger.info(`Reconnecting... (Attempt ${connectionState.reconnectAttempts})`);
    setTimeout(() => startNik(), 5000);
}

async function handleSuccessfulConnection(sock) {
    connectionState.isConnected = true;
    connectionState.lastConnected = Date.now();
    connectionState.reconnectAttempts = 0;
    
    const jid = sock.user.id;
    const botName = sock.user.name || 'Wisteria Bot';
    
    logger.success(`Connected as: ${botName} (${jid})`);
    
    try {
        await sock.sendMessage(jid, {
            image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
            caption: `Wistera MD Connected Successfully\n🕒 ${new Date().toLocaleString()}`,
        });
        
        logger.success("Connection notification sent");
    } catch (error) {
        logger.error("Failed to send connection notification:", error);
    }
}

function getDisconnectReason(code) {
    const reasons = {
        [DisconnectReason.badSession]: 'Bad Session',
        [DisconnectReason.connectionClosed]: 'Connection Closed',
        [DisconnectReason.connectionLost]: 'Connection Lost',
        [DisconnectReason.connectionReplaced]: 'Connection Replaced',
        [DisconnectReason.loggedOut]: 'Logged Out',
        [DisconnectReason.restartRequired]: 'Restart Required',
        [DisconnectReason.timedOut]: 'Timed Out'
    };
    return reasons[code] || `Unknown (${code})`;
}

function setupMessageHandlers(sock) {
    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (m.type !== 'notify' || !msg) return;

            const serialized = serializeMessage(msg, sock);
            if (!serialized) return;

            logIncomingMessage(msg);
            await handleMessage(serialized);
            
        } catch (error) {
            logger.error('Message processing error:', error);
        }
    });

    
}

function logIncomingMessage(msg) {
    const jid = msg.key.remoteJid || "Unknown";
    const pushname = msg.pushName || "Unknown";
    const timestamp = new Date((msg.messageTimestamp || Date.now()) * 1000).toLocaleString();
    const messageType = Object.keys(msg.message || {})[0] || "Unknown";

    console.log(
        chalk.blue('💌 Message') + '\n' +
        chalk.green('   From: ') + chalk.yellow(pushname) + '\n' +
        chalk.green('   Chat: ') + chalk.cyan(jid) + '\n' +
        chalk.green('   Type: ') + chalk.red(messageType) + '\n' +
        chalk.green('   Time: ') + chalk.magenta(timestamp) + '\n' +
        chalk.gray('─'.repeat(40))
    );
}

function setupGroupHandlers(sock) {
    sock.ev.on('groups.update', async (events) => {
        const batchUpdates = [];
        
        for (const event of events) {
            try {
                const metadata = await sock.groupMetadata(event.id);
                batchUpdates.push({ id: event.id, metadata });
            } catch (error) {
                logger.error(`Group update error (${event.id}):`, error);
            }
        }
    });

    sock.ev.on('group-participants.update', async (event) => {
        try {
            const metadata = await sock.groupMetadata(event.id);
        } catch (error) {
            logger.error('Group participant update error:', error);
        }
    });
}

function setupPeriodicTasks(sock) {
    setInterval(async () => {
        try {
            if (!connectionState.isConnected) return;
            const groups = await sock.groupFetchAllParticipating();
        } catch (error) {
            logger.error('Group fetching error:', error);
        }
    }, 60000);

    setInterval(() => {
        const memUsage = process.memoryUsage();
        const memUsageMB = memUsage.heapUsed / 1024 / 1024;
        
        if (memUsageMB > 500) {
            logger.warning(`High memory usage (${Math.round(memUsageMB)}MB)`);
        }
    }, 120000);
}

async function startNik() {
    try {
        logger.info("Starting...");
        
        require("events").EventEmitter.defaultMaxListeners = 50;
        
        const { version } = await fetchLatestBaileysVersion();
        logger.info(`Using Baileys version: ${version.join('.')}`);
        
        await Promise.all([
          
            conn(),
            loadCommands()
        ]);
        logger.success("Core modules initialized");
        
        await handleSessionSetup();
        
        const { state, saveCreds } = await useMultiFileAuthState('./lib/session');
        
        sock = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys),
            },
            agent: config.PROXY ? new HttpsProxyAgent(config.PROXY) : undefined,
            version,
            printQRInTerminal: config.PRINT_QR || false,
            keepAliveIntervalMs: 30000,
            logger: pino({ level: 'fatal' }).child({ level: 'fatal' }),
            browser: Browsers.macOS("Safari"),
            syncFullHistory: false,
            emitOwnEvents: true,
            generateHighQualityLinkPreview: true,
            linkPreviewImageThumbnailWidth: 1920,
            markOnlineOnConnect: true
        });
        
      
       
        
        setupConnectionHandlers(sock, saveCreds);
        setupMessageHandlers(sock);
        setupGroupHandlers(sock);
        setupPeriodicTasks(sock);
        
        logger.success("Wistera setup completed");
        return sock;
        
    } catch (error) {
        logger.error("Failed to start  Bot:", error);
        
        setTimeout(() => {
            logger.info("Retrying bot startup...");
            startNik();
        }, 10000);
    }
}

module.exports = { startNik };