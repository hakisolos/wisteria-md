/** @format */

// Connect to MongoDB
const mongoose = require('mongoose');

// Create schema for enabled chats
const ChatbotSchema = new mongoose.Schema({
	jid: {
		type: String,
		required: true,
		unique: true,
	},
	enabled: {
		type: Boolean,
		default: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

// Create model from schema
const Chatbot = mongoose.model('Chatbot', ChatbotSchema);

// Enable chatbot in a chat
async function enableChatbot(jid) {
	try {
		// Using upsert: if the document exists, it updates it; if not, it creates it
		const result = await Chatbot.findOneAndUpdate(
			{ jid },
			{ jid, enabled: true },
			{ upsert: true, new: true }
		);
		return true;
	} catch (error) {
		console.error('Error enabling chatbot:', error);
		return false;
	}
}

// Disable chatbot in a chat
async function disableChatbot(jid) {
	try {
		const result = await Chatbot.findOneAndUpdate(
			{ jid },
			{ enabled: false },
			{ new: true }
		);
		return true;
	} catch (error) {
		console.error('Error disabling chatbot:', error);
		return false;
	}
}

// Check if chatbot is enabled
async function isChatbotEnabled(jid) {
	try {
		const chat = await Chatbot.findOne({ jid });
		return chat ? chat.enabled : false;
	} catch (error) {
		console.error('Error checking if chatbot is enabled:', error);
		return false;
	}
}

// Optional: Migration function to move data from JSON to MongoDB
async function migrateFromJSON() {
	try {
		const fs = require('fs');
		const path = require('path');
		const storePath = path.join(__dirname, 'chatbot.json');

		if (fs.existsSync(storePath)) {
			const data = JSON.parse(fs.readFileSync(storePath, 'utf8'));

			// Create array of promises for all inserts
			const insertPromises = data.enabledChats.map(jid => {
				return Chatbot.findOneAndUpdate(
					{ jid },
					{ jid, enabled: true },
					{ upsert: true }
				);
			});

			await Promise.all(insertPromises);
			console.log('Migration completed successfully');
		}
	} catch (error) {
		console.error('Migration failed:', error);
	}
}

module.exports = {
	enableChatbot,
	disableChatbot,
	isChatbotEnabled,
	migrateFromJSON,
	Chatbot, // Exporting the model in case you need it elsewhere
};
