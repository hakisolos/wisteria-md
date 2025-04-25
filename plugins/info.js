/** @format */
const { nikka } = require('../lib/cmd');
const { tiny } = require('../lib/utilities/font/fancy');
nikka(
	{
		pattern: 'ping',
		desc: 'Check bot responsiveness',
		usage: '!ping',
		category: 'info',
		react: true,
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
		pattern: 'help',
		desc: 'Show help menu',
		usage: '!help [command]',
		category: 'info',
	},
	async (m, { args }) => {
		const { commands } = require('../lib/cmd');

		if (args.length > 0) {
			// Help for specific command
			const cmdName = args[0].toLowerCase();
			let found = false;

			for (const [pattern, cmd] of commands.entries()) {
				const patternStr =
					pattern instanceof RegExp ? pattern.toString() : pattern;
				if (patternStr.includes(cmdName)) {
					found = true;
					await m.reply(
						`*Command:* ${patternStr}\n*Description:* ${cmd.desc}\n*Usage:* ${cmd.usage}\n*Category:* ${cmd.category}`
					);
					break;
				}
			}

			if (!found) {
				await m.reply(
					`Command ${cmdName} not found. Use !help for all commands.`
				);
			}
		} else {
			// General help menu
			let helpText = '*🤖 Nikka Bot Commands 🤖*\n\n';
			const categories = {};

			// Group commands by category
			for (const [pattern, cmd] of commands.entries()) {
				const category = cmd.category || 'misc';
				if (!categories[category]) categories[category] = [];

				const patternStr =
					pattern instanceof RegExp ? pattern.toString() : pattern;
				categories[category].push(`!${patternStr} - ${cmd.desc}`);
			}

			// Build help text
			for (const [category, cmds] of Object.entries(categories)) {
				helpText += `*${category.toUpperCase()}*\n${cmds.join('\n')}\n\n`;
			}

			helpText += 'Use !help [command] for specific command help';
			await m.reply(helpText);
		}
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

		await global.sock.sendMessage(m.jid, {
			image: { url: randomImage },
			caption: finalMenu,
		});
	}
);
