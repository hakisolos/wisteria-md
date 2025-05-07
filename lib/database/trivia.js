const mongoose = require('mongoose');

const TriviaSchema = new mongoose.Schema({
	jid: { type: String, required: true, unique: true },
	enabled: { type: Boolean, default: false },
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
});

const TriviaModel = mongoose.model('Trivia', TriviaSchema);

const Trivia = {
	enable: async function (jid) {
		return await TriviaModel.findOneAndUpdate(
			{ jid },
			{ enabled: true, updatedAt: Date.now() },
			{ upsert: true, new: true }
		);
	},

	disable: async function (jid) {
		return await TriviaModel.findOneAndUpdate(
			{ jid },
			{ enabled: false, updatedAt: Date.now() },
			{ upsert: true, new: true }
		);
	},

	status: async function (jid) {
		const group = await TriviaModel.findOne({ jid });
		return group ? group.enabled : false;
	},
};

module.exports = Trivia;