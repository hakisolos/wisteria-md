/** @format */

// Connect to MongoDB
const mongoose = require('mongoose');

// Create schema for antilink settings
const AntilinkSchema = new mongoose.Schema({
	jid: {
		type: String,
		required: true,
		unique: true,
	},
	enabled: {
		type: Boolean,
		default: false,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

// Create model from schema
const AntilinkModel = mongoose.model('Antilink', AntilinkSchema);

/**
 * Antilink management object with methods for enabling, disabling, and checking status
 */
const Antilink = {
	/**
	 * Enable antilink feature in a chat
	 * @param {string} jid - The chat's JID (Jabber ID)
	 * @returns {Promise<boolean>} - True if successful, false otherwise
	 */
	enable: async function (jid) {
		try {
			// Using upsert: if the document exists, it updates it; if not, it creates it
			const result = await AntilinkModel.findOneAndUpdate(
				{ jid },
				{ jid, enabled: true, updatedAt: Date.now() },
				{ upsert: true, new: true }
			);
			console.log(`Antilink enabled for ${jid}`);
			return true;
		} catch (error) {
			console.error('Error enabling antilink:', error);
			return false;
		}
	},

	/**
	 * Disable antilink feature in a chat
	 * @param {string} jid - The chat's JID (Jabber ID)
	 * @returns {Promise<boolean>} - True if successful, false otherwise
	 */
	disable: async function (jid) {
		try {
			const result = await AntilinkModel.findOneAndUpdate(
				{ jid },
				{ enabled: false, updatedAt: Date.now() },
				{ new: true }
			);

			if (!result) {
				// If no document was found, create one with enabled set to false
				await AntilinkModel.create({ jid, enabled: false });
			}

			console.log(`Antilink disabled for ${jid}`);
			return true;
		} catch (error) {
			console.error('Error disabling antilink:', error);
			return false;
		}
	},

	/**
	 * Check if antilink is enabled for a chat
	 * @param {string} jid - The chat's JID (Jabber ID)
	 * @returns {Promise<boolean>} - True if enabled, false otherwise
	 */
	status: async function (jid) {
		try {
			const chat = await AntilinkModel.findOne({ jid });
			return chat ? chat.enabled : false;
		} catch (error) {
			console.error('Error checking antilink status:', error);
			return false;
		}
	},

	/**
	 * Get all chats where antilink is enabled
	 * @returns {Promise<Array>} - Array of JIDs where antilink is enabled
	 */
	getEnabledChats: async function () {
		try {
			const chats = await AntilinkModel.find({ enabled: true });
			return chats.map(chat => chat.jid);
		} catch (error) {
			console.error('Error getting all enabled antilink chats:', error);
			return [];
		}
	},

	/**
	 * Optional: Migration function to move data from JSON to MongoDB
	 */
	migrateFromJSON: async function () {
		try {
			const fs = require('fs');
			const path = require('path');
			const storePath = path.join(__dirname, 'antilink.json');

			if (fs.existsSync(storePath)) {
				const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));

				// Create array of promises for all inserts
				const insertPromises = data.enabledChats.map(jid => {
					return AntilinkModel.findOneAndUpdate(
						{ jid },
						{ jid, enabled: true },
						{ upsert: true }
					);
				});

				await Promise.all(insertPromises);
				console.log('Antilink migration completed successfully');
			}
		} catch (error) {
			console.error('Antilink migration failed:', error);
		}
	},

	// Export the model for direct access if needed
	model: AntilinkModel,
};

module.exports = Antilink;
