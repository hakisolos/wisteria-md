/** @format */

const User = require('../models/user');

const isRegistered = async jid => {
	try {
		const user = await User.findById(jid);
		return !!user;
	} catch (e) {
		console.error('isRegistered error:', e.message);
		return false;
	}
};

const addUser = async (name = 'User', jid = '', balance = 4000, pp = '') => {
	try {
		if (await isRegistered(jid)) return 'You’re already registered';

		const newUser = new User({ _id: jid, name, balance, pp });
		await newUser.save();
		return newUser;
	} catch (e) {
		console.error('Error adding user:', e.message);
		throw new Error('Could not add user');
	}
};

const getUser = async jid => {
	try {
		const user = await User.findById(jid);
		if (!user) return 'NULL: no user found';
		return user;
	} catch (e) {
		console.error('Error getting user:', e.message);
		return 'error, could not find user';
	}
};
const removeUser = async jid => {
	try {
		const del = await User.findByIdAndDelete(jid);
		if (!del) return 'User does not exist';
		return 'User deleted successfully';
	} catch (e) {
		console.error('Error removing user:', e.message);
		return e.message;
	}
};

const updateBalance = async (jid, amount) => {
	try {
		const updatedUser = await User.findByIdAndUpdate(
			jid,
			{ $inc: { balance: amount } },
			{ new: true }
		);

		if (!updatedUser) {
			return null; // Return null instead of a string
		}

		return updatedUser; // Ensure function returns the updated user object
	} catch (e) {
		console.error('Error updating balance:', e.message);
		throw new Error('Could not update balance');
	}
};

const getBalance = async jid => {
	const user = await User.findById(jid);
	if (!user) return null;
	return `Ƀ${user.balance.toLocaleString('en-NG')}`;
};

module.exports = {
	addUser,
	getUser,
	isRegistered,
	removeUser,
	updateBalance,
	getBalance,
};
