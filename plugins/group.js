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
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'add');
		return await sock.global.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been Added to The Group!_*`,
			mentions: [user],
		});
	}
);

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
		let user = num.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.groupParticipantsUpdate(m.jid, [user], 'remove');
		return await sock.global.sendMessage(m.jid, {
			text: `*_@${user.split('@')[0]}, has been removed from The Group!_*`,
			mentions: [user],
		});
	}
);
