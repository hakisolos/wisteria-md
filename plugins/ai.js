/** @format */

const { nikka } = require('../lib/cmd');
const axios = require('axios');
const { AI } = require('../lib');
const {
	enableChatbot,
	disableChatbot,
	isChatbotEnabled,
} = require('../lib/database/chatbot');

nikka(
	{
		pattern: 'chatbot',
		desc: 'enable/disable chatbot',
		public: false,
		react: true,
		category: 'ai',
	},
	async (m, { match }) => {
		if (!match)
			return m.reply(`Use ${m.prefix}chatbot on or ${m.prefix}chatbot off`);
		const cmd = match.toLowerCase();
		if (cmd === 'on') {
			await enableChatbot(m.jid);
			return await m.react('✅');
		} else if (cmd === 'off') {
			await disableChatbot(m.jid);
			return await m.react('✅');
		} else {
			return await m.reply(
				`Invalid option! Use ${m.prefix}chatbot on or ${m.prefix}chatbot off`
			);
		}
	}
);

nikka(
	{
		pattern: 'gemini',
		desc: 'gemini ai',
		public: true,
		react: true,
	},
	async (m, { match }) => {
		const q = match.trim();
		if (!q) return m.reply(`_hello ${m.pushName}, provide a query_`);

		const res = await AI.gemini(q);

		const messageContent = {
			text: res.trim(),
			contextInfo: {
				externalAdReply: {
					title: 'Gemini-Ai',
					body: 'wisteria-md',
					mediaType: 1,
					thumbnailUrl: 'https://files.catbox.moe/wghj8h.jpg',
					sourceUrl: 'https://gemini.com',
					renderLargerThumbnail: false,
					showAdAttribution: true,
				},
			},
		};

		return await m.client.sendMessage(m.jid, messageContent);
	}
);

nikka(
	{
		pattern: 'grok',
		desc: 'groq ai',
		public: true,
		react: true,
	},
	async (m, { match }) => {
		const q = match.trim();
		if (!q) return m.reply(`_hello ${m.pushName}, provide a query_`);

		const res = await AI.groq(q);

		const messageContent = {
			text: res.trim(),
			contextInfo: {
				externalAdReply: {
					title: 'GROK-Ai',
					body: 'wisteria-md',
					mediaType: 1,
					thumbnailUrl: 'https://files.catbox.moe/tjrwt8.jpg',
					sourceUrl: 'https://gemini.com',
					renderLargerThumbnail: false,
					showAdAttribution: true,
				},
			},
		};

		return await m.client.sendMessage(m.jid, messageContent);
	}
);

nikka(
	{
		pattern: 'llama',
		desc: 'llama ai',
		public: true,
		react: true,
	},
	async (m, { match }) => {
		const q = match.trim();
		if (!q) return m.reply(`_hello ${m.pushName}, provide a query_`);

		const res = await AI.llama(q);

		const messageContent = {
			text: res.trim(),
			contextInfo: {
				externalAdReply: {
					title: 'Llama-Ai',
					body: 'wisteria-md',
					mediaType: 1,
					thumbnailUrl: 'https://files.catbox.moe/yq1d4x.jpg',
					sourceUrl: 'https://llama.com',
					renderLargerThumbnail: false,
					showAdAttribution: true,
				},
			},
		};

		return await m.client.sendMessage(m.jid, messageContent);
	}
);

nikka(
	{
		pattern: 'meta',
		desc: 'meta ai',
		public: true,
		react: true,
	},
	async (m, { match }) => {
		const q = match.trim();
		if (!q) return m.reply(`_hello ${m.pushName}, provide a query_`);

		const res = await AI.meta(q);

		const messageContent = {
			text: res.trim(),
			contextInfo: {
				externalAdReply: {
					title: 'Meta-Ai',
					body: 'wisteria-md',
					mediaType: 1,
					thumbnailUrl: 'https://files.catbox.moe/7ko4ax.jpg',
					sourceUrl: 'https://meta.com',
					renderLargerThumbnail: false,
					showAdAttribution: true,
				},
			},
		};

		return await m.client.sendMessage(m.jid, messageContent);
	}
);

nikka(
	{
		pattern: 'dalle',
		desc: 'dalle ai',
		public: true,
		react: true,
	},
	async (m, { match }) => {
		const q = match.trim();
		if (!q) return m.reply(`_hello ${m.pushName}, provide a query_`);

		const res = await AI.dalle(q);

		const messageContent = {
			text: res.trim(),
			contextInfo: {
				externalAdReply: {
					title: 'Dalle-Ai',
					body: 'wisteria-md',
					mediaType: 1,
					thumbnailUrl: 'https://files.catbox.moe/7ko4ax.jpg',
					sourceUrl: 'https://openai.com/dall-e',
					renderLargerThumbnail: false,
					showAdAttribution: true,
				},
			},
		};

		return await m.client.sendMessage(m.jid, messageContent);
	}
);
