const mongoose = require("mongoose");

const Quiz = new mongoose.Schema(
	{
		quizId: {
			type: String,
			required: true,
		},
		quiz: {
			type: Object,
			required: true,
		},
		generatedByUser: {
			type: String,
			required: true,
		},
		topic: {
			type: String,
			required: true,
		},
	},
	{ timestamps: true },
);

module.exports = mongoose.model("Quiz", Quiz);
