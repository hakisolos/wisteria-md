/** @format */
const { nikka } = require('../lib/cmd');
const { tiny } = require('../lib/utilities/font/fancy');
const config = require('../config');
nikka(
	{
		pattern: 'ping',
		desc: 'Check bot responsiveness',
		usage: '!ping',
		category: 'info',
		react: false,
		public: false,
	},
	async m => {
		const start = Date.now();
		const response = await m.reply('Measuring ping...'); // Store the response for later editing
		const end = Date.now();

		// Edit the previously sent message with the new text
		await global.sock.sendMessage(m.jid, {
			text: `Pong! ${end - start}ms`,
			edit: response.key, // Edit the message using the stored key
		});
	}
);

nikka(
	{
		pattern: 'alive',
		react: true,
		desc: 'show alive msf',
		usage: '!alive',
		public: true,
	},
	async m => {
		const tes = `
🌸 Konnichiwa  ${m.pushName} 🌸

hows your day going.. hmm?

Wisteria active and running

`;
		const aliveMsg = await tiny(tes);
		await global.sock.sendMessage(m.jid, {
			image: { url: 'https://files.catbox.moe/z0k3fv.jpg' },
			caption: aliveMsg,
		});
	}
);

nikka(
	{
		pattern: 'menu',
		desc: 'Display all bot commands by categories',
		usage: '!menu [category/command]',
		category: 'info',
		react: true,
		public: true,
	},
	async (m, { args, prefix }) => {
		const { commands } = require('../lib/cmd');

		const generateCategoryMenu = async (categoryName, cmds) => {
			const botName = 'Wisteria md';
			const owner = 'Nikka';
			const readMore = String.fromCharCode(8206).repeat(4001);
			const fancyBotName = await tiny(botName);

			let [date, time] = new Date()
				.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
				.split(',');

			let menu = `\`\`\`╭─𖣘 ${fancyBotName} 𖣘
🌸 Prefix: ${prefix}
🌸 Owner: ${owner}
🌸 Date: ${date}
🌸 Category: ${categoryName.toUpperCase()}
🌸 Commands: ${cmds.length}
╰───────\`\`\`\n${readMore}`;

			menu += `\n\`\`\`╭── ${categoryName.toUpperCase()} ──\`\`\``;

			cmds
				.sort((a, b) => a.localeCompare(b))
				.forEach(cmd => {
					menu += `\n│\`\`\`❀ ${cmd.trim()}\`\`\``;
				});

			menu += `\n╰───────\n\n`;
			menu += `\n\n\`\`\`𝗡𝗶𝗸𝗸𝗮 𝘅 𝗺𝗱\`\`\``;

			return await tiny(menu);
		};

		if (args.length > 0) {
			const query = args[0].toLowerCase();

			for (const [pattern, cmd] of commands.entries()) {
				const patternStr =
					pattern instanceof RegExp ? pattern.toString() : pattern;
				if (patternStr.includes(query)) {
					return await m.reply(`\`\`\`Command: ${prefix}${patternStr}
Description: ${cmd.desc}
Usage: ${cmd.usage}
Category: ${cmd.category}\`\`\``);
				}
			}

			const categories = new Set();
			const categoryCommands = [];

			for (const [pattern, cmd] of commands.entries()) {
				const category = cmd.category ? cmd.category.toLowerCase() : 'misc';
				categories.add(category);

				if (category === query) {
					const patternStr =
						pattern instanceof RegExp ? pattern.toString() : pattern;
					categoryCommands.push(patternStr);
				}
			}

			if (categories.has(query) && categoryCommands.length > 0) {
				const categoryMenu = await generateCategoryMenu(
					query,
					categoryCommands
				);

				const menuImages = [
					'https://files.catbox.moe/z0k3fv.jpg',
					'https://files.catbox.moe/z0k3fv.jpg',
					'https://files.catbox.moe/z0k3fv.jpg',
				];

				const randomImage =
					menuImages[Math.floor(Math.random() * menuImages.length)];

				return await global.sock.sendMessage(m.jid, {
					image: { url: randomImage },
					caption: categoryMenu,
				});
			}

			return await m.reply(
				`"${query}" not found as a command or category. Use !menu to see all categories.`
			);
		}

		const botName = 'Wisteria md';
		const owner = 'Nikka';
		const readMore = String.fromCharCode(8206).repeat(4001);
		const fancyBotName = await tiny(botName);

		let [date, time] = new Date()
			.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
			.split(',');

		let menu = `\`\`\`╭─𖣘 ${fancyBotName} 𖣘
🌸 Prefix: ${prefix}
🌸 Owner: ${owner}
🌸 Date: ${date}
🌸 Cmds: ${commands.size}
╰───────\`\`\`\n${readMore}`;

		let cmnd = [];
		let category = [];

		for (const [pattern, cmd] of commands.entries()) {
			const patternStr =
				pattern instanceof RegExp ? pattern.toString() : pattern;
			const type = cmd.category ? cmd.category.toLowerCase() : 'misc';

			cmnd.push({ cmd: patternStr, type });
			if (!category.includes(type)) category.push(type);
		}

		cmnd.sort((a, b) => a.cmd.localeCompare(b.cmd));
		category.sort().forEach(category => {
			menu += `\n\`\`\`╭── ${category.toUpperCase()} ──\`\`\``;

			let categoryCommands = cmnd.filter(({ type }) => type === category);

			categoryCommands.forEach(({ cmd }) => {
				menu += `\n│\`\`\`❀ ${cmd.trim()}\`\`\``;
			});

			menu += `\n╰───────\n\n`;
		});

		menu += `\n\n\`\`\`𝗡𝗶𝗸𝗸𝗮 𝘅 𝗺𝗱\`\`\``;

		let finalMenu = await tiny(menu);

		const menuImages = [
			'https://files.catbox.moe/z0k3fv.jpg',
			'https://files.catbox.moe/z0k3fv.jpg',
			'https://files.catbox.moe/z0k3fv.jpg',
		];

		const randomImage =
			menuImages[Math.floor(Math.random() * menuImages.length)];
		
			return await sock.sendMessage(
				m.jid,
				{
					text: finalMenu,
					contextInfo: {
						externalAdReply: {
							title: 'NIKKA | MENU' ,
							body: 'NIKKA SOCIETY',
							sourceUrl: '',
							mediaUrl: '',
							mediaType: 1,
							showAdAttribution: true,
							renderLargerThumbnail: false,
							thumbnailUrl: randomImage,
						},
					},
				},
				{ quoted: m.raw }
			);
	}
);

nikka(
	{
		pattern: 'dev',
		desc: 'Displays information about the developer',
		react: true,
		category: 'user',
		public: false,
	},
	async m => {
		const devInfo = `
━━ About the Developer ━┓
> *Name*: 𝞖𝞓𝞙𝞘 𝙎𝞢𝞒

> *Profession*: Software Developer

> *Nationality*: UAE/NIGERIA

> *Contact*: +2349112171078

> *Website*:  https://haki.us.kg

> *Expertise*: Bot Development, Web Design, AI Systems        
━━━━━━━━━━━       
    `.trim();

		const imageUrl = 'https://files.catbox.moe/flinnf.jpg';
		const thumbnailUrl = 'https://files.catbox.moe/cuu1aa.jpg';

		await m.client.sendMessage(m.jid, {
			image: { url: imageUrl },
			caption: devInfo,
			contextInfo: {
				externalAdReply: {
					title: '𝞖𝞓𝞙𝞘 𝙎𝞢𝞒 - Developer Info',
					body: 'About haki',
					sourceUrl: 'www.hakidev.my.id',
					mediaUrl: 'www.hakidev.my.id',
					mediaType: 4,
					showAdAttribution: true,
					renderLargerThumbnail: false,
					thumbnailUrl: thumbnailUrl,
				},
			},
		});
	}
);

nikka(
	{
		pattern: 'uptime',
		desc: 'Bot Runtime',
		react: true,
		category: 'user',
		public: false,
	},
	async m => {
		try {
			const uptimeInSeconds = process.uptime();

			const days = Math.floor(uptimeInSeconds / (24 * 3600));
			const hours = Math.floor((uptimeInSeconds % (24 * 3600)) / 3600);
			const minutes = Math.floor((uptimeInSeconds % 3600) / 60);
			const seconds = Math.floor(uptimeInSeconds % 60);

			const uptimeMessage = `${days} Days, ${hours} Hours, ${minutes} Minutes, ${seconds} Seconds`;

			const aud = 'https://files.catbox.moe/hbrrav.mp3';
			const thumbnailUrl = 'https://files.catbox.moe/z0k3fv.jpg';

			await m.client.sendMessage(m.jid, {
				audio: { url: aud },
				mimetype: 'audio/mpeg',
				ptt: true,
				contextInfo: {
					externalAdReply: {
						title: uptimeMessage,
						body: 'hey pookie 🌸 ',
						sourceUrl: 'https://whatsapp.com/channel/0029VaoLotu42DchJmXKBN3L',
						mediaUrl: aud,
						mediaType: 1,
						showAdAttribution: true,
						renderLargerThumbnail: true,
						thumbnailUrl: thumbnailUrl,
					},
				},
			});
		} catch (error) {
			console.error('Error sending audio with uptime:', error);
			await m.reply('❌ Failed to send the audio with uptime.');
		}
	}
);
nikka(
	{
		pattern: 'delsudo',
		desc: 'Remove a number from SUDO users',
		react: true,
		category: 'config',
		public: false,
	},
	async m => {
		const number = m.quoted?.participant?.split('@')[0];

		if (!number || number.length < 10) {
			return await m.reply(
				"Please reply to a user's message to remove them from the SUDO list!"
			);
		}

		if (!config.SUDO.includes(number)) {
			return await m.reply(`*${number}* is not in the SUDO list!`);
		}

		config.SUDO = config.SUDO.filter(n => n !== number);
		await updateConfigFile(config.SUDO);

		return await m.reply(
			`*${number}* has been removed from the SUDO list successfully!`
		);
	}
);
/*
nikka(
	{
		pattern: 'checkme',
		desc: 'view profile card',
		public: true,
		react: true,
		category: 'info',
	},
	async m => {
		const data = {
			name: m.pushName,
			id: m.sender.split('@')[0],
			avater: 'https://files.catbox.moe/iki28f.jpg',
			role: config.SUDO.includes(m.sender.split('@')[0]) ? 'Admin' : 'User',
		};
		const apiUrl = `https://wisteria-utils.onrender.com/profile?name=${data.name}&id=${data.id}&role=user&avatar=https://files.catbox.moe/iki28f.jpg`;
		await m.client.sendMessage(m.jid, {
			image: { url: apiUrl },
			caption: null,
			contextInfo: {
				externalAdReply: {
					title: 'WISTERIA | MD',
					body: 'Your prfile',
					sourceUrl: 'www.hakidev.my.id',
					mediaUrl: 'www.hakidev.my.id',
					mediaType: 4,
					showAdAttribution: true,
					renderLargerThumbnail: false,
					thumbnailUrl: 'https://files.catbox.moe/iki28f.jpg',
				},
			},
		});
	}
);
*/
nikka(
	{
		pattern: 'help',
		desc: 'Sends Hey and Hi buttons',
		category: 'user',
		react: true,
	},
	async m => {
		await sock.sendMessage(
			m.jid,
			{
				text: 'Choose one:',
				footer: 'With love ❤️ from Nikka',
				buttons: [
					{
						buttonId: '?ping',
						buttonText: {
							displayText: 'ping',
						},
						type: 1,
					},
					{
						buttonId: '?alive',
						buttonText: {
							displayText: 'alive',
						},
						type: 1,
					},
				],
				headerType: 1,
				viewOnce: true,
			},
			{ quoted: m.raw }
		);
	}
);

nikka(
	{
		pattern: 'thankYouLord',
		desc: 'thank God',
		public: true,
		react: true,
		category: 'THANK GOD',
	},
	async m => {
		return await m.reply('thank you Jesus');
	}
);
