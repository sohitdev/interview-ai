const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const cors = require("cors");

const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

const app = express();

/**
 * @description: Middleware to parse JSON and cookies from incoming requests
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {void}
 */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

/**
 * @description: A simple health check endpoint
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @returns {void}
 */
app.get("/", (req, res) => {
  res.send("Welcome to the API, Server is up and running!");
});

/**
 * @route /api/auth
 * @description: Authentication routes for user registration and login
 * @access Public
 */
app.use("/api/auth", authRouter);

/**
 * @route /api/interview
 * @description: Generate interview report based on candidate's resume, job description, and self-description
 * @access private
 */
app.use("/api/interview", interviewRouter);

module.exports = app;
