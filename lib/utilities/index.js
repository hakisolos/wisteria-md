/** @format */
const { jidDecode, delay } = require('@im-dims/baileys-md');
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

module.exports = {
	isAdmin,
	AI,
};
