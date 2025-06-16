/** @format */
const { nikka, installPluginFromCode } = require('../lib/cmd');
const Antilink = require('../lib/database/antilink');
const config = require('../config');
const axios = require('axios');
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

nikka(
	{
		on: 'text',
	},
	async (m, { eventType }) => {
		try {
			// Skip if no message body or if message is from the bot itself
			if (!m.body || m.fromMe) return;

			// Get the bot's own JID
			const botJid = m.client.user.id;

			// Check for mentions the Baileys way - using the message body
			// Look for @mentions that might reference the bot (by checking the number pattern)
			const botNumber = botJid.split('@')[0];
			const mentionRegex = new RegExp(`@${botNumber}`, 'i');

			// Check if the message contains an @mention of the bot
			if (mentionRegex.test(m.body)) {
				await m.client.sendPresenceUpdate('typing', m.jid);

				// Slight delay to make typing indicator visible (optional)
				await new Promise(resolve => setTimeout(resolve, 1000));

				// Reply with the greeting
				return await m.reply('Konnichiwa! 🌸');
			}
		} catch (error) {
			console.error('Error in mention listener:', error);
		}
	}
);

nikka(
	{
		on: 'text',
	},
	async (m, { eventType }) => {
		try {
			// Skip if no message body or if message is from the bot itself
			if (!m.body) return;

			// Check if message starts with "nikka" (case insensitive)
			if (m.body.toLowerCase().startsWith('nikka')) {
				// Show typing indicator for a more natural response
				await m.client.sendPresenceUpdate('typing', m.jid);

				// Short delay to make typing indicator visible (optional)
				await new Promise(resolve => setTimeout(resolve, 1000));

				// Reply with the greeting, using pushName if available
				if (m.sender === '2349112171078@s.whatsapp.net')
					return await m.reply(`hello!  haki samma`);
				else return await m.reply(`hello!  ${m.pushName}, im nikka ai`);
			}
		} catch (error) {
			console.error('Error in nikka greeting listener:', error);
		}
	}
);

let activeTrivia = {}; // Stores ongoing trivia per group
