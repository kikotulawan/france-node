const express = require("express");
const User = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodemailer");
const crypto = require("crypto");

const auth = require("../middleware/auth");

router.post("/checkUser", auth, async (req, res) => {
	try {
		const { _id } = req.body;
		const user = await User.findOne({ _id });
		res.json({
			user: {
				role: user.role,
				id: user._id,
				email: user.email,
				full_name: user.full_name,
				username: user.username,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err });
	}
});

router.post("/login", async (req, res) => {
	const { username, password } = req.body;

	try {
		// Check if user exists
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(401).json({ msg: "Invalid credentials" });
		}

		// Compare passwords
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({ msg: "Invalid credentials" });
		}

		// Create and sign JWT
		const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
			expiresIn: "12h",
		});

		res.json({
			token,
			user: {
				role: user.role,
				id: user._id,
				full_name: user.full_name,
				username: user.username,
			},
		});
	} catch (error) {
		console.error("Error logging in:", error.message);
		res.status(500).send("Server Error");
	}
});

router.post("/register", async (req, res) => {
	const { email, username, password, role, full_name } = req.body;

	try {
		// Check if the user already exists
		const existingUser = await User.findOne({ username });
		if (existingUser) {
			return res.status(422).json({ msg: "Username already exists" });
		}

		const existingUserEmail = await User.findOne({ email });
		if (existingUserEmail) {
			return res.status(422).json({ msg: "Email already exists" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create a new user
		const newUser = new User({ username, password: hashedPassword, role, full_name });
		await newUser.save();

		res.status(201).json({ msg: "User registered successfully" });
	} catch (error) {
		console.error("Registration error:", error.message);
		res.status(500).send("Server error");
	}
});

router.post("/change-password", async (req, res) => {
	const { id, currentPassword, newPassword } = req.body;

	try {
		const user = await User.findOne({ _id: id });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isMatch = await bcrypt.compare(currentPassword, user.password);
		if (!isMatch) {
			return res.status(422).json({ error: "Incorrect current password" });
		}

		const isSamePassword = await bcrypt.compare(newPassword, user.password);
		if (isSamePassword) {
			return res.status(422).json({ error: "New password cannot be the same as the old password" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedNewPassword = await bcrypt.hash(newPassword, salt);

		user.password = hashedNewPassword;
		await user.save();

		res.json({ message: "Password updated successfully" });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

router.post("/change-password-v2", async (req, res) => {
	const { email, newPassword } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const isSamePassword = await bcrypt.compare(newPassword, user.password);
		if (isSamePassword) {
			return res.status(422).json({ error: "New password cannot be the same as the old password" });
		}

		const salt = await bcrypt.genSalt(10);
		const hashedNewPassword = await bcrypt.hash(newPassword, salt);

		user.password = hashedNewPassword;
		await user.save();

		res.json({ message: "Password updated successfully" });
	} catch (err) {
		res.status(500).json({ error: "Server error" });
	}
});

router.post("/request-password-reset", async (req, res) => {
	try {
		const { email } = req.body;
		const user = await User.findOne({ email });
		if (!user) return res.status(404).json({ message: "User with this email not found" });

		const verificationCode = crypto.randomInt(100000, 999999).toString();
		user.resetPasswordCode = verificationCode;
		user.resetPasswordExpires = Date.now() + 600000;
		console.log(verificationCode);
		await user.save();

		await transporter.sendMail({
			to: user.email,
			text: "",
			subject: "Password Reset Code",
			html: `<p>Your password reset verification code is: <b>${verificationCode}</b>. This code will expire after 10 minutes.</p>`,
		});

		res.json({ message: "Verification code sent to your email" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Server error" });
	}
});

router.post("/verify-code", async (req, res) => {
	try {
		const { email, code } = req.body;

		const user = await User.findOne({
			email,
			resetPasswordCode: code,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) return res.status(422).json({ message: "Invalid or expired code" });

		user.resetPasswordCode = undefined;
		user.resetPasswordExpires = undefined;
		await user.save();

		res.json({ message: "Code verification successful" });
	} catch (err) {
		console.log(err);
		res.status(500).json({ error: "Server error" });
	}
});

module.exports = router;
