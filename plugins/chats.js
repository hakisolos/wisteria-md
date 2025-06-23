/** @format */

const { nikka } = require('../lib/cmd');
const { isAdmin } = require('../lib/utilities/index');
const { Warn } = require('../lib/database');
nikka(
	{
		pattern: 'pin',
		desc: 'pins msg',
		public: false,
		usage: ' reply msg with !pin',
		react: true,
		category: 'chats',
	},
	async m => {
		if (!m.quoted)
			return m.reply(`hey ${m.pushName}, please reply to msg you want to pin`);
		let admin = await isAdmin(m.jid, m.user, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.sendMessage(m.jid, {
			pin: {
				type: 1,
				time: 86400,
				key: m.quoted.key,
			},
		});
	}
);

nikka(
	{
		pattern: 'unpin',
		desc: 'upins msg',
		public: false,
		usage: ' reply msg with !pin',
		react: true,
		category: 'chats',
	},
	async m => {
		if (!m.quoted)
			return m.reply(`hey ${m.pushName}, please reply to msg you want to pin`);
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		await global.sock.sendMessage(m.jid, {
			pin: {
				type: 2,
				time: 86400,
				key: m.quoted.key,
			},
		});
	}
);

nikka(
	{
		pattern: 'chatpin',
		desc: 'pins chat',
		public: false,
		usage: ' reply msg with !pin',
		react: true,
		category: 'chats',
	},
	async m => {
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		m.client.chatModify(
			{
				pin: true,
			},
			m.jid
		);
		await m.reply('_chat pinned_');
	}
);

nikka(
	{
		pattern: 'chatunpin',
		desc: 'unpins chat',
		public: false,
		react: true,
		category: 'chats',
	},
	async m => {
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		m.client.chatModify(
			{
				pin: false,
			},
			m.jid
		);
		await m.reply('_chat unpinned_');
	}
);

nikka(
	{
		pattern: 'star',
		desc: 'star msg',
		public: false,
		usage: ' reply msg with !star',
		react: true,
		category: 'chats',
	},
	async m => {
		if (!m.quoted)
			return m.reply(`hey ${m.pushName}, please reply to msg you want to star`);
		let admin = await isAdmin(m.jid, m.sender, m.client);
		if (!admin)
			return m.reply(
				`hey ${m.pushName}, sorry you or the bot needs to be an admin`
			);
		m.client.chatModify(
			{
				star: {
					messages: [
						{
							id: m.quoted.id,
							fromMe: true,
						},
					],
					star: true,
				},
			},
			m.jid
		);
		await m.reply('_message starred_');
	}
);

nikka(
	{
		pattern: 'warn',
		desc: 'warn users',
		public: false,
		react: true,
		usage: 'reply the person with .warn',
	},
	async m => {
		const user = m.quoted.sender;
		if (!user)
			return m.reply(
				`_please ${m.pushName}, reply to the user you want to warn_`
			);

		const jid = m.jid;
		const userId = user.split('@')[0];
		const reason = m.text || 'No reason provided';
		const adminId = m.sender.split('@')[0];

		await Warn.addWarn(jid, userId, reason, adminId);
		const warnCount = await Warn.getWarnCount(jid, userId);

		await m.client.sendMessage(m.jid, {
			text: `Warn Added for @${userId}\n Total warns: ${warnCount}/3`,
			mentions: [user],
		});

		if (warnCount >= 3) {
			if (m.isGroup) {
				await m.client.sendMessage(m.jid, {
					text: `_Warn limit for @${userId} Exceeded, commencing action_`,
					mentions: [user],
				});
				await sock.groupParticipantsUpdate(jid, [user], 'remove');
			} else {
				await m.reply(`_Warn limit Exceeded, commencing action_`);
				await m.block(user);
			}

			await Warn.resetWarns(jid, userId);
		}
	}
);
