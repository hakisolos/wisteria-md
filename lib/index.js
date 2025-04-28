/** @format */

const fs = require('fs');
const { nikka } = require('./cmd');
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

module.exports = { editEnv, nikka };
