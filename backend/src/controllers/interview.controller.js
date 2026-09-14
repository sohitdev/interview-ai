const { PDFParse } = require("pdf-parse");
const generateInterviewReport = require("../services/ai.service.js");
const interviewReportModel = require("../models/interviewReport.model.js");

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

module.exports = {
  generateInterviewReportController,
};
