/** @format */

const { nikka } = require('../lib/cmd');

nikka(
	{
		pattern: 'jid',
		desc: 'Get group or quoted user JID',
		react: true,
		category: 'user',
		public: false,
	},
	async m => {
		let replyJid;
		if (m.quoted) {
			replyJid = m.quoted.participant || m.quoted.sender || m.jid;
		} else {
			replyJid = m.jid;
		}

		await m.reply(replyJid);
	}
);

nikka(
	{
		pattern: 'setbio',
		desc: 'To change your profile status',
		react: true,
		category: 'user',
		public: false,
	},
	async (m, { match }) => {
		match = match || m.quoted?.text;
		if (!match)
			return await m.reply('*_Need Text_!*\n*Example: setbio haki solos*.');
		await m.client.updateProfileStatus(match);
		await m.reply('_Bio updated_');
	}
);

nikka(
	{
		pattern: 'getgpp',
		desc: 'Fetch the profile picture of the current group chat.',
		react: true,
		category: 'group',
		public: false,
	},
	async m => {
		if (!m.isGroup) {
			return await m.reply('This command can only be used in group chats.');
		}

		const groupPicUrl = await m.client
			.profilePictureUrl(m.jid, 'image')
			.catch(() => null);

		if (!groupPicUrl) {
			return await m.reply('No profile picture found for this group.');
		}

		await m.client.sendMessage(m.jid, {
			image: { url: groupPicUrl },
			quoted: m,
		});
	}
);

nikka(
	{
		pattern: 'getpp',
		desc: 'Fetch the profile picture of a mentioned or replied user.',
		react: true,
		category: 'user',
		public: false,
	},
	async m => {
		const targetUser = m.quoted?.sender;

		if (!targetUser) {
			return await m.reply(
				"Please mention a user or reply to a user's message."
			);
		}

		const profilePicUrl = await m.client
			.profilePictureUrl(targetUser, 'image')
			.catch(() => null);

		if (!profilePicUrl) {
			return await m.reply('No profile picture found for the specified user.');
		}

		await m.client.sendMessage(m.jid, {
			image: { url: profilePicUrl },
		});
	}
);

nikka(
	{
		pattern: 'getdevice',
		desc: 'Fetch device',
		react: true,
		category: 'user',
		public: true,
	},
	async m => {
		if (!m.quoted) {
			return await m.reply(
				'Please reply to a message to check the device type.'
			);
		}
		const device = require('baileys').getDevice(m.quoted.key.id);
		let deviceType = '';
		switch (device) {
			case 'android':
				deviceType = 'Android';
				break;
			case 'ios':
				deviceType = 'iOS';
				break;
			case 'web':
			case 'Unknown':
				deviceType = 'WhatsApp Web';
				break;
			default:
				deviceType = 'WhatsApp Web';
				break;
		}
		return await m.reply(deviceType);
	}
);

nikka(
	{
		pattern: 'listgc',
		desc: 'Lists all the groups you are in',
		react: true,
		category: 'user',
		public: false,
	},
	async m => {
		const groups = await m.client.groupFetchAllParticipating();
		let groupList = Object.values(groups)
			.map(
				(group, index) =>
					`${index + 1}. *${group.subject}*\n   JID: ${group.id}`
			)
			.join('\n\n');

		if (!groupList) {
			return await m.reply('I am not in any groups.');
		}

		await m.reply(`*My Groups:*\n\n${groupList}`);
	}
);
nikka(
	{
		pattern: 'save',
		desc: 'save status',
		react: true,
		category: 'user',
		public: false,
	},
	async (message, m) => {
		if (!m.quoted) {
			return await message.reply(
				'Please reply to the message you want to save as status.'
			);
		}
		await m.client.sendMessage(m.jid, {
			forward: m.quoted,
		});
	}
);
