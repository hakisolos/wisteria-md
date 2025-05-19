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
			return null;
		}
		return updatedUser;
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

async function buyItem(userId, itemField) {
	try {
		const user = await User.findById(userId);
		if (!user) return false;
		// Check if itemField exists and user doesn't already have the item
		if (!(itemField in user) || user[itemField]) return false;

		const price = User.itemPrices[itemField];
		if (!price) return false; // invalid item or no price

		if (user.balance < price) return false; // not enough balance

		// Update balance and item possession
		user.balance -= price;
		user[itemField] = true;

		await user.save();
		return true;
	} catch (err) {
		console.error('Error buying item:', err);
		return false;
	}
}

async function removeItem(userId, itemField) {
	try {
		const user = await User.findById(userId);
		if (!user) return false;
		// Check if itemField exists and user currently has the item
		if (!(itemField in user) || !user[itemField]) return false;

		const price = User.itemPrices[itemField];
		if (!price) return false; // invalid item or no price

		// Refund price and remove item
		user.balance += price;
		user[itemField] = false;

		await user.save();
		return true;
	} catch (err) {
		console.error('Error removing item:', err);
		return false;
	}
}

async function hasItem(userId, itemField) {
	try {
		const user = await User.findById(userId);
		if (!user || !(itemField in user)) return null;
		return user[itemField] === true;
	} catch (err) {
		console.error('Error checking item:', err);
		return null;
	}
}

function isItem(itemField) {
	const validItems = [
		'pistol',
		'shovel',
		'pickaxe',
		'magnet',
		'Hackingdevice',
		'energydrink',
		'vest',
		'coinmp',
		'mysterybox',
	];
	return validItems.includes(itemField);
}
async function getInventory(userId) {
	try {
		const user = await User.findById(userId);
		if (!user) return [];

		const items = {
			pistol: '💣 Pistol',
			shovel: '🪓 Shovel',
			pickaxe: '⛏️ Pickaxe',
			magnet: '🧲 Magnet',
			Hackingdevice: '🥽 Hacking Device',
			energydrink: '🔋 Energy Drink',
			vest: '🛡️ Armor Vest',
			coinmp: '🪙 Coin Multiplier',
			mysterybox: '🎁 Mystery Box',
		};

		const ownedItems = [];

		for (const key in items) {
			if (user[key]) {
				ownedItems.push(items[key]);
			}
		}

		return ownedItems;
	} catch (err) {
		console.error('🧩 Error fetching inventory:', err);
		return [];
	}
}
const getAllUsers = async () => {
	try {
		const users = await User.find({}, { name: 1, balance: 1, _id: 1 });
		if (!users.length) return '🥺 No users found yet, darling.';

		let list = `💫 *Registered Users List* 💫\n\n`;

		users.forEach((user, index) => {
			list += `${index + 1}. 🧑‍💻 *${user.name}*\n`;
			list += `📞 ID: \`${user._id}\`\n`;
			list += `💰 Balance: Ƀ${user.balance.toLocaleString('en-NG')}\n\n`;
		});

		return list;
	} catch (err) {
		console.error('🧨 Error getting all users:', err);
		return '😓 Could not fetch users at the moment, baby.';
	}
};

module.exports = {
	addUser,
	getUser,
	isRegistered,
	removeUser,
	updateBalance,
	getAllUsers,
	getInventory,
	isItem,
	buyItem,
	removeItem,
	hasItem,
	getBalance,
};
