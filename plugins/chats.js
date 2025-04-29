/** @format */

const { nikka } = require('../lib/cmd');
const { isAdmin } = require('../lib/utilities/index');
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
