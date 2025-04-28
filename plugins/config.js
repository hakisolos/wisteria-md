/** @format */

const { nikka } = require('../lib');
const { editEnv } = require('../lib');

nikka(
	{
		pattern: 'setprefix',
		desc: 'Setsprefix',
		public: false,
		react: true,
		category: 'config',
	},
	async (m, { match }) => {
		if (!match)
			return await m.send(
				`hey ${m.pushName}, use ${m.prefix}setprefix <newprefix>`
			);
		await editEnv(`PREFIX=${match.trim()}`);
		await m.reply(`_prefix changed to ${match}, restarting...._`);
		process.exit(1);
	}
);

const on = 'on';
const off = 'off';

nikka(
	{
		pattern: 'antidelete',
		desc: 'antidelete',
		public: false,
		react: true,
		category: 'config',
	},
	async (m, { match }) => {
		if (!match)
			return await m.send(
				`hey ${m.pushName}, use ${m.prefix} antidelete on or off`
			);
		if (match.trim() === on) {
			if (process.env.ANTI_DELETE === 'true')
				return m.reply('__Antidelete is already activated.');
			await editEnv(`ANTI_DELETE=true`);
			await m.reply('_Antidelete Activated, restarting..._');
			process.exit(1);
		} else if (match.trim() === off) {
			if (process.env.ANTI_DELETE === 'false')
				return m.reply('__Antidelete is already deactivated.');
			await editEnv(`ANTI_DELETE=false`);
			await m.reply('_Antidelete Deactivated, restarting..._');
			process.exit(1);
		}
	}
);

nikka(
	{
		pattern: 'antilink-mode',
		desc: 'set anti-link action mode (delete/kick)',
		public: false,
		react: true,
		category: 'config',
	},
	async (m, { match }) => {
		if (!m.isGroup) {
			return m.reply('This command can only be used in groups!');
		}
		try {
			const groupMetadata = await m.client.groupMetadata(m.jid);
			const groupAdmins = groupMetadata.participants
				.filter(p => p.admin)
				.map(p => p.id);
			if (!groupAdmins.includes(m.sender) && !m.isCreator) {
				return m.reply('❌ This command can only be used by admins!');
			}
			if (!match) {
				return m.reply(
					`Please specify a mode: ${m.prefix}antilink-mode delete or ${m.prefix}antilink-mode kick`
				);
			}
			if (match.toLowerCase() === 'delete') {
				config.ANTILINK = 'delete';
				return m.reply('✅ Anti-link mode set to: DELETE messages only');
			} else if (match.toLowerCase() === 'kick') {
				config.ANTILINK = 'kick';
				return m.reply(
					'✅ Anti-link mode set to: DELETE messages and KICK user'
				);
			} else {
				return m.reply(
					`Invalid mode! Use ${m.prefix}antilink-mode delete or ${m.prefix}antilink-mode kick`
				);
			}
		} catch (error) {
			console.error('Error in antilink-mode command:', error);
			return m.reply('❌ An error occurred while processing your request.');
		}
	}
);
