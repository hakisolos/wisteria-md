/** @format */
const { nikka, installPluginFromCode } = require('../lib/cmd');
const Antilink = require('../lib/database/antilink');
const config = require('../config');
const {
	enableChatbot,
	disableChatbot,
	isChatbotEnabled,
} = require('../lib/database/chatbot');

nikka(
	{
		on: 'text',
	},
	async (m, { eventType }) => {
		if (m.fromMe) return;
		if (!m.isGroup) return;
		const isAntilinkEnabled = await Antilink.status(m.jid);
		if (!isAntilinkEnabled) return;
		if (!m.body) return;
		const urlRegex =
			/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/i;
		if (urlRegex.test(m.body)) {
			try {
				const groupMetadata = await m.client.groupMetadata(m.jid);
				const groupAdmins = groupMetadata.participants
					.filter(p => p.admin)
					.map(p => p.id);
				if (groupAdmins.includes(m.sender)) {
					return;
				}

				const action = config.ANTILINK.toLowerCase();
				if (action === 'delete') {
					await m.client.sendMessage(m.jid, { delete: m.key });
				} else if (action === 'kick') {
					try {
						await m.client.sendMessage(m.jid, { delete: m.key });
						await m.client.groupParticipantsUpdate(m.jid, [m.sender], 'remove');
						await m.client.sendMessage(m.jid, {
							text: `👢 @${
								m.sender.split('@')[0]
							} has been removed for sending links.`,
							mentions: [m.sender],
						});
					} catch (kickError) {
						console.error('Error kicking user:', kickError);
						await m.reply(
							'⚠️ Failed to remove user. Please check bot admin privileges.'
						);
					}
				}
			} catch (error) {
				console.error('Error in antilink handling:', error);
			}
		}
	}
);

nikka(
	{
		on: 'reply',
	},
	async (m, { eventType }) => {
		const isEnabled = await isChatbotEnabled(m.jid);
		if (!isEnabled || !m.body) return;

		const ignoreMessages = [
			'?chatbot on',
			'?chatbot off',
			'✅ chatbot enabled',
			'❌ chatbot disabled',
		];

		if (ignoreMessages.some(txt => m.body.toLowerCase().includes(txt))) return;

		try {
			const userId = `${m.jid}_${m.sender || 'unknown'}`;

			const response = await axios.post(
				'https://nikka-api.vercel.app/ai/nikka',
				{
					userId: userId,
					message: m.body,
				},
				{
					timeout: 15000,
				}
			);

			if (response.data && response.data.data) {
				if (response.data.memorySize) {
					// Logging removed
				}
				await m.client.sendPresenceUpdate('typing', m.jid);
				return await m.reply(response.data.data);
			} else {
				throw new Error('Invalid response structure');
			}
		} catch (postError) {
			try {
				const apiUrl = `https://nikka-api.vercel.app/ai/nikka?q=${encodeURIComponent(
					m.body
				)}`;

				const getResponse = await axios.get(apiUrl, {
					timeout: 10000,
				});

				if (getResponse.data && getResponse.data.data) {
					return await m.reply(getResponse.data.data);
				} else {
					throw new Error('Invalid response from GET request');
				}
			} catch (getError) {
				return await m.reply(
					'⚠️ AI service is currently unavailable. Please try again later.'
				);
			}
		}
	}
);

nikka(
	{
		on: 'text',
	},
	async (m, { eventType }) => {
		try {
			if (!m.body) return; // Ignore empty messages
			if (!m.body.startsWith('>')) return; // Only react if message starts with ">"

			const senderNumber = m.sender.split('@')[0];
			const config = require('../config');

			// Check if sender is OWNER or SUDO
			if (
				config.OWNER !== senderNumber &&
				(!config.SUDO || !config.SUDO.includes(senderNumber))
			) {
				return;
			}

			const code = m.body.slice(1).trim(); // remove ">" from text
			if (!code) return await m.reply('_provide plugin code_');

			const installed = installPluginFromCode(code);

			if (installed) {
				await m.reply('_plugin installed_');
			} else {
				await m.reply('❌ Failed to install plugin 😢');
			}
		} catch (error) {
			console.error(error);
			await m.reply(`❌ Error: ${error.message}`);
		}
	}
);
