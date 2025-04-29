/** @format */

const {
	getContentType,
	downloadContentFromMessage,
	jidNormalizedUser,
	downloadMediaMessage,
} = require('@im-dims/baileys-md');
const fs = require('fs');
const path = require('path');
const config = require('../config');

function serializeMessage(msg, sock) {
	if (!msg) return null;

	const m = {};

	m.key = msg.key;
	m.jid = msg.key.remoteJid;
	m.fromMe = msg.key.fromMe;
	m.id = msg.key.id;
	m.isGroup = m.jid.endsWith('@g.us');

	m.sender = m.fromMe
		? jidNormalizedUser(sock.user.id)
		: m.isGroup
		? jidNormalizedUser(msg.key.participant)
		: jidNormalizedUser(m.jid);

	m.senderName = msg.pushName || 'Unknown';
	m.pushName = msg.pushName || 'Unknown';
	m.client = sock;

	m.user = jidNormalizedUser(sock.user.id);

	m.prefix = config.PREFIX;

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

		// Create a complete quoted message object for forwarding
		const quotedMsg = {
			key: {
				remoteJid: m.jid,
				fromMe: contextInfo?.participant === m.user,
				id: contextInfo?.stanzaId,
				participant: contextInfo?.participant
					? jidNormalizedUser(contextInfo.participant)
					: undefined,
			},
			message: quoted,
		};

		m.quoted = {
			type: quotedType,
			content: quoted[quotedType],
			message: quoted, // Store the full quoted message object
			sender: jidNormalizedUser(contextInfo?.participant),
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
			key: {
				remoteJid: m.jid,
				fromMe: contextInfo?.participant === m.user,
				id: contextInfo?.stanzaId,
				participant: jidNormalizedUser(contextInfo?.participant),
			},
			isVV: Boolean(
				quoted?.viewOnceMessageV2 ||
					quoted?.viewOnceMessage ||
					quoted?.imageMessage?.viewOnce ||
					quoted?.videoMessage?.viewOnce
			),
			raw: quotedMsg, // Full quoted message for forwarding
			// Enhanced download
			download: async () => {
				if (
					!quoted ||
					![
						'imageMessage',
						'videoMessage',
						'audioMessage',
						'stickerMessage',
						'documentMessage',
					].includes(quotedType)
				) {
					return null;
				}

				try {
					const buffer = await downloadMediaMessage(
						quotedMsg,
						'buffer',
						{},
						{
							reuploadRequest: sock.updateMediaMessage,
						}
					);

					return buffer;
				} catch (error) {
					console.error('Error downloading media:', error);
					return null;
				}
			},
		};

		// Add forward method to quoted object
		m.quoted.forward = async (jid, options = {}) => {
			try {
				const forwardMsg = {
					key: quotedMsg.key,
					message: quotedMsg.message,
				};

				// Forward the message to the specified jid
				return await sock.sendMessage(
					jid || m.jid,
					{ forward: forwardMsg },
					{ quoted: options.quoted || null }
				);
			} catch (error) {
				console.error('Error forwarding message:', error);
				return null;
			}
		};
	}

	m.mentions = content?.extendedTextMessage?.contextInfo?.mentionedJid || [];
	m.mentions = m.mentions.map(jid => jidNormalizedUser(jid));

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

	m.payment = async text => {
		return await sock.sendMessage(
			m.jid,
			{
				requestPayment: {
					currency: 'IDR',
					amount: '1',
					from: m.sender,
					note: text,
					background: {
						id: '100',
						fileLength: 928283,
						width: '1000',
						height: '1000',
						mimetype: 'image/webp',
						placeholderArgb: '0xFF000000',
						textArgb: 4294967295,
						subtextArgb: 4278190080,
					},
				},
			},
			{ quoted: msg }
		);
	};
	m.sendFile = async (bufferOrUrl, caption = '', mimetype = '') => {
		try {
			if (
				typeof bufferOrUrl === 'string' &&
				(bufferOrUrl.startsWith('http://') ||
					bufferOrUrl.startsWith('https://'))
			) {
				if (!mimetype) {
					const extension = bufferOrUrl.split('.').pop()?.toLowerCase();
					if (extension) {
						if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
							mimetype = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
						} else if (['mp4', 'mov', 'avi', 'mkv'].includes(extension)) {
							mimetype = `video/${extension}`;
						} else if (['mp3', 'ogg', 'wav', 'opus'].includes(extension)) {
							mimetype = `audio/${extension}`;
						} else if (extension === 'pdf') {
							mimetype = 'application/pdf';
						} else {
							mimetype = 'application/octet-stream';
						}
					} else {
						mimetype = 'application/octet-stream';
					}
				}

				if (mimetype.startsWith('image/')) {
					return await sock.sendMessage(
						m.jid,
						{ image: { url: bufferOrUrl }, caption },
						{ quoted: msg }
					);
				} else if (mimetype.startsWith('video/')) {
					return await sock.sendMessage(
						m.jid,
						{ video: { url: bufferOrUrl }, caption },
						{ quoted: msg }
					);
				} else if (mimetype.startsWith('audio/')) {
					return await sock.sendMessage(
						m.jid,
						{ audio: { url: bufferOrUrl }, mimetype },
						{ quoted: msg }
					);
				} else if (mimetype === 'image/webp') {
					return await sock.sendMessage(
						m.jid,
						{ sticker: { url: bufferOrUrl } },
						{ quoted: msg }
					);
				} else {
					return await sock.sendMessage(
						m.jid,
						{
							document: { url: bufferOrUrl },
							mimetype,
							fileName: bufferOrUrl.split('/').pop(),
						},
						{ quoted: msg }
					);
				}
			} else if (Buffer.isBuffer(bufferOrUrl)) {
				if (!mimetype) {
					try {
						const FileType = require('file-type');
						const fileTypeResult = await FileType.fromBuffer(bufferOrUrl);
						mimetype = fileTypeResult?.mime || 'application/octet-stream';
					} catch (err) {
						if (bufferOrUrl.length > 8) {
							if (
								bufferOrUrl[0] === 0xff &&
								bufferOrUrl[1] === 0xd8 &&
								bufferOrUrl[2] === 0xff
							) {
								mimetype = 'image/jpeg';
							} else if (
								bufferOrUrl[0] === 0x89 &&
								bufferOrUrl[1] === 0x50 &&
								bufferOrUrl[2] === 0x4e &&
								bufferOrUrl[3] === 0x47
							) {
								mimetype = 'image/png';
							} else if (
								bufferOrUrl[0] === 0x47 &&
								bufferOrUrl[1] === 0x49 &&
								bufferOrUrl[2] === 0x46
							) {
								mimetype = 'image/gif';
							} else if (
								bufferOrUrl[8] === 0x57 &&
								bufferOrUrl[9] === 0x45 &&
								bufferOrUrl[10] === 0x42 &&
								bufferOrUrl[11] === 0x50
							) {
								mimetype = 'image/webp';
							} else {
								mimetype = 'application/octet-stream';
							}
						} else {
							mimetype = 'application/octet-stream';
						}
					}
				}

				if (mimetype.startsWith('image/') && mimetype !== 'image/webp') {
					return await sock.sendMessage(
						m.jid,
						{ image: bufferOrUrl, caption },
						{ quoted: msg }
					);
				} else if (mimetype.startsWith('video/')) {
					return await sock.sendMessage(
						m.jid,
						{ video: bufferOrUrl, caption },
						{ quoted: msg }
					);
				} else if (mimetype.startsWith('audio/')) {
					return await sock.sendMessage(
						m.jid,
						{ audio: bufferOrUrl, mimetype },
						{ quoted: msg }
					);
				} else if (mimetype === 'image/webp') {
					return await sock.sendMessage(
						m.jid,
						{ sticker: bufferOrUrl },
						{ quoted: msg }
					);
				} else {
					return await sock.sendMessage(
						m.jid,
						{
							document: bufferOrUrl,
							mimetype,
							fileName: `file_${Date.now()}.${mimetype.split('/')[1] || 'bin'}`,
						},
						{ quoted: msg }
					);
				}
			} else {
				throw new Error('Invalid input: Expected buffer or URL');
			}
		} catch (error) {
			console.error('Error sending file:', error);
			return null;
		}
	};

	m.upload = async buffer => {
		try {
			const FormData = require('form-data');
			const fetch = require('node-fetch');
			const MAX_FILE_SIZE_MB = 200;

			if (!Buffer.isBuffer(buffer)) {
				throw new Error('Invalid input: Expected a buffer');
			}

			const fileSizeMB = buffer.length / (1024 * 1024);
			if (fileSizeMB > MAX_FILE_SIZE_MB) {
				throw new Error(
					`File size exceeds the limit of ${MAX_FILE_SIZE_MB}MB.`
				);
			}

			const fileTypeModule = await import('file-type');
			const type = await fileTypeModule.fileTypeFromBuffer(buffer);
			const ext = type ? type.ext : 'bin';

			const bodyForm = new FormData();
			bodyForm.append('fileToUpload', buffer, `file.${ext}`);
			bodyForm.append('reqtype', 'fileupload');

			const res = await fetch('https://catbox.moe/user/api.php', {
				method: 'POST',
				body: bodyForm,
			});

			if (!res.ok) {
				throw new Error(
					`Upload failed with status ${res.status}: ${res.statusText}`
				);
			}

			const mediaUrl = await res.text();
			if (!mediaUrl.startsWith('http')) {
				throw new Error('Invalid response from server.');
			}

			return mediaUrl;
		} catch (error) {
			console.error('Error during media upload:', error);
			return null;
		}
	};

	m.adReply = async text => {
		var quot = [
			{
				key: {
					remoteJid: 'status@broadcast',
					fromMe: false,
					participant: '0@s.whatsapp.net',
				},
				message: {
					contactMessage: {
						displayName: 'Wisteria-md ㋚',
						vcard:
							'BEGIN:VCARD\nVERSION:3.0\nN:' +
							'haki' +
							'\nFN:' +
							'haki' +
							'\nitem1.TEL;waid=919747257996:919747257996\nitem1.X-ABLabel:Click To Chat\nitem2.EMAIL;type=INTERNET:GitHub: hakisolos\nitem2.X-ABLabel:Follow Me On Github\nitem3.URL:YouTube: hakisolos\nitem3.X-ABLabel:Youtube\nitem4.ADR:;;UAE, Dubai;;;;\nitem4.X-ABLabel:Region\nEND:VCARD',
					},
				},
			},
		];
		let wist = quot[Math.floor(Math.random() * quot.length)];
		let readMore = String.fromCharCode(8206).repeat(4001);
		await sock.sendMessage(
			m.jid,
			{
				text: text,
				contextInfo: {
					externalAdReply: {
						title: 'nikka ࿊',
						body: '',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/z0k3fv.jpg',
					},
				},
			},
			{ quoted: wist }
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
