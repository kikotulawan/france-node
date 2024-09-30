const mongoose = require("mongoose");

const QuizResult = new mongoose.Schema(
	{
		quizId: {
			type: String,
			required: true,
		},
		quizTopic: {
			type: String,
			required: true,
		},
		participantId: {
			type: String,
			required: true,
		},
		participant: {
			type: Object,
			required: true,
		},
		score: {
			type: Number,
			default: 0,
		},
		resultEl: {
			type: Object,
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("QuizResult", QuizResult);
