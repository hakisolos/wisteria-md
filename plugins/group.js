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
		desc: 'kick user from group',
		public: false,
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		if (!m.quoted && !match) return m.reply(`_reply or mention a user to kick_`);
		if (!(await isAdmin(m.jid, m.sender, m.client)))
			return m.reply(`_you or the bot has to be an admin_`);
		var user;
		if (m.quoted) {
			user = m.quoted.sender;
		} else {
			user = match.replace(/[^0-9]/g, "")
		}
		await m.client.groupParticipantsUpdate(m.jid, [user], 'remove');
		return await m.client.sendMessage(
			m.jid,
			{
				text: `_${user.split("@")} kicked_`,
				mentions: [user]
			})

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
		if (!m.isGroup) return m.reply('_This command is for groups only_');

		let user;
		if (m.quoted) {
			user = m.quoted.sender;
		} else if (match) {
			const num = match.replace(/[^0-9]/g, '');
			user = `${num}@s.whatsapp.net`;
		}

		if (!user) {
			return m.reply(`Hi ${m.pushName}, please reply or mention someone to promote.`);
		}

		const isBotAdmin = await isAdmin(m.jid, m.client.user.id, m.client);
		const isSenderAdmin = await isAdmin(m.jid, m.sender, m.client);

		if (!isBotAdmin || !isSenderAdmin) {
			return m.reply(`Hey ${m.pushName}, you or the bot must be admin.`);
		}

		await m.client.groupParticipantsUpdate(m.jid, [user], 'promote');
		return await m.client.sendMessage(m.jid, {
			text: `@${user.split('@')[0]} has been promoted! `,
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
		if (!m.isGroup) return m.reply('_This command is for groups only_');

		let user;
		if (m.quoted) {
			user = m.quoted.sender;
		} else if (match) {
			const num = match.replace(/[^0-9]/g, '');
			user = `${num}@s.whatsapp.net`;
		}

		if (!user) {
			return m.reply(`Hi ${m.pushName}, please reply or mention someone to promote.`);
		}

		const isBotAdmin = await isAdmin(m.jid, m.client.user.id, m.client);
		const isSenderAdmin = await isAdmin(m.jid, m.sender, m.client);

		if (!isBotAdmin || !isSenderAdmin) {
			return m.reply(`Hey ${m.pushName}, you or the bot must be admin.`);
		}

		await m.client.groupParticipantsUpdate(m.jid, [user], 'demote');
		return await m.client.sendMessage(m.jid, {
			text: `@${user.split('@')[0]} has been demoted! `,
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
				return m.reply('_✅ _Antilink enableld_');
			} else if (match.toLowerCase() === 'off') {
				await Antilink.disable(m.jid);
				return m.reply('_Antilink disabled_');
			} else if (match.toLowerCase() === 'status') {
				const status = await Antilink.status(m.jid);
				return m.reply(
					`_Antilink Status_\n Status: ${status ? 'enabled ' : 'disabled '
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

nikka(
	{
		pattern: 'tagall',
		desc: 'tags all group mem',
		public: false,
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		if (!m.isGroup) {
			return await m.reply('_This command is specifically for groups_');
		}

		const { participants } = await global.sock.groupMetadata(m.jid);

		return await m.client.relayMessage(
			m.jid,
			{
				extendedTextMessage: {
					text: `@${m.jid} ${match ?? ''}`,
					contextInfo: {
						mentionedJid: participants.map(p => p.id),
						groupMentions: [{ groupJid: m.jid, groupSubject: 'all' }],
					},
				},
			},
			{}
		);
	}
);

nikka(
	{
		pattern: 'newgc',
		desc: 'creates new gc',
		public: false,
		react: true,
		category: 'group',
	},
	async (m, { match }) => {
		if (!match)
			return m.reply(`invalid usage, use:\n ${m.prefix}newgc <gcname>`);
		/*if (!m.isGroup) {
			return await m.reply('_This command is specifically for groups_');
		}
		const groupMetadata = await m.client.groupMetadata(m.jid);
			const groupAdmins = groupMetadata.participants
				.filter(p => p.admin)
				.map(p => p.id);
			if (!groupAdmins.includes(m.sender) && !m.isCreator) {
				return m.reply(' This command can only be used by admins!');
			} */
		const grp = await m.client.groupCreate(match.trim(), [m.sender]);
		await m.client.sendMessage(grp.id, { text: `WELCOME TO ${match.trim()}` });
		return m.reply('_group successfully created_');
	}
);

nikka(
	{
		pattern: 'gname',
		desc: 'rename gc',
		category: 'group',
		react: true,
		public: false,
	},
	async (m, { match }) => {
		if (!match)
			return m.reply(`invalid usage, use:\n ${m.prefix}gcname <newname>`);
		if (!m.isGroup) {
			return await m.reply('_This command is specifically for groups_');
		}
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		const newName = match.trim();
		await m.client.groupUpdateSubject(m.jid, newName);
		return m.reply(`_Group name successfully changed_`);
	}
);
