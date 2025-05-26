/** @format */

const { nikka, extractUrls } = require('../lib');
const axios = require('axios');
const yts = require('yt-search');
const dl = require("../lib/utilities/dl")

nikka(
	{
		pattern: 'song',
		desc: 'download yt music',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const q = match; 
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);
		const url = await dl(q, "mp3")
		await m.client.sendMessage(m.jid, {
			audio: { url: url },
			mimetype: 'audio/mp4',
			quoted: m.raw
		});
		
		
	}
);

nikka(
	{
		pattern: 'video',
		desc: 'download yt vid',
		public: false,
		category: 'download',
		react: true,
	},
	async (m, { match }) => {
		const q = match; 
		if (!match)
			return m.reply(`hey ${m.pushName}, provide a youtube url to download`);
		const url = await dl(q, "720")
		await m.client.sendMessage(m.jid, {
			audio: { url: url },
			mimetype: 'video/mp4',
			quoted: m.raw
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
						buttonId: `${m.prefix}song ${url}`,
						buttonText: {
							displayText: 'audio',
						},
						type: 1,
					},
					{
						buttonId: `${m.prefix}video ${url}`,
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
