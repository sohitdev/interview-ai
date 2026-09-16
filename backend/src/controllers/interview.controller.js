const { PDFParse } = require("pdf-parse");
const {
  generateInterviewReport,
  generateResumePdf,
  generateStructuredResumeData,
  extractAtsKeywords,
  evaluateCandidateAnswer,
  generateMockInterviewTurn,
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
    const { jobDescription, selfDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({
        message: "Job description is required",
        status: "error",
      });
    }

    if (!resumeFile && (!selfDescription || !selfDescription.trim())) {
      return res.status(400).json({
        message: "Either a resume file or a candidate self-description is required",
        status: "error",
      });
    }

    let resumeContent = "";
    if (resumeFile) {
      const parser = new PDFParse({ data: resumeFile.buffer });
      const parsedResume = await parser.getText();
      resumeContent = parsedResume.text;
    }

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
    const template = req.query.template || req.body?.template || "classic";
    const customResumeData = req.body?.resumeData;

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

    const { pdfBuffer, resumeData } = await generateResumePdf({
      resumeData: customResumeData || interviewReport.tailoredResumeData,
      resume,
      jobDescription,
      selfDescription,
      template,
    });

    if (!interviewReport.tailoredResumeData && resumeData) {
      interviewReport.tailoredResumeData = resumeData;
      await interviewReport.save();
    }

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

/**
 * @desc Delete an interview report by ID
 * @route DELETE /api/interview/report/:interviewId
 * @access Private
 */
async function deleteInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;
    const deletedReport = await interviewReportModel.findOneAndDelete({
      _id: interviewId,
      user: req.user.id,
    });

    if (!deletedReport) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Interview report deleted successfully",
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
 * @desc Rename interview report title
 * @route PATCH /api/interview/report/:interviewId
 * @access Private
 */
async function renameInterviewReportController(req, res) {
  try {
    const { interviewId } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        message: "Title is required",
        status: "error",
      });
    }

    const updatedReport = await interviewReportModel.findOneAndUpdate(
      { _id: interviewId, user: req.user.id },
      { title: title.trim() },
      { new: true },
    );

    if (!updatedReport) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Report title updated successfully",
      report: updatedReport,
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
 * @desc Evaluate a candidate's answer to an interview question
 * @route POST /api/interview/evaluate-answer
 * @access Private
 */
async function evaluateAnswerController(req, res) {
  try {
    const {
      interviewId,
      question,
      questionType,
      candidateAnswer,
      intention,
      modelAnswer,
    } = req.body;

    if (!interviewId || !question || !candidateAnswer?.trim()) {
      return res.status(400).json({
        message: "interviewId, question, and candidateAnswer are required",
        status: "error",
      });
    }

    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
        status: "error",
      });
    }

    const evaluation = await evaluateCandidateAnswer({
      question,
      questionType: questionType || "technical",
      candidateAnswer: candidateAnswer.trim(),
      intention,
      modelAnswer,
      roleTitle: report.title,
    });

    const newPracticeEntry = {
      question,
      questionType: questionType || "technical",
      candidateAnswer: candidateAnswer.trim(),
      score: evaluation.score,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
      starFeedback: evaluation.starFeedback,
      refinedAnswer: evaluation.refinedAnswer,
    };

    report.practiceAnswers = report.practiceAnswers || [];
    report.practiceAnswers.push(newPracticeEntry);
    await report.save();

    res.status(200).json({
      message: "Answer evaluated successfully",
      evaluation,
      status: "success",
    });
  } catch (error) {
    console.error("evaluateAnswerController error:", error);
    res.status(500).json({
      message: "Failed to evaluate answer",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Get or generate tailored resume content and ATS keywords
 * @route GET /api/interview/resume/studio/:interviewReportId
 * @access Private
 */
async function getResumeStudioDataController(req, res) {
  try {
    const { interviewReportId } = req.params;
    const report = await interviewReportModel.findOne({
      _id: interviewReportId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }

    let updated = false;
    if (!report.tailoredResumeData) {
      report.tailoredResumeData = await generateStructuredResumeData({
        resume: report.resume,
        jobDescription: report.jobDescription,
        selfDescription: report.selfDescription,
      });
      updated = true;
    }

    if (!report.atsKeywords || !report.atsKeywords.matched?.length) {
      report.atsKeywords = await extractAtsKeywords({
        resumeText: report.resume,
        jobDescription: report.jobDescription,
      });
      updated = true;
    }

    if (updated) {
      await report.save();
    }

    res.status(200).json({
      message: "Resume studio data fetched successfully",
      resumeData: report.tailoredResumeData,
      atsKeywords: report.atsKeywords,
      status: "success",
    });
  } catch (error) {
    console.error("getResumeStudioDataController error:", error);
    res.status(500).json({
      message: "Failed to load resume studio data",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Save user customized resume content
 * @route PUT /api/interview/resume/studio/:interviewReportId
 * @access Private
 */
async function saveResumeStudioDataController(req, res) {
  try {
    const { interviewReportId } = req.params;
    const { resumeData } = req.body;

    if (!resumeData) {
      return res.status(400).json({
        message: "resumeData is required",
        status: "error",
      });
    }

    const report = await interviewReportModel.findOneAndUpdate(
      { _id: interviewReportId, user: req.user.id },
      { tailoredResumeData: resumeData },
      { new: true },
    );

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found or unauthorized",
        status: "error",
      });
    }

    res.status(200).json({
      message: "Resume data saved successfully",
      resumeData: report.tailoredResumeData,
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
 * @desc Start a new interactive mock interview session
 * @route POST /api/interview/mock/:interviewId/start
 * @access Private
 */
async function startMockInterviewController(req, res) {
  try {
    const { interviewId } = req.params;
    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }

    const firstQuestion =
      report.technicalQuestions?.[0]?.question ||
      `Can you introduce yourself and walk me through how your background fits the ${report.title} role?`;

    const initialMessage = {
      role: "interviewer",
      content: `Hello! Welcome to your mock interview for the ${report.title} position. I will be assessing both your technical expertise and problem-solving mindset today. Let's dive right in with our first question:\n\n${firstQuestion}`,
      timestamp: new Date(),
    };

    const newSession = {
      status: "in_progress",
      messages: [initialMessage],
    };

    report.mockInterviewSessions = report.mockInterviewSessions || [];
    report.mockInterviewSessions.push(newSession);
    await report.save();

    const createdSession =
      report.mockInterviewSessions[report.mockInterviewSessions.length - 1];

    res.status(201).json({
      message: "Mock interview session started",
      session: createdSession,
      status: "success",
    });
  } catch (error) {
    console.error("startMockInterviewController error:", error);
    res.status(500).json({
      message: "Failed to start mock interview session",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Submit candidate response and get next question or evaluation in mock interview
 * @route POST /api/interview/mock/:interviewId/turn
 * @access Private
 */
async function sendMockInterviewAnswerController(req, res) {
  try {
    const { interviewId } = req.params;
    const { candidateAnswer } = req.body;

    if (!candidateAnswer || !candidateAnswer.trim()) {
      return res.status(400).json({
        message: "candidateAnswer is required",
        status: "error",
      });
    }

    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }

    const sessions = report.mockInterviewSessions || [];
    const currentSession =
      sessions.filter((s) => s.status === "in_progress").slice(-1)[0] ||
      sessions.slice(-1)[0];

    if (!currentSession) {
      return res.status(400).json({
        message:
          "No active mock interview session found. Please start one first.",
        status: "error",
      });
    }

    const turnResult = await generateMockInterviewTurn({
      roleTitle: report.title,
      jobDescription: report.jobDescription,
      messages: currentSession.messages,
      candidateAnswer: candidateAnswer.trim(),
    });

    currentSession.messages.push({
      role: "candidate",
      content: candidateAnswer.trim(),
      score: turnResult.score,
      feedback: turnResult.feedback,
      timestamp: new Date(),
    });

    if (turnResult.isCompleted) {
      currentSession.status = "completed";
      currentSession.finalSummary = turnResult.finalSummary;
      currentSession.messages.push({
        role: "interviewer",
        content: `Thank you for completing this interview! Here is your overall performance summary:\n\n${turnResult.interviewerResponse}`,
        timestamp: new Date(),
      });
    } else {
      const fullInterviewerReply = turnResult.nextQuestion
        ? `${turnResult.interviewerResponse}\n\n**Next Question:** ${turnResult.nextQuestion}`
        : turnResult.interviewerResponse;

      currentSession.messages.push({
        role: "interviewer",
        content: fullInterviewerReply,
        timestamp: new Date(),
      });
    }

    await report.save();

    res.status(200).json({
      message: "Turn processed successfully",
      session: currentSession,
      turnResult,
      status: "success",
    });
  } catch (error) {
    console.error("sendMockInterviewAnswerController error:", error);
    res.status(500).json({
      message: "Failed to process interview turn",
      error: error.message,
      status: "error",
    });
  }
}

/**
 * @desc Get latest mock interview session for a report
 * @route GET /api/interview/mock/:interviewId/session
 * @access Private
 */
async function getMockInterviewSessionController(req, res) {
  try {
    const { interviewId } = req.params;
    const report = await interviewReportModel.findOne({
      _id: interviewId,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
        status: "error",
      });
    }

    const sessions = report.mockInterviewSessions || [];
    const latestSession = sessions[sessions.length - 1] || null;

    res.status(200).json({
      message: "Session fetched successfully",
      session: latestSession,
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
  getInterviewReportByIdController,
  getAllInterviewReportsController,
  generateResumePdfController,
  deleteInterviewReportController,
  renameInterviewReportController,
  evaluateAnswerController,
  getResumeStudioDataController,
  saveResumeStudioDataController,
  startMockInterviewController,
  sendMockInterviewAnswerController,
  getMockInterviewSessionController,
};

