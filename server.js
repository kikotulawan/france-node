const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const userRoutes = require("./routes/userRoutes");
const quizRoutes = require("./routes/quizRoutes");

// Load environment variables
dotenv.config();

// Initialize the app
const app = express();

app.use((req, res, next) => {
	res.header("Access-Control-Allow-Origin", "*");
	res.header(
		"Access-Control-Allow-Headers",
		"Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method",
	);
	res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
	res.header("Allow", "GET, POST, OPTIONS, PUT, DELETE");
	next();
});

// Body parser middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);

// Define the PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
	connectDB().catch(console.dir);
	console.log(`Server running on port ${PORT}`);
});
