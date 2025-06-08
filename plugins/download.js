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

