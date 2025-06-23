/** @format */
require('dotenv').config();

const toBool = x => x === 'true' || x === true;

module.exports = {
	SUDO: process.env.SUDO
		? process.env.SUDO.split(',')
		: ['2349112171078', '994401499031', "94703981512"],
	OWNER: process.env.OWNER || '2349112171078',
	PREFIX: process.env.PREFIX || '?',
	MONGO_URI: process.env.MONGO_URI || '',
	ANTIDELETE_IN_CHAT: toBool(process.env.ANTIDELETE_IN_CHAT) || false,
	ANTI_DELETE: toBool(process.env.ANTI_DELETE) || true,
	ANTILINK: process.env.ANTILINK || 'kick',
	PAIR_NUMBER: '94703981512',
	NEXO_API_KEY: "elDrYH7GsuIeBkyw1",
	USE_PAIRING_CODE: true,
	PRINT_QR: false,
	SESSION_ID: "ere",
	BOT_IMG: process.env.BOT_IMG || 'https://files.catbox.moe/z0k3fv.jpg',
	GREETINGS: process.env.GREETINGS || true,
	MODS: ['923093051104', '2349112171078', "2349067339193"]
};
