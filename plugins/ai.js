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

nikka(
	{
		on: 'reply',
	},
	async (m, { eventType }) => {
		// Check if the chat has chatbot enabled
		const isEnabled = await isChatbotEnabled(m.jid);
		if (!isEnabled) return;

		// Make sure there's message content
		if (!m.body) return;

		const ignoreMessages = [
			'?chatbot on',
			'?chatbot off',
			'✅ chatbot enabled',
			'❌ chatbot disabled',
		];

		if (ignoreMessages.some(txt => m.body.toLowerCase().includes(txt))) return;

		try {
			// Create a consistent userId from the chat JID and sender
			const userId = `${m.jid}_${m.sender || 'unknown'}`;

			// First try with POST request to support memory features
			console.log(`Attempting memory-enabled request for user: ${userId}`);
			const response = await axios.post(
				'https://nikka-api.vercel.app/ai/nikka',
				{
					userId: userId,
					message: m.body,
				},
				{
					timeout: 15000, // 15 second timeout
				}
			);

			if (response.data && response.data.data) {
				// Log memory size if available
				if (response.data.memorySize) {
					console.log(
						`Memory size for ${userId}: ${response.data.memorySize} exchanges`
					);
				}
				return await m.reply(response.data.data);
			} else {
				throw new Error('Invalid response structure');
			}
		} catch (postError) {
			console.error('Error with POST request:', postError.message);

			try {
				// Fallback to GET request (no memory features)
				console.log('Falling back to GET request');
				const apiUrl = `https://nikka-api.vercel.app/ai/nikka?q=${encodeURIComponent(
					m.body
				)}`;

				const getResponse = await axios.get(apiUrl, {
					timeout: 10000, // 10 second timeout
				});

				if (getResponse.data && getResponse.data.data) {
					return await m.reply(getResponse.data.data);
				} else {
					throw new Error('Invalid response from GET request');
				}
			} catch (getError) {
				console.error('Error with GET request:', getError.message);
				return await m.reply(
					'⚠️ AI service is currently unavailable. Please try again later.'
				);
			}
		}
	}
);
