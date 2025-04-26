/** @format */

const { isAdmin } = require('../lib/utilities');
const { nikka } = require('../lib/cmd');
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
