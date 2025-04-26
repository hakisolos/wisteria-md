/** @format */
const chalk = require('chalk');
const config = require('../config');

class AntideleteModule {
	constructor() {
		this.ownerJid = null;
		this.enabled = false;
		this.sock = null;
	}

	isGroup(jid) {
		return jid.endsWith('@g.us');
	}

	isStatus(jid) {
		return jid === 'status@broadcast';
	}

	shouldTrack(msg) {
		if (this.isStatus(msg.key.remoteJid)) return false;
		if (!msg.message) return false;

		const exclude = [
			'protocolMessage',
			'senderKeyDistributionMessage',
			'messageContextInfo',
		];

		const msgtype = Object.keys(msg.message)[0];
		return !exclude.includes(msgtype);
	}

	setOwnerJid() {
		const nums = config.OWNER;
		if (!nums) {
			this.logErr('Owner numbers not set in global settings');
			return;
		}
		this.ownerJid = `${nums.split(',')[0].trim()}@s.whatsapp.net`;
	}

	makeFake(id) {
		return {
			key: {
				fromMe: false,
				participant: '0@s.whatsapp.net',
				remoteJid: 'status@broadcast',
				id: id,
			},
			message: {
				conversation: 'ANTIDELETE DETECTED',
			},
		};
	}

	async getGrpName(jid) {
		try {
			const meta = await this.sock.groupMetadata(jid);
			return meta.subject;
		} catch (error) {
			this.logErr('Error fetching group name', error);
			return jid.split('@')[0];
		}
	}

	async handleUpdt(updt, store) {
		if (!config?.ANTI_DELETE || !this.enabled || !this.ownerJid) return;

		const chat = updt.key.remoteJid;
		const msgid = updt.key.id;

		if (this.isStatus(chat)) return;

		const isDel =
			updt.update.message === null ||
			updt.update.messageStubType === 2 ||
			updt.update.message?.protocolMessage?.type === 0;

		if (isDel) {
			try {
				const delmsg = await store.loadMessage(chat, msgid);
				if (!delmsg) return;
				if (!this.shouldTrack(delmsg)) return;
				await this.fwdDelMsg(chat, delmsg);
			} catch (error) {
				this.logErr('Error handling deleted message', error);
			}
		}
	}

	async fwdDelMsg(chat, delmsg) {
		const delby = delmsg.key.fromMe
			? this.sock.user.id
			: delmsg.key.participant || chat;
		const sender = delmsg.key.participant || delmsg.key.remoteJid;
		const sendto = config.ANTIDELETE_IN_CHAT ? chat : this.ownerJid;

		try {
			const fwdmsg = await this.sock.sendMessage(
				sendto,
				{ forward: delmsg },
				{ quoted: this.makeFake(delmsg.key.id) }
			);

			if (fwdmsg) {
				const chatname = this.isGroup(chat)
					? await this.getGrpName(chat)
					: 'Private Chat';

				const mentions = [sender, delby].filter(
					(jid, index, self) => self.indexOf(jid) === index
				);

				const txt = config.ANTIDELETE_IN_CHAT
					? this.makePubNote(sender, delby)
					: this.makeNote(chatname, sender, delby, chat);

				await this.sock.sendMessage(
					sendto,
					{
						text: txt,
						mentions: mentions,
					},
					{ quoted: fwdmsg }
				);
			}
		} catch (error) {
			this.logErr('Error forwarding deleted message', error);
		}
	}

	makePubNote(sender, delby) {
		return (
			`*⚠ DELETED MESSAGE DETECTED*\n\n` +
			`• Author: @${sender.split('@')[0]}\n` +
			`• Deleted by: @${delby.split('@')[0]}\n` +
			`• Time: ${new Date().toLocaleTimeString()}`
		);
	}

	makeNote(chatname, sender, delby, chat) {
		return (
			`*[DELETED MESSAGE INFORMATION]*\n\n` +
			`*TIME:* ${new Date().toLocaleString()}\n` +
			`*MESSAGE FROM:* @${sender.split('@')[0]}\n` +
			`*CHAT:* ${chatname}\n` +
			`*DELETED BY:* @${delby.split('@')[0]}\n` +
			`*IS GROUP:* ${this.isGroup(chat) ? 'Yes' : 'No'}`
		);
	}

	logErr(msg, error) {
		console.error(chalk.red(` ${msg}: ${error?.message || error}`));
	}

	async setup(sock) {
		if (!config.ANTI_DELETE) {
			console.log(chalk.yellow('Antidelete is disabled in global settings'));
			return this;
		}

		try {
			this.setOwnerJid();
			this.enabled = true;
			this.sock = sock;
			return this;
		} catch (error) {
			this.logErr('Error setting up Antidelete module', error);
			throw error;
		}
	}

	async execute(sock, updt, options = {}) {
		await this.handleUpdt(updt, options.store);
	}
}

async function setupAd(sock) {
	const admod = new AntideleteModule();
	return admod.setup(sock);
}

module.exports = {
	setupAd,
};
