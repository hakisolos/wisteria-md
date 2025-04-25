/** @format */
const { executeCommand } = require('./cmd');
const config = require('../config');
const util = require('util');

function isSudoOrOwner(senderJID) {
	const senderNumber = senderJID.split('@')[0];

	if (config.SUDO && Array.isArray(config.SUDO)) {
		for (const sudo of config.SUDO) {
			if (senderNumber === sudo) {
				return true;
			}
		}
	}

	if (config.OWNER && senderNumber === config.OWNER) {
		return true;
	}

	return false;
}

async function handleMessage(m) {
	try {
		if (m.body.startsWith('$')) {
			if (m.key && m.key.fromMe) {
				// nothing here
			} else {
				if (!isSudoOrOwner(m.sender)) {
					return;
				}
			}

			try {
				const code = m.body.slice(1).trim();
				const result = await eval(`(async () => { ${code} })()`);

				// 👇 Check if result is a string
				const response =
					typeof result === 'string' ? result : util.inspect(result);

				await m.reply(response);
			} catch (err) {
				await m.reply(`❌ Error: ${err.message}`);
			}
			return;
		}

		const commandExecuted = await executeCommand(m);
		if (commandExecuted) return;
	} catch (err) {
		console.error('Message handler error:', err);
	}
}

module.exports = handleMessage;
