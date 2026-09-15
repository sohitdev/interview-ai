const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware.js");
const interviewController = require("../controllers/interview.controller.js");
const upload = require("../middlewares/file.middleware.js");

const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc Generate interview report based on job description and resume
 * @access Private
 */
interviewRouter.post(
  "/",
  authMiddleware.authUser,
  upload.single("resume"),
  interviewController.generateInterviewReportController,
);

/**
 * @route GET /api/interview/report/:interviewId
 * @desc Get interview report by ID
 * @access Private
 */
interviewRouter.get(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.getInterviewReportByIdController,
);

/**
 *@description Get all interview reports for the authenticated user
 *@route GET /api/interview/reports
 *@access Private
 */
interviewRouter.get(
  "/reports",
  authMiddleware.authUser,
  interviewController.getAllInterviewReportsController,
);

module.exports = interviewRouter;
