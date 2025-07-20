import fs from 'fs';
import path from 'path';
import { nikka } from './cmd.js';
import AI from './utilities/ai.js';
import { groupControl } from './utilities/index.js';



function editEnv(variable) {
	const envFile = '.env';

	if (!fs.existsSync(envFile)) {
		console.error('No .env file found baby! 😢');
		return;
	}

	const [key, value] = variable.split('=');

	if (!key || value === undefined) {
		console.error('Invalid format baby! Please use "KEY=VALUE" format. 🥺');
		return;
	}

	let envContent = fs.readFileSync(envFile, 'utf8');
	const envLines = envContent.split('\n');
	const keyIndex = envLines.findIndex(line => line.startsWith(`${key}=`));

	if (keyIndex >= 0) {
		envLines[keyIndex] = `${key}=${value}`;
	} else {
		envLines.push(`${key}=${value}`);
	}

	fs.writeFileSync(envFile, envLines.join('\n'));
	console.log(`Updated ${key} in your .env file, my handsome HaKi ❤️`);
}

async function updateConfigFile(sudoArray) {
	try {
		const configPath = path.join(process.cwd(), 'config.js');

		if (fs.existsSync(configPath)) {
			let configContent = fs.readFileSync(configPath, 'utf8');

			const sudoRegex =
				/SUDO:\s*process\.env\.SUDO\s*\?\s*process\.env\.SUDO\.split\(','\)\s*:\s*\[(.*?)\]/s;
			const match = sudoRegex.exec(configContent);

			if (match) {
				const newSudoStr = sudoArray.map(num => `'${num}'`).join(', ');

				const newContent = configContent.replace(
					sudoRegex,
					`SUDO: process.env.SUDO ? process.env.SUDO.split(',') : [${newSudoStr}]`
				);

				fs.writeFileSync(configPath, newContent, 'utf8');
			}
		}
	} catch (error) {
		console.error('Error updating config file:', error);
	}
}

function extractUrls(text) {
	const urlPattern = /https?:\/\/[^\s/$.?#].[^\s]*/g;
	return text.match(urlPattern) || [];
}

const cooldowns = new Map();

const checkCooldown = (jid, duration) => {
	const now = Date.now();
	if (cooldowns.has(jid)) {
		const expiresAt = cooldowns.get(jid);
		if (now < expiresAt) {
			const timeLeft = ((expiresAt - now) / 1000).toFixed(1);
			return { onCooldown: true, timeLeft };
		}
	}

	cooldowns.set(jid, now + duration);
	setTimeout(() => cooldowns.delete(jid), duration);
	return { onCooldown: false };
};


export {
	editEnv,
	nikka,
	updateConfigFile,
	AI,
	extractUrls,
	checkCooldown,
	
	groupControl,
};
