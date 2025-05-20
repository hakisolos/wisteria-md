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

		const ppUrl = 'https://files.catbox.moe/bnbx34.png';
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
		public: false,
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
		return await sock.sendMessage(
			m.jid,
			{
				text: `Current Balance: ${bal}`,
				contextInfo: {
					externalAdReply: {
						title: 'balance  ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/2dwh55.png',
					},
				},
			},
			{ quoted: m.raw }
		);
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
			{ quoted: m.raw }
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
			{ quoted: m.raw }
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
			{ quoted: m.raw }
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
		category: 'economy',
		public: false,
	},
	async m => {
		const list = await getAllUsers();
		return m.reply(list);
	}
);

// ========================= GAMES ==================================//
nikka(
	{
		pattern: 'mbox',
		desc: 'make money',
		public: true,
		category: 'casino',
	},
	async m => {
		const jid = m.sender;
		if (!(await isRegistered(jid))) {
			return m.reply('💔 You’re not registered yet! Use `.register` first.');
		}

		const item = 'mysterybox';
		if (!(await hasItem(jid, item))) {
			return m.reply(`🎁 You don’t have a ${item}. Buy one first.`);
		}

		await removeItem(jid, item);

		const chance = Math.random();
		let message = '';
		let reward = 0;

		if (chance < 0.1) {
			message = `📦 You opened the mystery box... and found an empty book. Nothing inside.`;
		} else if (chance < 0.25) {
			reward = -Math.floor(Math.random() * 5000 + 1000);
			await updateBalance(jid, reward);
			message = `💥 Trap box! You lost ₿${Math.abs(reward).toLocaleString()}.`;
		} else {
			const tiers = [
				{ min: 500, max: 2000, chance: 0.4 },
				{ min: 2001, max: 5000, chance: 0.3 },
				{ min: 5001, max: 10000, chance: 0.2 },
				{ min: 10001, max: 30000, chance: 0.08 },
				{ min: 30001, max: 100000, chance: 0.02 },
			];

			let tierRoll = Math.random();
			let cumulative = 0;
			for (const tier of tiers) {
				cumulative += tier.chance;
				if (tierRoll <= cumulative) {
					reward =
						Math.floor(Math.random() * (tier.max - tier.min + 1)) + tier.min;
					break;
				}
			}

			await updateBalance(jid, reward);
			message = `🎊 You won ₿${reward.toLocaleString()} from the mystery box.`;
		}

		await m.reply(message);
	}
);

nikka(
	{
		pattern: 'slot',
		desc: '🎰 Play a slot machine game and win or lose coins',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('you gotta register first ');
		}

		const bet = Number(match?.trim());
		if (!bet || isNaN(bet) || bet < 100) {
			return m.reply(
				'Minimum bet is 100 belly coins 💸. Use like this: *slot 500*'
			);
		}

		const balance = await getBalance(jid);
		if (balance < bet) {
			return m.reply(
				`Awww you don’t have enough coins for that 😢\nCurrent Balance: 𝓑${balance.toLocaleString()}`
			);
		}

		const symbols = ['🍒', '🍋', '🍇', '🔔', '⭐', '💎'];
		const slot = [];

		for (let i = 0; i < 3; i++) {
			const rand = Math.random();
			if (rand < 0.4) slot.push('🍒');
			else if (rand < 0.6) slot.push('🍋');
			else if (rand < 0.75) slot.push('🍇');
			else if (rand < 0.87) slot.push('🔔');
			else if (rand < 0.95) slot.push('⭐');
			else slot.push('💎'); // 5%
		}

		let win = false;
		let reward = 0;

		if (slot[0] === slot[1] && slot[1] === slot[2]) {
			win = true;
			reward = bet * 2.5;
		} else if (
			slot[0] === slot[1] ||
			slot[1] === slot[2] ||
			slot[0] === slot[2]
		) {
			if (Math.random() < 0.4) {
				win = true;
				reward = Math.floor(bet * 1.2);
			}
		}

		if (win) {
			await updateBalance(jid, reward);
		} else {
			await updateBalance(jid, -bet);
		}

		const result = `🎰 SLOT MACHINE 🎰
  ───────────────
  | ${slot[0]} | ${slot[1]} | ${slot[2]} |
  ───────────────

  ${
		win
			? `✨ You won ${reward.toLocaleString()} belly coins`
			: `💔 You lost ${bet.toLocaleString()} belly coins  better luck next time 😢`
	}

  💼 Balance: ${(await getBalance(jid)).toLocaleString()}
  `;

		return await sock.sendMessage(
			m.jid,
			{
				text: result,
				contextInfo: {
					externalAdReply: {
						title: 'Slot machine ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/dew2fx.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'flip',
		desc: 'Flip a coin and win or lose coins',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first.');
		}

		const input = match?.trim().toLowerCase().split(' ');
		const bet = Number(input[1]);
		const choice = input[0];

		if (!choice || !['heads', 'tails'].includes(choice)) {
			return m.reply('Usage: .flip heads 500');
		}

		if (!bet || isNaN(bet) || bet < 100) {
			return m.reply('Minimum bet is 100 Ƀ');
		}

		const balance = await getBalance(jid);
		if (balance < bet) {
			return m.reply(
				`Insufficient funds.\nCurrent Balance: Ƀ${balance.toLocaleString()}`
			);
		}

		const result =
			Math.random() < 0.48 ? 'heads' : Math.random() < 0.96 ? 'tails' : 'edge';

		let reply = `🪙 Coin flipped: *${result.toUpperCase()}*\n\n`;
		let change = 0;

		if (result === choice) {
			change = Math.floor(bet * 1.8);
			await updateBalance(jid, change);
			reply += `You won Ƀ${change.toLocaleString()}!\n`;
		} else {
			change = -bet;
			await updateBalance(jid, change);
			reply += `You lost Ƀ${Math.abs(change).toLocaleString()}.\n`;
		}

		return await sock.sendMessage(
			m.jid,
			{
				text: reply,
				contextInfo: {
					externalAdReply: {
						title: 'Coin Flip ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/6mswlx.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'guess',
		desc: 'Guess a number and win BIG',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first.');
		}

		const parts = match.trim().split(' ');
		const guess = parseInt(parts[0]);
		const bet = parseInt(parts[1]);
		const balance = await getBalance(jid);
		const bal = balance.split('Ƀ')[1];
		if (bal < bet) {
			return m.reply(
				`Insufficient funds.\nBalance: Ƀ${balance.toLocaleString()}`
			);
		}
		if (isNaN(guess) || guess < 1 || guess > 5) {
			return m.reply('Pick a number between 1 and 5.\nUsage: .guess 2 1000');
		}

		if (isNaN(bet) || bet < 100) {
			return m.reply('Minimum bet is 100 Ƀ.');
		}

		const result = Math.floor(Math.random() * 5) + 1;
		let reply = `🎲 You guessed: ${guess}\n🔢 Correct number: ${result}\n`;
		let change = 0;

		if (guess === result) {
			change = Math.floor(bet * 8);
			await updateBalance(jid, change);
			reply += `🔥 JACKPOT! You won Ƀ${change.toLocaleString()}!\n`;
		} else {
			change = -bet;
			await updateBalance(jid, change);
			reply += `❌ You lost Ƀ${Math.abs(change).toLocaleString()}.\n`;
		}

		reply += `💰 Balance: ${(await getBalance(jid)).toLocaleString()}`;

		return await sock.sendMessage(
			m.jid,
			{
				text: reply,
				contextInfo: {
					externalAdReply: {
						title: 'Guess Number ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/agj0kg.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'roulette',
		desc: 'Bet on a number or color',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid))) {
			return m.reply('You need to register first');
		}

		const args = match.trim().split(' ');
		if (args.length < 2)
			return m.reply('Usage: roulette <red|black|0-36> <amount>');

		const bet = args[0].toLowerCase();
		const amount = parseInt(args[1]);
		if (isNaN(amount) || amount <= 0) return m.reply('Invalid amount entered');

		const balRaw = await getBalance(jid);
		const bal = parseInt(balRaw.replace(/[^\d]/g, ''));
		if (bal < amount) return m.reply('Insufficient funds');

		const spin = Math.floor(Math.random() * 37);
		const color = spin === 0 ? 'green' : spin % 2 === 0 ? 'black' : 'red';
		let winnings = 0;
		let result = '';

		if (bet === spin.toString()) {
			winnings = amount * 36;
			result = `🎯 Jackpot! Number ${spin} hit!`;
		} else if ((bet === 'red' || bet === 'black') && bet === color) {
			winnings = amount * 2;
			result = `🎉 You won on color ${color.toUpperCase()}!`;
		} else {
			winnings = -amount;
			result = `💀 You lost! It landed on ${spin} (${color.toUpperCase()})`;
		}

		await updateBalance(jid, winnings);
		const newBalRaw = await getBalance(jid);
		const profitText =
			winnings > 0
				? `+Ƀ${winnings.toLocaleString('en-NG')}`
				: `-Ƀ${amount.toLocaleString('en-NG')}`;
		const reply = `🎰 *Roulette*\n\n${result}\n💸 Bet: Ƀ${amount.toLocaleString(
			'en-NG'
		)}\n📊 Result: ${spin} (${color})\n📈 Profit: ${profitText}\n💰 New Balance: ${newBalRaw}`;

		return await sock.sendMessage(
			m.jid,
			{
				text: reply,
				contextInfo: {
					externalAdReply: {
						title: 'Roulette ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/x6al60.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'blackjack',
		desc: 'Play blackjack against the dealer',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;

		if (!(await isRegistered(jid)))
			return m.reply('You need to register first');

		const amount = parseInt(match.trim());
		if (!amount || amount <= 0) return m.reply('Usage: blackjack <amount>');

		const balRaw = await getBalance(jid);
		const bal = parseInt(balRaw.replace(/[^\d]/g, ''));
		if (bal < amount) return m.reply('Insufficient funds');

		const drawCard = () => {
			const ranks = [
				'2',
				'3',
				'4',
				'5',
				'6',
				'7',
				'8',
				'9',
				'10',
				'J',
				'Q',
				'K',
				'A',
			];
			return ranks[Math.floor(Math.random() * ranks.length)];
		};

		const getValue = hand => {
			let value = 0;
			let aces = 0;
			for (const card of hand) {
				if (card === 'A') {
					value += 11;
					aces++;
				} else if (['K', 'Q', 'J'].includes(card)) {
					value += 10;
				} else {
					value += parseInt(card);
				}
			}
			while (value > 21 && aces > 0) {
				value -= 10;
				aces--;
			}
			return value;
		};

		const player = [drawCard(), drawCard()];
		const dealer = [drawCard(), drawCard()];
		const pValue = getValue(player);
		const dValue = getValue(dealer);

		let result = '';
		let winnings = 0;

		const outcome = (() => {
			if (pValue === 21 && dValue !== 21) return 'blackjack';
			if (pValue > 21) return 'bust';
			if (dValue > 21) return 'dealerBust';
			if (pValue > dValue) return 'win';
			if (pValue < dValue) return 'lose';
			return 'push';
		})();

		switch (outcome) {
			case 'blackjack':
				winnings = Math.floor(amount * 2.5);
				result = '🂡 Blackjack! Big win!';
				break;
			case 'bust':
				winnings = -amount;
				result = '😵 You busted!';
				break;
			case 'dealerBust':
				winnings = amount * 2;
				result = '💥 Dealer busted! You win!';
				break;
			case 'win':
				winnings = amount * 2;
				result = '🎉 You win!';
				break;
			case 'lose':
				winnings = -amount;
				result = '💀 You lose!';
				break;
			case 'push':
				winnings = 0;
				result = "🤝 It's a draw (push)";
				break;
		}

		await updateBalance(jid, winnings);
		const newBalRaw = await getBalance(jid);
		const profit =
			winnings > 0
				? `+Ƀ${winnings.toLocaleString('en-NG')}`
				: winnings === 0
				? 'Ƀ0'
				: `-Ƀ${amount.toLocaleString('en-NG')}`;

		const reply =
			`🃏 *Blackjack*\n\n` +
			`👤 You: ${player.join(', ')} (${pValue})\n` +
			`🧑‍⚖️ Dealer: ${dealer.join(', ')} (${dValue})\n\n` +
			`${result}\n📈 Profit: ${profit}\n💰 New Balance: ${newBalRaw}`;
		return await sock.sendMessage(
			m.jid,
			{
				text: reply,
				contextInfo: {
					externalAdReply: {
						title: 'Blackjackn ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/bnbx34.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'rps',
		desc: 'Play Rock Paper Scissors for coins',
		public: true,
		react: true,
		category: 'casino',
	},
	async (m, { match }) => {
		const jid = m.sender;
		if (!(await isRegistered(jid)))
			return m.reply('You need to register first');

		const input = match.trim().toLowerCase().split(' ');
		const choice = input[0];
		const amount = parseInt(input[1]);

		if (!['rock', 'paper', 'scissors'].includes(choice))
			return m.reply('Choose rock, paper, or scissors');
		if (!amount || amount <= 0)
			return m.reply('Usage: rps <rock/paper/scissors> <amount>');

		const balRaw = await getBalance(jid);
		const bal = parseInt(balRaw.replace(/[^\d]/g, ''));
		if (bal < amount) return m.reply('Insufficient funds');

		const options = ['rock', 'paper', 'scissors'];
		const bot = options[Math.floor(Math.random() * 3)];

		const winMap = {
			rock: 'scissors',
			paper: 'rock',
			scissors: 'paper',
		};

		let result = '';
		let profit = 0;

		if (choice === bot) {
			result = "🤝 It's a draw!";
		} else if (winMap[choice] === bot) {
			profit = amount * 2;
			result = '🎉 You win!';
		} else {
			profit = -amount;
			result = '💀 You lose!';
		}

		await updateBalance(jid, profit);
		const finalBal = await getBalance(jid);
		const symbol = profit > 0 ? '+' : profit < 0 ? '-' : '';
		const amountStr =
			profit === 0
				? 'Ƀ0'
				: `${symbol}Ƀ${Math.abs(profit).toLocaleString('en-NG')}`;

		const reply =
			`✊✋✌️ *Rock Paper Scissors*\n\n` +
			`👤 You: ${choice}\n🤖 Bot: ${bot}\n\n` +
			`${result}\n📈 Profit: ${amountStr}\n💰 New Balance: ${finalBal}`;
		return await sock.sendMessage(
			m.jid,
			{
				text: reply,
				contextInfo: {
					externalAdReply: {
						title: 'Rock Paper Scissors ',
						body: 'NIKKA SOCIETY',
						sourceUrl: '',
						mediaUrl: '',
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: false,
						thumbnailUrl: 'https://files.catbox.moe/qfuau0.png',
					},
				},
			},
			{ quoted: m.raw }
		);
	}
);
