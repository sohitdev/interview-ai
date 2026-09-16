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
 * @route DELETE /api/interview/report/:interviewId
 * @desc Delete interview report by ID
 * @access Private
 */
interviewRouter.delete(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.deleteInterviewReportController,
);

/**
 * @route PATCH /api/interview/report/:interviewId
 * @desc Rename interview report title by ID
 * @access Private
 */
interviewRouter.patch(
  "/report/:interviewId",
  authMiddleware.authUser,
  interviewController.renameInterviewReportController,
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

/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @desc Generate resume PDF based on user resume content, job description, and self description
 * @access Private
 */
interviewRouter.post(
  "/resume/pdf/:interviewReportId",
  authMiddleware.authUser,
  interviewController.generateResumePdfController,
);

/**
 * @route POST /api/interview/evaluate-answer
 * @desc Evaluate candidate's answer with AI
 * @access Private
 */
interviewRouter.post(
  "/evaluate-answer",
  authMiddleware.authUser,
  interviewController.evaluateAnswerController,
);

/**
 * @route GET /api/interview/resume/studio/:interviewReportId
 * @desc Get resume studio data (tailored JSON and ATS keywords)
 * @access Private
 */
interviewRouter.get(
  "/resume/studio/:interviewReportId",
  authMiddleware.authUser,
  interviewController.getResumeStudioDataController,
);

/**
 * @route PUT /api/interview/resume/studio/:interviewReportId
 * @desc Save edited resume studio data
 * @access Private
 */
interviewRouter.put(
  "/resume/studio/:interviewReportId",
  authMiddleware.authUser,
  interviewController.saveResumeStudioDataController,
);

/**
 * @route POST /api/interview/mock/:interviewId/start
 * @desc Start an interactive mock interview
 * @access Private
 */
interviewRouter.post(
  "/mock/:interviewId/start",
  authMiddleware.authUser,
  interviewController.startMockInterviewController,
);

/**
 * @route POST /api/interview/mock/:interviewId/turn
 * @desc Send candidate answer turn in mock interview
 * @access Private
 */
interviewRouter.post(
  "/mock/:interviewId/turn",
  authMiddleware.authUser,
  interviewController.sendMockInterviewAnswerController,
);

/**
 * @route GET /api/interview/mock/:interviewId/session
 * @desc Get latest mock interview session
 * @access Private
 */
interviewRouter.get(
  "/mock/:interviewId/session",
  authMiddleware.authUser,
  interviewController.getMockInterviewSessionController,
);

module.exports = interviewRouter;
