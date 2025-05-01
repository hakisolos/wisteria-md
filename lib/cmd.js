/** @format */

const fs = require('fs');
const path = require('path');
const config = require('../config');

const commands = new Map();
const eventHandlers = new Map();
const PREFIX = config.PREFIX;

// Event types
const EVENT_TYPES = {
	TEXT: 'text',
	IMAGE: 'image',
	VIDEO: 'video',
	DOCUMENT: 'document',
	STICKER: 'sticker',
	AUDIO: 'audio',
	REPLY_TO_BOT: 'reply',
	ANY: 'any',
	POLL: 'poll',
	CONTACT: 'contact',
	LOCATION: 'location',
};

function nikka(options, callback) {
	// Check if we're registering an event handler
	if (options.on) {
		const eventType = options.on;
		const handler = {
			type: eventType,
			desc: options.desc || `${eventType} event handler`,
			public: options.public !== undefined ? options.public : true,
			react: options.react || false,
			callback,
		};

		if (!eventHandlers.has(eventType)) {
			eventHandlers.set(eventType, []);
		}
		eventHandlers.get(eventType).push(handler);

		return {
			type: 'event',
			options: handler,
			callback,
		};
	}

	// Otherwise, register a command as before
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
		type: 'command',
		options: cmdOptions,
		callback,
	};
}

function hasPermission(m, cmd) {
	if (cmd.public === true) return true;

	const senderNumber = m.sender.split('@')[0];
	const botNumber = global.sock.user.id.split('@')[0];

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
	// Handle button response messages
	const buttonId = m.raw?.message?.buttonsResponseMessage?.selectedButtonId;
	if (buttonId && !m._processedButton) {
		// Add a flag to prevent recursion
		console.log(`Button pressed: ${buttonId}`);

		// If the buttonId starts with the prefix, process it as a command
		if (buttonId.startsWith(PREFIX)) {
			// Extract the command without prefix and prepare arguments
			const input = buttonId.slice(PREFIX.length).trim();
			const args = input.split(/\s+/);
			const command = args.shift().toLowerCase();
			const match = args.join(' ');

			// Directly find and execute the matched command
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
						console.error(`Error executing button command ${command}:`, err);
						await m.reply(`Error executing command: ${err.message}`);
						if (cmd.react) await m.react('❌');
						return true;
					}
				}
			}

			// If no command matched this button, try a fallback
			await m.reply(`No handler found for button command: ${buttonId}`);
			return true;
		} else {
			// For buttons without the prefix, handle them here

			// Example: Handle "alive" button without prefix
			if (buttonId === 'alive') {
				await m.reply(
					'*Bot is alive and running!* 🌸\n\n• Version: 1.0.0\n• Status: Online\n• Uptime: ' +
						formatUptime(process.uptime()) +
						'\n\n_Powered by Wisteria MD_'
				);
				return true;
			}

			// Add other custom button handlers here
		}
	}

	// Regular command handling
	if (m.body && m.body.startsWith(PREFIX)) {
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
	}

	// If no command matched, try to handle as an event
	return await handleEvent(m);
}

// Helper function to format uptime nicely
function formatUptime(seconds) {
	const days = Math.floor(seconds / (24 * 60 * 60));
	seconds -= days * 24 * 60 * 60;
	const hours = Math.floor(seconds / (60 * 60));
	seconds -= hours * 60 * 60;
	const minutes = Math.floor(seconds / 60);
	seconds = Math.floor(seconds - minutes * 60);

	let uptime = '';
	if (days > 0) uptime += `${days}d `;
	if (hours > 0) uptime += `${hours}h `;
	if (minutes > 0) uptime += `${minutes}m `;
	uptime += `${seconds}s`;

	return uptime;
}
async function handleEvent(m) {
	// First check for replies to the bot
	if (
		m.quoted !== null &&
		m.quoted.sender === m.user &&
		eventHandlers.has(EVENT_TYPES.REPLY_TO_BOT)
	) {
		const replyHandlers = eventHandlers.get(EVENT_TYPES.REPLY_TO_BOT);
		for (const handler of replyHandlers) {
			try {
				if (!hasPermission(m, handler)) continue;

				if (handler.react) await m.react('⏳');
				await handler.callback(m, { eventType: EVENT_TYPES.REPLY_TO_BOT });
				if (handler.react) await m.react('✅');
			} catch (err) {
				console.error(`Error in reply to bot handler:`, err);
				if (handler.react) await m.react('❌');
			}
		}
		return true; // Stop processing if it's a reply to the bot
	}

	// Then handle based on content type
	let eventType;

	// Check the message structure more thoroughly
	const messageContent = m.message || {};

	if (messageContent.imageMessage) {
		eventType = EVENT_TYPES.IMAGE;
	} else if (messageContent.videoMessage) {
		eventType = EVENT_TYPES.VIDEO;
	} else if (messageContent.documentMessage) {
		eventType = EVENT_TYPES.DOCUMENT;
	} else if (messageContent.stickerMessage) {
		eventType = EVENT_TYPES.STICKER;
	} else if (messageContent.audioMessage) {
		eventType = EVENT_TYPES.AUDIO;
	} else if (messageContent.pollCreationMessage) {
		eventType = EVENT_TYPES.POLL;
	} else if (messageContent.contactMessage) {
		eventType = EVENT_TYPES.CONTACT;
	} else if (messageContent.locationMessage) {
		eventType = EVENT_TYPES.LOCATION;
	} else {
		// Default to text for any other type
		eventType = EVENT_TYPES.TEXT;
	}

	let handled = false;

	// Process specific event type handlers
	if (eventHandlers.has(eventType)) {
		const typeHandlers = eventHandlers.get(eventType);
		for (const handler of typeHandlers) {
			try {
				if (!hasPermission(m, handler)) continue;

				if (handler.react) await m.react('⏳');
				await handler.callback(m, { eventType });
				if (handler.react) await m.react('✅');
				handled = true;
			} catch (err) {
				console.error(`Error in ${eventType} handler:`, err);
				if (handler.react) await m.react('❌');
			}
		}
	}

	// Finally process 'any' handlers
	if (eventHandlers.has(EVENT_TYPES.ANY)) {
		const anyHandlers = eventHandlers.get(EVENT_TYPES.ANY);
		for (const handler of anyHandlers) {
			try {
				if (!hasPermission(m, handler)) continue;

				if (handler.react) await m.react('⏳');
				await handler.callback(m, { eventType });
				if (handler.react) await m.react('✅');
				handled = true;
			} catch (err) {
				console.error(`Error in 'any' handler:`, err);
				if (handler.react) await m.react('❌');
			}
		}
	}

	return handled;
}

// Adding a function to install plugins from eval code
function installPluginFromCode(pluginCode) {
	try {
		// Create a function context with access to nikka
		const contextFunction = new Function(
			'nikka',
			'EVENT_TYPES',
			'require',
			pluginCode
		);

		// Execute the plugin code with nikka function in context
		contextFunction(nikka, EVENT_TYPES, require);

		return true;
	} catch (error) {
		console.error('Failed to install plugin from code:', error);
		return false;
	}
}

async function loadCommands() {
	const pluginsFolder = path.join(__dirname, '../plugins');

	if (!fs.existsSync(pluginsFolder)) {
		console.error('❌ Plugins folder not found at', pluginsFolder);
		return;
	}

	console.log('🔧 Installing plugins...');

	const files = fs
		.readdirSync(pluginsFolder)
		.filter(file => file.endsWith('.js'));

	// Clear existing handlers before loading
	commands.clear();
	eventHandlers.clear();

	for (const file of files) {
		try {
			const pluginPath = path.join(pluginsFolder, file);
			delete require.cache[require.resolve(pluginPath)];
			require(pluginPath);
		} catch (error) {
			console.error(`❌ Failed to load plugin ${file}:`, error);
		}
	}

	console.log('🎉 Plugins installed, finished');
}

// Make nikka global so it can be accessed from eval code
global.nikka = nikka;
global.EVENT_TYPES = EVENT_TYPES;

module.exports = {
	nikka,
	executeCommand,
	loadCommands,
	commands,
	eventHandlers,
	PREFIX,
	EVENT_TYPES,
	installPluginFromCode,
};
