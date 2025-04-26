/** @format */

const mongoose = require('mongoose');

const conn = async () => {
	try {
		await mongoose.connect('mongodb://localhost:27017', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('🌸 MongoDB connected successfully! 🌸');
	} catch (error) {
		console.error('❌ MongoDB connection failed, my love:', error);
	}
};

module.exports = conn;
