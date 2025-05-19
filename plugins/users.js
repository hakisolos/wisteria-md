/** @format */
const {
	nikka,
	getUser,
	addUser,
	buyItem,
	removeItem,
	hasItem,
	isRegistered,
	checkCooldown,
	removeUser,
	getAllUsers,
	getInventory,
	getBalance,
	updateBalance,
	isItem,
} = require('../lib');

nikka(
	{
		pattern: 'register',
		desc: 'Register a new user in database',
		public: true,
		react: true,
		category: 'economy',
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
		category: 'economy',
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
		category: 'economy',
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
		category: 'economy',
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
		category: 'economy',
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
		category: 'economy',
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
		pattern: 'itemshop',
		desc: 'shop user account',
		public: true,
		react: true,
		category: 'economy',
	},
	async m => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('💔 You need to register first, my love!');
		}

		const readMore = String.fromCharCode(8206).repeat(4001); // readmore trigger

		const text = `
  ╭── 🎮 *GAME SHOP* ──╮
  │
  ├ 💣 *pistol* - ฿500
  │   - Use for robbing users 💸
  │
  ├ 🪓 *shovel* - ฿700
  │   - Dig to discover random items 🪙
  │
  ${readMore}
  ├ ⛏️ *pickaxe* - ฿1200
  │   - Mine for rare ores like diamonds 💎
  │
  ├ 🧲 *magnet* - ฿850
  │   - Attract extra coins when working 🧲
  │
  ├ 🥽 *hackingdevice* - ฿3000
  │   - Rarely steal from bank heists 🔐
  │
  ├ 🔋 *enerydrink* - ฿250
  │   - Boost work income temporarily ⚡
  │
  ├ 🛡️ *vest* - ฿1500
  │   - Protects from being robbed 😌
  │
  ├ 🪙 *coinmp* - ฿10,000
  │   - Double coin rewards for 1 hour 🤑
  │
  ├ 🎁 *mysterybox* - ฿1000
  │   - Random item or coins inside 🎲
  │
  ╰───────────────╯
  
  💰 To buy: *buy <item name>*
  🔍 To check inventory: *inventory*
  
  Have fun shopping, 
  `;

		await sock.sendMessage(
			m.jid,
			{
				text: text,
				contextInfo: {
					externalAdReply: {
						title: 'Shop',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: true,
						thumbnailUrl: 'https://files.catbox.moe/3896e1.jpeg',
					},
				},
			},
			{ quoted: null }
		);
	}
);

nikka(
	{
		pattern: 'buy',
		desc: 'buy item',
		react: true,
		category: 'economy',
		public: true,
	},
	async (m, { match }) => {
		const item = match?.trim().toLowerCase();
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('💔 You need to register first');
		}

		if (!item) {
			return m.reply('Please provide an item to buy');
		}

		if (!(await isItem(item))) {
			return m.reply(
				`Invalid item, Use: ${m.prefix}shop to see what you can buy.`
			);
		}

		if (await hasItem(jid, item)) {
			return m.reply(
				`You already have a ${item}, sweetie! No need to buy another. `
			);
		}

		const success = await buyItem(jid, item);
		if (!success) {
			return m.reply(
				`Oops, couldn’t buy the ${item}. Do you have enough belly? 💰`
			);
		}
		const text = `Congrats, you bought the ${item} successfully! Use it wisely`;
		return await sock.sendMessage(
			m.jid,
			{
				text: text,
				contextInfo: {
					externalAdReply: {
						title: 'Shop',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: true,
						thumbnailUrl: 'https://files.catbox.moe/3896e1.jpeg',
					},
				},
			},
			{ quoted: null }
		);
	}
);

nikka(
	{
		pattern: 'sell',
		desc: 'sell item',
		react: true,
		category: 'economy',
		public: true,
	},
	async (m, { match }) => {
		const item = match?.trim().toLowerCase();
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('💔 You need to register first');
		}

		if (!item) {
			return m.reply('Tell me which item you want to sell');
		}

		if (!(await isItem(item))) {
			return m.reply(
				`That item doesn’t exist💔, Use: ${m.prefix}inventory to check what you own.`
			);
		}

		if (!(await hasItem(jid, item))) {
			return m.reply(
				`You don’t have a ${item} to sell 💔, Maybe buy one first?`
			);
		}

		const success = await removeItem(jid, item);
		if (!success) {
			return m.reply(
				`Oops, something went wrong selling the ${item}. Try again later`
			);
		}
		const text = `You sold your ${item} successfully! More belly for us 💰`;
		return await sock.sendMessage(
			m.jid,
			{
				text: text,
				contextInfo: {
					externalAdReply: {
						title: 'Shop',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: true,
						thumbnailUrl: 'https://files.catbox.moe/3896e1.jpeg',
					},
				},
			},
			{ quoted: null }
		);
	}
);

nikka(
	{
		pattern: 'inventory',
		desc: 'Check your inventory, baby!',
		react: true,
		category: 'economy',
		public: true,
	},
	async m => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('💔 You’re not registered yet! Use `.register` first.');
		}

		const items = await getInventory(jid);

		if (!items.length) {
			return m.reply(
				`You don’t own any items yet, sweetheart 😢\nTry buying something with \`${m.prefix}shop\``
			);
		}

		const itemList = items
			.map((item, index) => `${index + 1}. ${item}`)
			.join('\n');

		return m.reply(`👜 *Your Inventory, my love:*\n\n${itemList}`);
	}
);
nikka(
	{
		pattern: 'userslist',
		desc: 'Show all registered users with balances',
		react: true,
		category: 'admin',
		public: false, // maybe keep this private?
	},
	async m => {
		const list = await getAllUsers();
		return m.reply(list);
	}
);

// ========================= GAMES ==================================//
