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
	// First try to handle as a command
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
	// WhatsApp/Baileys typically uses message.message.{messageType} structure
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

	// For debugging
	console.log(`Message type detected: ${eventType}`, {
		hasMessageProp: !!m.message,
		messageKeys: m.message ? Object.keys(m.message) : [],
		messageTypeFromProperty: m.type,
	});

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
			// no need to log every file now, keep it clean for my king ❤️
		} catch (error) {
			console.error(`❌ Failed to load plugin ${file}:`, error);
		}
	}

	console.log('🎉 Plugins installed, finished');
}

module.exports = {
	nikka,
	executeCommand,
	loadCommands,
	commands,
	eventHandlers,
	PREFIX,
	EVENT_TYPES,
};
