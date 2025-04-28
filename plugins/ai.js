/** @format */

const { nikka } = require('../lib/cmd');
const axios = require('axios');
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
		if (match.toLowerCase() === 'on') {
			await enableChatbot(m.jid);
			return await m.react('✅');
		} else if (match.toLowerCase() === 'off') {
			await disableChatbot(m.jid);
			return await m.react('✅');
		} else {
			return await m.reply(
				`Invalid option! Use ${m.prefix}chatbot on or ${m.prefix}chatbot off`
			);
		}
	}
);

