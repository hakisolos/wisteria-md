/** @format */

const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		_id: {
			type: String,
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		balance: {
			type: Number,
			required: true,
			min: 0,
			default: 4000,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		pp: {
			type: String,
			required: true,
		},
		pistol: {
			type: Boolean,
			default: false,
		},
		shovel: {
			type: Boolean,
			default: false,
		},
		pickaxe: {
			type: Boolean,
			default: false,
		},
		magnet: {
			type: Boolean,
			default: false,
		},
		Hackingdevice: {
			type: Boolean,
			default: false,
		},
		energydrink: {
			type: Boolean,
			default: false,
		},
		vest: {
			type: Boolean,
			default: false,
		},
		coinmp: {
			type: Boolean,
			default: false,
		},
		mysterybox: {
			type: Boolean,
			default: false,
		},
	},
	{ versionKey: false }
);

UserSchema.virtual('formattedBalance').get(function () {
	return new Intl.NumberFormat('en-us', {
		style: 'currency',
		currency: 'belly',
		currencyDisplay: 'code',
	})
		.format(this.balance)
		.replace('belly', '💰');
});

// 💰 Item price list 💰
UserSchema.statics.itemPrices = {
	pistol: 500,
	shovel: 700,
	pickaxe: 1200,
	magnet: 850,
	Hackingdevice: 3000,
	energydrink: 250,
	vest: 30000,
	coinmp: 10000,
	mysterybox: 1000,
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
