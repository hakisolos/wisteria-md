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
	if (!m) {
		return;
	}

	if (m.body && m.body.startsWith('$')) {
		if (!(m.key && m.fromMe) && !isSudoOrOwner(m.sender)) {
			return;
		}

		const code = m.body.slice(1).trim();
		const result = await eval(`(async () => { ${code} })()`);
		const response = typeof result === 'string' ? result : util.inspect(result);
		await m.reply(response) 
		console.log(response)
		return;
	}

	const commandExecuted = await executeCommand(m);
	if (commandExecuted) return;
}

module.exports = handleMessage;
