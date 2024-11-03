const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 587,
	secure: false, // true for 465, false for other ports
	auth: {
		user: "santosedil2231@gmail.com",
		pass: "hlmxyoyzqhypajta",
	},
	tls: {
		rejectUnauthorized: false, // This may help bypass certain security issues
	},
});

module.exports = transporter;
