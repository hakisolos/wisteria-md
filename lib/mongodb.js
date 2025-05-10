/** @format */

const mongoose = require('mongoose');

const conn = async () => {
	try {
		await mongoose.connect('mongodb+srv://hakixer:mynameisexcel2@mern-app.6jk1agk.mongodb.net/?retryWrites=true&w=majority&appName=mern-app', {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log('🌸 MongoDB connected successfully! 🌸');

		// Drop the index "email_1" from users collection
		const collection = mongoose.connection.collection("users");
		try {
			await collection.dropIndex("email_1");
			console.log("💌 Dropped index 'email_1' from users collection.");
		} catch (err) {
			if (err.codeName === "IndexNotFound") {
				console.log("💤 No index 'email_1' found to drop. You're good, baby 💕");
			} else {
				console.error("😖 Something went wrong while dropping the index:", err);
			}
		}
	} catch (error) {
		console.error('❌ MongoDB connection failed, my love:', error);
	}
};

module.exports = conn;
