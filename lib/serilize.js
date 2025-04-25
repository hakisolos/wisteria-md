/** @format */
const {
	getContentType,
	downloadContentFromMessage,
} = require('@im-dims/baileys-md');
const fs = require('fs');
const path = require('path');

function serializeMessage(msg, sock) {
	if (!msg) return null;

	const m = {};

	m.key = msg.key;
	m.jid = msg.key.remoteJid;
	m.fromMe = msg.key.fromMe;
	m.id = msg.key.id;
	m.isGroup = m.jid.endsWith('@g.us');
	m.sender = m.fromMe ? sock.user.id : m.isGroup ? msg.key.participant : m.jid;
	m.senderName = msg.pushName || 'Unknown';
	m.pushName = msg.pushName || 'Unknown';
	m.client = sock;
	m.user = sock.user.id;

	const content = msg.message || {};
	m.type = getContentType(content) || '';
	m.body =
		m.type === 'conversation'
			? content.conversation
			: m.type === 'extendedTextMessage'
			? content.extendedTextMessage?.text
			: m.type === 'imageMessage'
			? content.imageMessage?.caption
			: m.type === 'videoMessage'
			? content.videoMessage?.caption
			: '';

	m.raw = msg;
	m.content = content;

	m.quoted = null;
	const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage;
	if (quoted) {
		const quotedType = getContentType(quoted);
		const contextInfo = content?.extendedTextMessage?.contextInfo;

		m.quoted = {
			type: quotedType,
			content: quoted[quotedType],
			sender: contextInfo?.participant,
			text:
				quotedType === 'conversation'
					? quoted.conversation
					: quotedType === 'extendedTextMessage'
					? quoted.extendedTextMessage?.text
					: quotedType === 'imageMessage'
					? quoted.imageMessage?.caption
					: quotedType === 'videoMessage'
					? quoted.videoMessage?.caption
					: '',
			// Add the key information for the quoted message
			key: {
				remoteJid: m.jid,
				fromMe: contextInfo?.participant === sock.user.id,
				id: contextInfo?.stanzaId,
				participant: contextInfo?.participant,
			},
		};
	}

	m.mentions = content?.extendedTextMessage?.contextInfo?.mentionedJid || [];

	m.reply = async text => {
		return await sock.sendMessage(m.jid, { text }, { quoted: msg });
	};

	m.send = async text => {
		return await sock.sendMessage(m.jid, { text });
	};

	m.react = async emoji => {
		return await sock.sendMessage(m.jid, {
			react: {
				text: emoji,
				key: m.key,
			},
		});
	};
	m.sendPollResult = async ({ name, values }) => {
		return await sock.sendMessage(
			m.jid,
			{
				pollResult: {
					name: name,
					values: values,
				},
			},
			{ quoted: msg }
		);
	};

	m.downloadMedia = async () => {
		if (
			![
				'imageMessage',
				'videoMessage',
				'audioMessage',
				'stickerMessage',
				'documentMessage',
			].includes(m.type)
		) {
			return null;
		}

		const stream = await downloadContentFromMessage(
			content[m.type],
			m.type.replace('Message', '')
		);

		let buffer = Buffer.from([]);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}

		const filename = `${Date.now()}.${getMediaExtension(m.type)}`;
		const filepath = path.join(process.cwd(), 'media', filename);

		if (!fs.existsSync(path.join(process.cwd(), 'media'))) {
			fs.mkdirSync(path.join(process.cwd(), 'media'), { recursive: true });
		}

		fs.writeFileSync(filepath, buffer);
		return {
			buffer,
			filename,
			filepath,
			mimetype: content[m.type].mimetype,
		};
	};

	return m;
}

function getMediaExtension(type) {
	switch (type) {
		case 'imageMessage':
			return 'jpg';
		case 'videoMessage':
			return 'mp4';
		case 'audioMessage':
			return 'mp3';
		case 'documentMessage':
			return 'bin';
		case 'stickerMessage':
			return 'webp';
		default:
			return 'bin';
	}
}

module.exports = { serializeMessage };
