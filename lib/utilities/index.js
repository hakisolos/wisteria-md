/** @format */
const { jidDecode, delay } = require('baileys');
const AI = require('./ai');
const isAdmin = async (jid, user, client) => {
	const decodeJid = jid => {
		if (!jid) return jid;
		if (/:\d+@/gi.test(jid)) {
			let decode = jidDecode(jid) || {};
			return (
				(decode.user && decode.server && decode.user + '@' + decode.server) ||
				jid
			);
		} else return jid;
	};
	let groupMetadata = await client.groupMetadata(jid);
	const groupAdmins = groupMetadata.participants
		.filter(v => v.admin !== null)
		.map(v => v.id);
	return groupAdmins.includes(decodeJid(user));
};
const groupControl = async (m) => {
	if (!m.isGroup) {
		await m.reply('_This command is specifically for groups_');
		return false;
	}
	const groupMetadata = await m.client.groupMetadata(m.jid);
	const groupAdmins = groupMetadata.participants
		.filter(p => p.admin)
		.map(p => p.id);
	if (!groupAdmins.includes(m.sender) && !m.isCreator) {
		await m.reply('This command can only be used by admins!');
		return false;
	}
	return true;
};
module.exports = {
	isAdmin,
	groupControl,
	AI,
};
