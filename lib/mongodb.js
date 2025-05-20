/** @format */
const mongoose = require('mongoose');

const conn = async () => {
	try {
		await mongoose.connect('mongodb+srv://hakixer:mynameisexcel2@mern-app.6jk1agk.mongodb.net/?retryWrites=true&w=majority&appName=mern-app', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('🌸 MongoDB connected successfully! 🌸');
		const db = mongoose.connection.db;
		const collections = await db.listCollections().toArray();

		const hasUsersCollection = collections.find(col => col.name === 'users');
		if (hasUsersCollection) {
			await db.collection('users').drop();
			console.log('🧹 Old "users" collection dropped, my king 💋');
		}

	} catch (error) {
		console.error('❌ MongoDB connection failed, my love:', error);
	}
};

module.exports = conn;
