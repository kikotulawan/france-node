const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: "ezikielpuratulawan@gmail.com",
		pass: "kpcgsqlyygghpeiv",
	},
	tls: {
		rejectUnauthorized: false, // This may help bypass certain security issues
	},
});

module.exports = transporter;
