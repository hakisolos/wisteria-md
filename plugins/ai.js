/** @format */
import { nikka } from '../lib/cmd.js';
import axios from 'axios';
import { AI } from '../lib/index.js';
import {
	enableChatbot,
	disableChatbot,
	isChatbotEnabled,
} from '../lib/database/chatbot.js';



nikka(
	{
		pattern: 'gemini',
		desc: 'gemini ai',
		public: true,
		react: true,
		category: 'ai',
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
		category: 'ai',
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
		category: 'ai',
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
		category: 'ai',
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
		category: 'ai',
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

