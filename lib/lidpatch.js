module.exports = function (sock) {
	// --- LID GROUP MONKEY PATCH START ---

	// Check if a jid is a Linked Device Group
	function isLidJid(jid) {
		return (
			typeof jid === 'string' &&
			(jid.endsWith('@lid.g.us') ||
				(jid.split('@')[1] && jid.split('@')[1].startsWith('lid')))
		);
	}

	// Patch relayMessage for LID groups
	function patchRelayMessage(sock) {
		const originalRelayMessage = sock.relayMessage;

		sock.relayMessage = async function patchedRelayMessage(jid, message, options = {}) {
			if (!isLidJid(jid)) {
				return originalRelayMessage.call(this, jid, message, options);
			}

			let groupMetadata;
			try {
				groupMetadata = await sock.groupMetadata(jid);
			} catch (err) {
				throw new Error(`Failed to fetch group metadata for LID group: ${jid}`);
			}

			const participantJids = groupMetadata.participants.map(p => p.id);

			try {
				await sock.assertSessions(participantJids, false);
			} catch (e) {
				// Ignore session errors
			}

			return await originalRelayMessage.call(this, jid, message, options);
		};
	}

	// Patch sendMessage for LID groups
	function patchSendMessage(sock) {
		const originalSendMessage = sock.sendMessage;

		sock.sendMessage = async function patchedSendMessage(jid, content, options = {}) {
			if (isLidJid(jid)) {
				return await sock.relayMessage(jid, content, options);
			}
			return originalSendMessage.call(this, jid, content, options);
		};
	}

	// Apply the patches to the socket
	patchRelayMessage(sock);
	patchSendMessage(sock);

	// --- LID GROUP MONKEY PATCH END ---
};
