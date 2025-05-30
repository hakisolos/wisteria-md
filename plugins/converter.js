/** @format */

const fs = require('fs');
const { nikka } = require('../lib');
const {
	imageToWebp,
	videoToWebp,
	writeExifImg,
	writeExifVid,
} = require('../lib/utilities/sticker'); // Update with actual path
const { writeExifWebp } = require('baileys');

nikka(
	{
		pattern: 'stk',
		desc: 'stk',
		category: 'converter',
		react: true,
	},
	async m => {
		try {
			// Download the media from the quoted message
			let buff = await m.quoted.download();

			// Check if the media is a video or image
			const isVideo =
				m.quoted.message?.videoMessage ||
				m.quoted.message?.documentMessage?.mimetype?.startsWith('video');

			let stickerBuffer;

			if (isVideo) {
				// For video, convert to webp and add metadata
				const processedPath = await writeExifVid(buff, {
					packname: 'H4KI',
					author: 'XER',
					categories: ['😎'],
				});
				stickerBuffer = fs.readFileSync(processedPath);
				// Clean up the temporary file
				fs.unlinkSync(processedPath);
			} else {
				// For image, convert to webp and add metadata
				const processedPath = await writeExifImg(buff, {
					packname: 'H4KI',
					author: 'XER',
					categories: ['😎'],
				});
				stickerBuffer = fs.readFileSync(processedPath);
				// Clean up the temporary file
				fs.unlinkSync(processedPath);
			}

			// Send the sticker
			await global.sock.sendMessage(
				m.jid,
				{ sticker: stickerBuffer },
				{ quoted: m }
			);
		} catch (error) {
			console.error('Error creating sticker:', error);
			await m.reply('Failed to create sticker. Error: ' + error.message);
		}
	}
);

nikka(
	{
		pattern: 'vv',
		desc: 'open vv',
		category: 'converter',
		react: true,
	},
	async m => {
		if (!m.quoted)
			return m.reply(
				`uhh ${m.pushName}, please reply an image/video with ${m.prefix}vv`
			);
		if (!m.quoted.isVV)
			return m.reply(
				`uhh ${m.pushName}, please reply an image/video with ${m.prefix}vv`
			);

		const buff = await m.quoted.download();
		const um = await m.upload(buff);

		await sock.sendMessage(m.jid, {
			image: {
				url: um,
			},
			viewOnce: false,
			caption: m.quoted.text || null,
		});
	}
);
nikka(
	{
		pattern: 'vv',
		desc: 'open vv',
		category: 'converter',
		react: true,
	},
	async m => {
		if (!m.quoted)
			return m.reply(
				`uhh ${m.pushName}, please reply an image/video with ${m.prefix}vv`
			);
		if (!m.quoted.isVV)
			return m.reply(
				`uhh ${m.pushName}, please reply an image/video with ${m.prefix}vv`
			);

		const buff = await m.quoted.download();
		const um = await m.upload(buff);

		await sock.sendMessage(m.jid, {
			image: {
				url: um,
			},
			viewOnce: false,
			caption: m.quoted.text || null,
		});
	}
);
