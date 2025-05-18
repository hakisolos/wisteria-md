/** @format */
const {
	nikka,
	getUser,
	addUser,
	isRegistered,
	checkCooldown,
	removeUser,
	getBalance,
	updateBalance,
} = require('../lib');

nikka(
	{
		pattern: 'register',
		desc: 'Register a new user in database',
		public: true,
		react: true,
		category: 'USERS',
	},
	async m => {
		const jid = m.sender;

		if (await isRegistered(jid))
			return m.reply('You already have an account, sir 😌');

		const ppUrl = await m.client.profilePictureUrl(jid, 'image');
		const user = await addUser(m.pushName, jid, 4000, ppUrl);

		return m.reply(`💖 User created successfully: *${user.name}*`);
	}
);

nikka(
	{
		pattern: 'logout',
		desc: 'Deletes user account',
		public: true,
		react: true,
		category: 'USERS',
	},
	async m => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You don’t have an account to delete 💔');
		}

		await removeUser(jid);
		return m.reply(`❌ Account Removed: *${m.pushName}*`);
	}
);
nikka(
	{
		pattern: 'test',
		desc: 'Deletes user account',
		public: true,
		react: true,
		category: 'USERS',
	},
	async (m, { match }) => {
		const jid = m.sender;
		if (!match) return m.reply('Provide an amount');

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first');
		}

		const amount = Number(match.trim());

		const fek = await updateBalance(jid, amount);
		if (!fek) return m.reply('User not found, unable to update balance');

		return m.reply(`${amount} added to balance\nNew Balance: ${fek.balance}`);
	}
);

nikka(
	{
		pattern: 'profile',
		desc: 'get user account',
		public: true,
		react: true,
		category: 'USERS',
	},
	async m => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first');
		}

		const us = await getUser(jid);
		if (typeof us === 'string') return m.reply(us);

		const profileText = `╭───❖「 *👤 User Profile* 」❖───╮
│ 🆔: ${us._id.split('@')[0]}
│ 🏷️ Name: ${us.name || 'Not set'}
│ 💰 Balance: 𝓑${us.balance.toLocaleString()}
│
│ 🌟 Member of Nikka Society
╰───────────────────────────╯`;

		await m.client.sendMessage(m.jid, {
			image: { url: us.pp || 'https://i.imgur.com/YjvA3MG.jpeg' },
			caption: profileText,
		});
	}
);

nikka(
	{
		pattern: 'bal',
		desc: 'balance of user account',
		public: true,
		react: true,
		category: 'USERS',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first');
		}
		const bal = await getBalance(jid);
		return m.adReply(`Current Balance: ${bal}`);
	}
);

nikka(
	{
		pattern: 'daily',
		desc: 'Daily user account bonus',
		public: true,
		react: true,
		category: 'USERS',
	},
	async (m, { match }) => {
		const jid = m.sender;
		const ONE_DAY = 24 * 60 * 60 * 1000;
		const cooldown = checkCooldown(jid, ONE_DAY);

		if (cooldown.onCooldown) {
			return m.reply(`⏳ Wait till tommorow before collecting again, baby `);
		}

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first cutie 😚');
		}

		const amount = 1000;
		await updateBalance(jid, amount);

		await sock.sendMessage(
			m.jid,
			{
				text: `💰 You've received  𝓑${amount.toLocaleString()} Belly Coins!\nCome back tomorrow for more `,
				contextInfo: {
					externalAdReply: {
						title: 'DAILY BONUS',
						body: 'Come back after a day',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl:
							'https://rimuruslime.com/wp-content/uploads/shop_items/Sapphire%20Note.png',
					},
				},
			},
			{ quoted: null }
		);
	}
);

nikka(
	{
		pattern: 'shop',
		desc: 'shop user account',
		public: true,
		react: true,
		category: 'USERS',
	},
	async m => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first');
		}
        const text = 
	}
);
