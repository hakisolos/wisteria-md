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

const User = mongoose.model('User', UserSchema);

module.exports = User;
