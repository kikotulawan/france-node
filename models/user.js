const mongoose = require("mongoose");

const User = new mongoose.Schema(
	{
		role: {
			type: String,
			required: true,
		},
		full_name: {
			type: String,
			required: true,
		},
		username: {
			type: String,
			required: true,
		},
		password: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			default: "",
		},
		resetPasswordCode: { type: String, required: false },
		resetPasswordExpires: { type: Date, required: false },
	},
	{ timestamps: true },
);

module.exports = mongoose.model("User", User);
