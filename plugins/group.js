/** @format */

const { isAdmin } = require('../lib/utilities');
const { nikka } = require('../lib/cmd');
const Antilink = require('../lib/database/antilink');
const config = require('../config');
nikka(
	{
		pattern: 'add',
		public: false,
		desc: 'add participant',
		usage: '!add <mention> or reply',
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		const jid = m.jid;
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let num = match || m.quoted.participant;
		if (!num)
			return await m.reply(
				`hi ${m.pushName}, please mention or tag a user to remove`
			);
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'add');
		return await global.sock.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been added to The Group!_*`,
			mentions: [user],
		});
	}
);

nikka(
	{
		pattern: 'kick',
		public: false,
		desc: 'add participant',
		usage: '!kick <mention> or reply',
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		const jid = m.jid;
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let num = match || m.quoted.participant;
		if (!num)
			return await m.reply(
				`hi ${m.pushName}, please mention or tag a user to remove`
			);
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'remove');
		return await global.sock.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been removed from The Group!_*`,
			mentions: [user],
		});
	}
);

nikka(
	{
		pattern: 'promote',
		public: false,
		desc: 'promote participant',
		usage: '!promote <mention> or reply',
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let num = match || m.quoted.participant;
		if (!num)
			return await m.reply(
				`hi ${m.pushName}, please mention or tag a user to remove`
			);
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'promote');
		return await global.sock.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been promoted sucessfully!_*`,
			mentions: [user],
		});
	}
);

nikka(
	{
		pattern: 'demote',
		public: false,
		desc: 'promote participant',
		usage: '!demote <mention> or reply',
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let num = match || m.quoted.participant;
		if (!num)
			return await m.reply(
				`hi ${m.pushName}, please mention or tag a user to remove`
			);
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'demote');
		return await global.sock.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been demoted sucessfully!_*`,
			mentions: [user],
		});
	}
);

nikka(
	{
		pattern: 'mute',
		public: false,
		desc: ' mute gc',
		usage: '!mute',
		react: true,
		category: 'group',
	},
	async m => {
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupSettingUpdate(m.jid, 'announcement');
		return m.reply('_group muted sucessfully_');
	}
);

nikka(
	{
		pattern: 'unmute',
		public: false,
		desc: 'unmute gc',
		usage: '!unmute',
		react: true,
		category: 'group',
	},
	async m => {
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupSettingUpdate(m.jid, 'not_announcement');
		return m.reply('_group unmuted sucessfully_');
	}
);

nikka(
	{
		pattern: 'gjids',
		public: false,
		desc: 'gc list',
		usage: '!gjid',
		react: true,
		category: 'group',
	},
	async m => {
		const { participants } = await global.sock.groupMetadata(m.jid);
		let text = '';
		for (let mem of participants) {
			text += `🌸 @${mem.id.split('@')[0]}\n`;
		}
		global.sock.sendMessage(text.trim(), {
			mentions: participants.map(a => a.id),
		});
	}
);

nikka(
	{
		pattern: 'tagall',
		public: false,
		desc: 'tagall',
		usage: '!tagall',
		react: true,
		category: 'group',
	},
	async m => {
		if (!m.isGroup)
			return await m.reply('_This command is specifically for groups_');
		const { participants } = await global.sock.groupMetadata(m.jid);
		let text = '';
		for (let mem of participants) {
			text += `🌸 @${mem.id.split('@')[0]}\n`;
		}
		global.sock.sendMessage(m.jid, {
			text: text.trim(),
			mentions: participants.map(a => a.id),
		});
	}
);

nikka(
	{
		pattern: 'tag',
		public: false,
		desc: 'Tag all members with a message',
		usage: '!tag <message> or reply',
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		let arg = match || m.quoted?.text;
		if (!arg)
			return await m.reply(`_Hi ${m.pushName}, give me a message to tag._`);
		if (!m.isGroup)
			return await m.reply(`_This command is for groups only, love!_`);

		const { participants } = await global.sock.groupMetadata(m.jid);

		global.sock.sendMessage(m.jid, {
			text: arg,
			mentions: participants.map(a => a.id),
		});
	}
);

nikka(
	{
		pattern: 'antilink',
		desc: 'enable/disable anti-link feature',
		public: false,
		react: true,
		category: 'group',
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
				return m.reply(' This command can only be used by admins!');
			}
			if (!match) {
				const status = await Antilink.status(m.jid);
				const prefix = m.prefix;
				return m.reply(
					`Incorrect usage, use:\n ${prefix}antilink on,\n ${prefix}antilink off,\n ${prefix}antilink status`
				);
			}
			if (match.toLowerCase() === 'on') {
				await Antilink.enable(m.jid);
				return m.reply('_✅ _Antilink enableld');
			} else if (match.toLowerCase() === 'off') {
				await Antilink.disable(m.jid);
				return m.reply('_Antilink disabled_');
			} else if (match.toLowerCase() === 'status') {
				const status = await Antilink.status(m.jid);
				return m.reply(
					`_Antilink Status_\n Status: ${
						status ? 'enabled ' : 'disabled '
					}\n Action: ${config.ANTILINK}`
				);
			} else {
				return m.reply(
					`Invalid option! Use ${m.prefix}antilink on\n ${m.prefix}antilink off\n  ${m.prefix}antilink status`
				);
			}
		} catch (error) {
			console.error('Error in antilink command:', error);
			return m.reply('❌ An error occurred while processing your request.');
		}
	}
);
