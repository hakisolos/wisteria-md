/** @format */

const fs = require('fs');
const path = require('path');
const config = require('../config');

const commands = new Map();
const PREFIX = config.PREFIX;

function nikka(options, callback) {
	const cmdOptions = {
		pattern: '',
		desc: 'No description provided',
		usage: '',
		category: 'misc',
		react: false,
		public: true,
		...options,
	};

	commands.set(cmdOptions.pattern, {
		...cmdOptions,
		callback,
	});

	return {
		options: cmdOptions,
		callback,
	};
}

function hasPermission(m, cmd) {
	if (cmd.public === true) return true;

	const senderNumber = m.sender.split('@')[0];
	const botNumber = sock.user.id.split('@')[0];

	if (m.key && m.key.fromMe) return true;
	if (senderNumber === botNumber) return true;

	if (
		(config.SUDO && config.SUDO.includes(senderNumber)) ||
		(config.OWNER && config.OWNER === senderNumber)
	) {
		return true;
	}

	return false;
}

async function executeCommand(m) {
	if (!m.body.startsWith(PREFIX)) return false;

	const input = m.body.slice(PREFIX.length).trim();
	const args = input.split(/\s+/);
	const command = args.shift().toLowerCase();
	const match = args.join(' '); // This will be the text after the command

	for (const [pattern, cmd] of commands.entries()) {
		const isMatch =
			(typeof pattern === 'string' && pattern === command) ||
			(pattern instanceof RegExp && pattern.test(command));

		if (isMatch) {
			try {
				if (!hasPermission(m, cmd)) {
					return true;
				}

				if (cmd.react) await m.react('⏳');

				// Pass match along with other parameters
				await cmd.callback(m, { match, args, command, prefix: PREFIX });

				if (cmd.react) await m.react('✅');
				return true;
			} catch (err) {
				console.error(`Error executing command ${command}:`, err);
				await m.reply(`Error executing command: ${err.message}`);
				if (cmd.react) await m.react('❌');
				return true;
			}
		}
	}

	return false;
}

async function loadCommands() {
	const pluginsFolder = path.join(__dirname, '../plugins');

	if (!fs.existsSync(pluginsFolder)) {
		console.error('❌ Plugins folder not found at', pluginsFolder);
		return;
	}

	const files = fs
		.readdirSync(pluginsFolder)
		.filter(file => file.endsWith('.js'));

	console.log(`🔍 Loading ${files.length} plugin files...`);

	for (const file of files) {
		try {
			const pluginPath = path.join(pluginsFolder, file);
			delete require.cache[require.resolve(pluginPath)];
			require(pluginPath);
			console.log(`✅ Loaded plugin: ${file}`);
		} catch (error) {
			console.error(`❌ Failed to load plugin ${file}:`, error);
		}
	}

	console.log(`🎉 Successfully loaded ${commands?.size || 0} commands`);
}

module.exports = {
	nikka,
	executeCommand,
	loadCommands,
	commands,
	PREFIX,
};
