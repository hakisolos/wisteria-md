import { getContentType, downloadContentFromMessage, jidNormalizedUser, downloadMediaMessage } from 'baileys';
import fs from 'fs';
import path from 'path';
import config from '../config.js';


import {
  imageToWebp,
  videoToWebp,
  writeExifImg,
  writeExifVid,
  writeExifWebp
} from './exif.js';

export async function serializeMessage(msg, sock) {
	if (!msg) return null;

	const m = {};
	
	
	m.key = msg.key;
	m.jid = msg.key.remoteJid;
	//m.fromMe = msg.key.fromMe;
	m.id = msg.key.id;
	m.isGroup = m.jid.endsWith('@g.us');

	const jidOwner = jidNormalizedUser(sock.user.id);
	const lidOwner = sock.user.lid ? jidNormalizedUser(sock.user.lid) : null;

	const rawSender = m.isGroup ? msg.key.participant : m.jid;
	m.sender = jidNormalizedUser(rawSender);

	m.fromMe = [jidOwner, lidOwner].includes(m.sender);
	m.senderName = msg.pushName || 'Unknown';
	m.pushName = msg.pushName || 'Unknown';
	m.client = sock;

	m.user = jidOwner;

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

		const rawSender = contextInfo?.participant;
		const quotedSender = jidNormalizedUser(rawSender);
		;

		const quotedMsg = {
			key: {
				remoteJid: m.jid,
				fromMe: [jidOwner, lidOwner].includes(quotedSender),
				id: contextInfo?.stanzaId,
				participant: quotedSender,
			},
			message: quoted,
		};


		m.quoted = {
			type: quotedType,
			content: quoted[quotedType],
			message: quoted,
			sender: quotedSender,
			pushname:
				quoted?.participant?.pushName || contextInfo?.pushName || 'Unknown',
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
			key: quotedMsg.key,
			isVV: Boolean(
				quoted?.viewOnceMessageV2 ||
				quoted?.viewOnceMessage ||
				quoted?.imageMessage?.viewOnce ||
				quoted?.videoMessage?.viewOnce
			),
			raw: quotedMsg,
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
			forward: async (jid, options = {}) => {
				try {
					const forwardMsg = {
						key: quotedMsg.key,
						message: quotedMsg.message,
					};

					return await sock.sendMessage(
						jid || m.jid,
						{ forward: forwardMsg },
						{ quoted: options.quoted || null }
					);
				} catch (error) {
					console.error('Error forwarding message:', error);
					return null;
				}
			}
		};
	}



	m.mentions = content?.extendedTextMessage?.contextInfo?.mentionedJid || [];
	m.mentions = m.mentions.map(jid => jidNormalizedUser(jid));

	m.sendMessage = async (content, opt = {}, type = 'text') => {
		try {
			switch (type.toLowerCase()) {
				case 'text': {
					return await sock.sendMessage(
						m.jid,
						{ text: content, ...opt },
						{ quoted: msg, ...opt }
					);
				}

				case 'image': {
					if (Buffer.isBuffer(content)) {
						return await sock.sendMessage(
							m.jid,
							{ image: content, ...opt },
							{ quoted: msg, ...opt }
						);
					} else if (
						typeof content === 'string' &&
						(content.startsWith('http://') || content.startsWith('https://'))
					) {
						return await sock.sendMessage(
							m.jid,
							{ image: { url: content }, ...opt },
							{ quoted: msg, ...opt }
						);
					}
					break;
				}

				case 'video': {
					if (Buffer.isBuffer(content)) {
						return await sock.sendMessage(
							m.jid,
							{ video: content, ...opt },
							{ quoted: msg, ...opt }
						);
					} else if (
						typeof content === 'string' &&
						(content.startsWith('http://') || content.startsWith('https://'))
					) {
						return await sock.sendMessage(
							m.jid,
							{ video: { url: content }, ...opt },
							{ quoted: msg, ...opt }
						);
					}
					break;
				}

				case 'audio': {
					if (Buffer.isBuffer(content)) {
						return await sock.sendMessage(
							m.jid,
							{ audio: content, ...opt },
							{ quoted: msg, ...opt }
						);
					} else if (
						typeof content === 'string' &&
						(content.startsWith('http://') || content.startsWith('https://'))
					) {
						return await sock.sendMessage(
							m.jid,
							{ audio: { url: content }, ...opt },
							{ quoted: msg, ...opt }
						);
					}
					break;
				}

				case 'template': {
					const { generateWAMessage } = require('baileys');
					let optional = await generateWAMessage(m.jid, content, {
						quoted: msg,
						...opt,
					});
					let message = {
						viewOnceMessage: {
							message: {
								...optional.message,
							},
						},
					};
					return await sock.relayMessage(m.jid, message, {
						messageId: optional.key.id,
					});
				}

				case 'react': {
					const { reactionText = '👍', messageKey = m.key } = content || {};

					return await sock.sendMessage(
						m.jid,
						{
							react: {
								text: reactionText,
								key: messageKey,
							},
						},
						{ quoted: msg }
					);
				}

				case 'sticker': {
					const { writeExifWebp } = require('./utilities/sticker');
					let data, mime;

					if (Buffer.isBuffer(content)) {
						data = content;

						if (content.length > 8) {
							if (
								content[0] === 0xff &&
								content[1] === 0xd8 &&
								content[2] === 0xff
							) {
								mime = 'image/jpeg';
							} else if (
								content[0] === 0x89 &&
								content[1] === 0x50 &&
								content[2] === 0x4e &&
								content[3] === 0x47
							) {
								mime = 'image/png';
							} else if (
								content[0] === 0x47 &&
								content[1] === 0x49 &&
								content[2] === 0x46
							) {
								mime = 'image/gif';
							} else if (
								content[8] === 0x57 &&
								content[9] === 0x45 &&
								content[10] === 0x42 &&
								content[11] === 0x50
							) {
								mime = 'image/webp';
							} else if (
								content[0] === 0x52 &&
								content[1] === 0x49 &&
								content[2] === 0x46 &&
								content[3] === 0x46
							) {
								mime = 'video/mp4';
							} else {
								mime = 'application/octet-stream';
							}
						}
					} else if (
						typeof content === 'string' &&
						(content.startsWith('http://') || content.startsWith('https://'))
					) {
						const fetch = require('node-fetch');
						const response = await fetch(content);
						data = Buffer.from(await response.arrayBuffer());
						mime = response.headers.get('content-type');
					} else {
						throw new Error('Invalid sticker content: Expected buffer or URL');
					}

					if (mime === 'image/webp') {
						const stickerOptions = {
							packname: opt.packname || 'Xasena',
							author: opt.author || 'X-electra',
							...opt,
						};

						let buff = await writeExifWebp(data, stickerOptions);
						return await sock.sendMessage(
							m.jid,
							{ sticker: { url: buff } },
							{ quoted: msg, ...opt }
						);
					} else {
						const mainType = mime.split('/')[0];

						if (mainType === 'image' || mainType === 'video') {
							const stickerOptions = {
								packname: opt.packname || 'Xasena',
								author: opt.author || 'X-electra',
								...opt,
							};

							if (typeof sock.sendImageAsSticker === 'function') {
								return await sock.sendImageAsSticker(
									m.jid,
									data,
									stickerOptions
								);
							} else {
								const { Sticker } = require('wa-sticker-formatter');
								const sticker = new Sticker(data, {
									pack: stickerOptions.packname,
									author: stickerOptions.author,
									type: mainType === 'video' ? 'full' : 'crop',
									categories: ['🤩', '🎉'],
									id: Date.now().toString(),
									quality: 50,
								});

								const stickerBuffer = await sticker.toBuffer();
								return await sock.sendMessage(
									m.jid,
									{ sticker: stickerBuffer },
									{ quoted: msg, ...opt }
								);
							}
						} else {
							throw new Error(`Unsupported media type for sticker: ${mime}`);
						}
					}
					break;
				}

				case 'document': {
					if (Buffer.isBuffer(content)) {
						const fileName = opt.fileName || `file_${Date.now()}.bin`;
						const mimetype = opt.mimetype || 'application/octet-stream';

						return await sock.sendMessage(
							m.jid,
							{
								document: content,
								mimetype: mimetype,
								fileName: fileName,
								...opt,
							},
							{ quoted: msg, ...opt }
						);
					} else if (
						typeof content === 'string' &&
						(content.startsWith('http://') || content.startsWith('https://'))
					) {
						const fileName =
							opt.fileName ||
							content.split('/').pop() ||
							`file_${Date.now()}.bin`;
						const mimetype = opt.mimetype || 'application/octet-stream';

						return await sock.sendMessage(
							m.jid,
							{
								document: { url: content },
								mimetype: mimetype,
								fileName: fileName,
								...opt,
							},
							{ quoted: msg, ...opt }
						);
					}
					break;
				}

				default:
					throw new Error(`Unsupported message type: ${type}`);
			}
		} catch (error) {
			console.error(`Error in sendMessage (${type}):`, error);
			throw error;
		}
	};

	m.reply = async text => {
		return await sock.sendMessage(m.key.remoteJid, { text }, { quoted: msg });
	};

	m.send = async text => {
		return await sock.sendMessage(m.key.remoteJid, { text });
	};

	m.react = async emoji => {
		return await sock.sendMessage(m.jid, {
			react: {
				text: emoji,
				key: m.key,
			},
		});
	};
	





	m.block = async jid => {
		return await sock.updateBlockStatus(jid, 'block');
	};

	m.unblock = async jid => {
		return await sock.updateBlockStatus(jid, 'unblock');
	};

	m.delete = async (jid, key) => {
		return sock.sendMessage(jid, { delete: key });
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
						renderLargerThumbnail: true,
						thumbnailUrl: 'https://files.catbox.moe/z0k3fv.jpg',
					},
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

