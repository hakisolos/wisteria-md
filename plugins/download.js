/** @format */

const { nikka, extractUrls } = require('../lib');
const axios = require('axios');
const yts = require('yt-search');

nikka(
	{
		pattern: 'ytmp3',
		desc: 'download yt music',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const url = match; //|| extractUrls(m.quoted.text);
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);
		const response = await axios.get(
			`https://kord-api.vercel.app/yt-song?url=${url}`
		);
		const res = response.data;
		const details = {
			//image: res.thumbnail,
			title: res.Title,
			url: res.fileUrl,
		};
		await m.client.sendMessage(m.jid, {
			audio: { url: details.url },
			mimetype: 'audio/mpeg',
			ptt: false,
			contextInfo: {
				externalAdReply: {
					title: details.title,
					body: 'powered by Nikka Tech ',
					sourceUrl: 'https://whatsapp.co m/channel/0029VaoLotu42DchJmXKBN3L',
					mediaUrl: url,
					mediaType: 1,
					showAdAttribution: true,
					renderLargerThumbnail: false,
					thumbnailUrl: 'https://files.catbox.moe/z0k3fv.jpg',
				},
			},
		});
	}
);

nikka(
	{
		pattern: 'ytmp4',
		desc: 'download yt vid',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const url = match;
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);

		const response = await axios.get(
			`https://kord-api.vercel.app/ytmp4?url=${url}&quality=360`
		);
		const res = response.data.data; // ✅ Corrected line

		const details = {
			title: res.title,
			url: res.downloadUrl,
		};

		await m.client.sendMessage(m.jid, {
			video: { url: details.url },
			mimetype: 'video/mp4',
			ptt: false,
			contextInfo: {
				externalAdReply: {
					title: details.title,
					body: 'powered by Nikka Tech ',
					sourceUrl: 'https://whatsapp.com/channel/0029VaoLotu42DchJmXKBN3L',
					mediaUrl: url,
					mediaType: 1,
					showAdAttribution: true,
					renderLargerThumbnail: false,
					thumbnailUrl: 'https://files.catbox.moe/z0k3fv.jpg',
				},
			},
		});
	}
);

nikka(
	{
		pattern: 'play',
		desc: 'play music',
		category: 'general',
		react: true,
	},
	async (m, { match }) => {
		if (!match)
			return m.reply(`hello ${m.pushName}, what am i playing for you today`);
		const fek = await yts(match.trim());
		const url = fek.all[0].url;
		await sock.sendMessage(
			m.jid,
			{
				text: 'Choose one:',
				footer: 'With love ❤️ from Nikka',
				buttons: [
					{
						buttonId: `${m.prefix}ytmp3 ${url}`,
						buttonText: {
							displayText: 'audio',
						},
						type: 1,
					},
					{
						buttonId: `${m.prefix}ytmp4 ${url}`,
						buttonText: {
							displayText: 'video',
						},
						type: 1,
					},
				],
				headerType: 1,
				viewOnce: true,
			},
			{ quoted: null }
		);
	}
);
