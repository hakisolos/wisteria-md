/** @format */

const mongoose = require('mongoose');

const WarnSchema = new mongoose.Schema({
	jid: {
		type: String,
		required: true,
	},
	userId: {
		type: String,
		required: true,
	},
	reason: {
		type: String,
		default: 'No reason provided',
	},
	issuedBy: {
		type: String,
		default: null,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

WarnSchema.index({ jid: 1, userId: 1 });

const WarnModel = mongoose.model('Warning', WarnSchema);

const Warn = {
	addWarn: async function (
		jid,
		userId,
		reason = 'No reason provided',
		issuedBy = null
	) {
		try {
			const warning = await WarnModel.create({
				jid,
				userId,
				reason,
				issuedBy,
				createdAt: Date.now(),
			});
			console.log(`Warning added for user ${userId} in chat ${jid}`);
			return warning;
		} catch (error) {
			console.error('Error adding warning:', error);
			return null;
		}
	},

	getWarns: async function (jid, userId) {
		try {
			const warnings = await WarnModel.find({ jid, userId }).sort({
				createdAt: 1,
			});
			return warnings;
		} catch (error) {
			console.error('Error getting warnings:', error);
			return [];
		}
	},

	getWarnCount: async function (jid, userId) {
		try {
			const count = await WarnModel.countDocuments({ jid, userId });
			return count;
		} catch (error) {
			console.error('Error getting warning count:', error);
			return 0;
		}
	},

	resetWarns: async function (jid, userId) {
		try {
			const result = await WarnModel.deleteMany({ jid, userId });
			console.log(
				`Removed ${result.deletedCount} warnings for user ${userId} in chat ${jid}`
			);
			return result.deletedCount > 0;
		} catch (error) {
			console.error('Error resetting warnings:', error);
			return false;
		}
	},

	removeWarn: async function (warnId) {
		try {
			const result = await WarnModel.findByIdAndDelete(warnId);
			return result !== null;
		} catch (error) {
			console.error('Error removing specific warning:', error);
			return false;
		}
	},

	getAllChatWarnings: async function (jid) {
		try {
			const warnings = await WarnModel.find({ jid }).sort({ createdAt: 1 });
			const warningsByUser = {};
			warnings.forEach(warn => {
				if (!warningsByUser[warn.userId]) {
					warningsByUser[warn.userId] = [];
				}
				warningsByUser[warn.userId].push(warn);
			});
			return warningsByUser;
		} catch (error) {
			console.error('Error getting all chat warnings:', error);
			return {};
		}
	},

	migrateFromJSON: async function (filePath) {
		try {
			const fs = require('fs');
			const path = require('path');
			const storePath = filePath || path.join(__dirname, 'warnings.json');

			if (fs.existsSync(storePath)) {
				const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));
				const insertPromises = [];

				Object.keys(data).forEach(jid => {
					const chatWarnings = data[jid];
					Object.keys(chatWarnings).forEach(userId => {
						const userWarnings = chatWarnings[userId];
						userWarnings.forEach(warning => {
							insertPromises.push(
								WarnModel.create({
									jid,
									userId,
									reason: warning.reason || 'No reason provided',
									issuedBy: warning.issuedBy || null,
									createdAt: warning.timestamp
										? new Date(warning.timestamp)
										: Date.now(),
								})
							);
						});
					});
				});

				await Promise.all(insertPromises);
				console.log('Warnings migration completed successfully');
			}
		} catch (error) {
			console.error('Warnings migration failed:', error);
		}
	},

	model: WarnModel,
};

module.exports = Warn;
