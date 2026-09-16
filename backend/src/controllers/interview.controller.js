const { PDFParse } = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
} = require("../services/ai.service.js");
const interviewReportModel = require("../models/interviewReport.model.js");

/**
 * @desc Generate interview report based on job description and resume
 * @route POST /api/interview
 * @access Private
 */
async function generateInterviewReportController(req, res) {
  try {
    const resumeFile = req.file;
    if (!resumeFile) {
      return res.status(400).json({
        message: "Resume file is required",
        status: "error",
      });
    }

    const { jobDescription, selfDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        message: "Job description is required",
        status: "error",
      });
    }

    const parser = new PDFParse({ data: resumeFile.buffer });
    const parsedResume = await parser.getText();
    const resumeContent = parsedResume.text;

    const interviewReportByAI = await generateInterviewReport(
      resumeContent,
      jobDescription,
      selfDescription,
    );

    const interviewReport = await interviewReportModel.create({
      user: req.user.id,
      resume: resumeContent,
      jobDescription,
      selfDescription,
      ...interviewReportByAI,
    });

    res.status(201).json({
      message: "Interview report generated successfully",
      interviewReport,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Get interview report by ID
 * @route GET /api/interview/report/:interviewId
 * @access Private
 */
async function getInterviewReportByIdController(req, res) {
  try {
    const { interviewId } = req.params;
    const interviewReport = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });
    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }
    res.status(200).json({
      message: "Interview report fetched successfully",
      interviewReport,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Get all interview reports for the authenticated user
 * @route GET /api/interview/reports
 * @access Private
 */
async function getAllInterviewReportsController(req, res) {
  try {
    const interviewReports = await interviewReportModel
      .find({
        user: req.user.id,
      })
      .sort({ createdAt: -1 })
      .select(
        "-resume -selfDescription -jobDescription -v -technicalQuestions -behavioralQuestions -skillGap -preparationPlan",
      );
    res.status(200).json({
      message: "Interview reports fetched successfully",
      interviewReports,
      status: "success",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc controller to generate resume pdf based on user resume content, job description and self description
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @access Private
 */
async function generateResumePdfController(req, res) {
  try {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!interviewReport) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }

    const { resume, jobDescription, selfDescription } = interviewReport;

    if (!resume || !jobDescription) {
      return res.status(400).json({
        message: "Resume content or job description is missing for this report",
        status: "error",
      });
    }

    const pdfBuffer = await generateResumePdf({
      resume,
      jobDescription,
      selfDescription,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume-${interviewReportId}.pdf"`,
    });
    res.status(200).send(pdfBuffer);
  } catch (error) {
    console.error("generateResumePdfController error:", error);
    const providerStatus = Number(error?.status || error?.error?.code);
    const isProviderUnavailable = [429, 500, 502, 503, 504].includes(
      providerStatus,
    );

    if (isProviderUnavailable) {
      return res.status(503).json({
        message:
          "Resume generation service is temporarily unavailable. Please try again.",
        status: "error",
      });
    }

    res.status(500).json({
      message: "Internal server error",
      status: "error",
    });
  }
}

module.exports = {
  generateInterviewReportController,
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
};
