/** @format */

const mongoose = require('mongoose');

const conn = async () => {
	try {
		await mongoose.connect(
			'mongodb+srv://hakixer:mynameisexcel2@mern-app.6jk1agk.mongodb.net/?retryWrites=true&w=majority&appName=mern-app',
			{
				useNewUrlParser: true,
				useUnifiedTopology: true,
			}
		);
		console.log('🌸 MongoDB connected successfully! 🌸');
	} catch (error) {
		console.error('❌ MongoDB connection failed, my love:', error);
	}
};

module.exports = conn;
