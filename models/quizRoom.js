const mongoose = require("mongoose");

const QuizRoom = new mongoose.Schema(
	{
		quizId: {
			type: String,
			required: true,
		},
		participants: {
			type: Array,
			default: [],
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("QuizRoom", QuizRoom);
