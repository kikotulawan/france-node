const express = require("express");
const Quiz = require("../models/quiz");
const QuizRoom = require("../models/quizRoom");
const QuizResult = require("../models/quizResult");
const User = require("../models/user");
const router = express.Router();

const auth = require("../middleware/auth");

router.post("/saveQuiz", auth, async (req, res) => {
	const { quizId, quiz, generatedByUser, topic } = req.body;

	try {
		const newQuiz = new Quiz({ quizId, quiz, generatedByUser, topic });
		await newQuiz.save();

		const newQuizRoom = new QuizRoom({ quizId });
		await newQuizRoom.save();

		res.status(201).json({ msg: "Quiz saved successfully" });
	} catch (error) {
		console.error("Generation error:", error.message);
		res.status(500).send("Server error");
	}
});

// router.post("/saveQuiz", auth, async (req, res) => {
// 	const { quizId, quiz } = req.body;

// 	try {
// 		const newQuiz = new Quiz({ quizId, quiz });
// 		await newQuiz.save();

// 		res.status(201).json({ msg: "Quiz saved successfully" });
// 	} catch (error) {
// 		console.error("Generation error:", error.message);
// 		res.status(500).send("Server error");
// 	}
// });

router.post("/saveQuizResult", auth, async (req, res) => {
	const { quizId, quizTopic, userId, score, resultEl } = req.body;

	try {
		const user = await User.findOne({ _id: userId });
		const newQuiz = new QuizResult({ quizId, quizTopic, participant: user, participantId: user._id, score, resultEl });
		await newQuiz.save();

		res.status(201).json({ resultId: newQuiz._id, msg: "Quiz result saved successfully" });
	} catch (error) {
		console.error("Generation error:", error.message);
		res.status(500).send("Server error");
	}
});

router.get("/myQuizzes", auth, async (req, res) => {
	const { id, searchKey } = req.query;
	try {
		const quizzes = await Quiz.find({
			generatedByUser: id,
			$or: [{ quizId: { $regex: searchKey, $options: "i" } }, { topic: { $regex: searchKey, $options: "i" } }],
		});

		const result = await Quiz.aggregate([
			{
				$lookup: {
					from: "quizresults",
					localField: "quizId",
					foreignField: "quizId",
					as: "quizresults",
				},
			},
		]).sort({ createdAt: -1 });

		res.json(result);
	} catch (error) {
		console.error("Getting quizzes error:", error.message);
		res.status(500).send("Server error");
	}
});

router.get("/myQuizResults", auth, async (req, res) => {
	const { id } = req.query;
	try {
		const results = await QuizResult.find({
			participantId: id,
		}).sort({ createdAt: -1 });
		res.json(results);
	} catch (error) {
		console.error("Getting quiz results error:", error.message);
		res.status(500).send("Server error");
	}
});

router.get("/quizResults", auth, async (req, res) => {
	const { quizId, searchKey } = req.query;
	try {
		const results = await QuizResult.find({
			quizId,
			$and: [{ "participant.full_name": { $regex: searchKey, $options: "i" } }],
		}).sort({ createdAt: -1 });
		res.json(results);
	} catch (error) {
		console.error("Getting quiz results error:", error.message);
		res.status(500).send("Server error");
	}
});

router.get("/:id", auth, async (req, res) => {
	const quizId = req.params.id;
	const { isJoining, userId } = req.query;
	try {
		const quiz = await Quiz.findOne({ quizId });
		if (isJoining && isJoining == "true") {
			const result = await QuizResult.findOne({ quizId: quizId, participantId: userId });
			if (result) {
				console.log(result);
				return res.status(422).json({ msg: "User already joined the quiz." });
			}
		}
		res.json(quiz);
	} catch (error) {
		console.error("Getting quiz error:", error.message);
		res.status(500).send("Server error");
	}
});

router.get("/result/:id", auth, async (req, res) => {
	const quizId = req.params.id;
	try {
		const result = await QuizResult.findOne({ _id: quizId });
		const quiz = await Quiz.findOne({ quizId: result.quizId });
		res.json({ quiz, result });
	} catch (error) {
		console.error("Getting quiz result error:", error.message);
		res.status(500).send("Server error");
	}
});

router.delete("/deleteQuiz/:id", auth, async (req, res) => {
	const quizId = req.params.id;
	try {
		await Quiz.findByIdAndDelete(quizId);
		res.json({ msg: "Quiz deleted successfully" });
	} catch (error) {
		console.error("Deleting quiz error:", error.message);
		res.status(500).send("Server error");
	}
});

module.exports = router;
