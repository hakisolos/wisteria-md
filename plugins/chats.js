/** @format */

const { nikka } = require('../lib/cmd');
const { isAdmin } = require('../lib/utilities/index');
nikka(
	{
		pattern: 'pin',
		desc: 'pins chat',
		public: false,
		usage: ' reply msg with !pin',
		react: true,
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
		desc: 'pins chat',
		public: false,
		usage: ' reply msg with !pin',
		react: true,
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
