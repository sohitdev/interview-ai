const mongoose = require("mongoose");

const techicalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    example: {
      type: String,
      required: [true, "Example is required"],
    },
  },
  {
    _id: false,
  },
);

const behavioralQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
    },
    intention: {
      type: String,
      required: [true, "Intention is required"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
    },
    example: {
      type: String,
      required: [true, "Example is required"],
    },
  },
  {
    _id: false,
  },
);

const skillGapSchema = new mongoose.Schema(
  {
    skill: {
      type: String,
      required: [true, "Skill is required"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high"],
      required: [true, "Severity is required"],
    },
  },
  {
    _id: false,
  },
);

const preperationPlanSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: [true, "Day is required"],
    },
    focus: {
      type: String,
      required: [true, "Focus is required"],
    },
    tasks: {
      type: [String],
      required: [true, "Tasks are required"],
    },
  },
  {
    _id: false,
  },
);

const starFeedbackSchema = new mongoose.Schema(
  {
    situation: String,
    task: String,
    action: String,
    result: String,
  },
  { _id: false },
);

const practiceAnswerSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    questionType: {
      type: String,
      enum: ["technical", "behavioral"],
      required: true,
    },
    candidateAnswer: { type: String, required: true },
    score: { type: Number, min: 0, max: 10, required: true },
    strengths: { type: [String], default: [] },
    improvements: { type: [String], default: [] },
    starFeedback: starFeedbackSchema,
    refinedAnswer: { type: String, required: true },
  },
  { timestamps: true },
);

const mockInterviewMessageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["interviewer", "candidate"], required: true },
    content: { type: String, required: true },
    score: Number,
    feedback: String,
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const mockInterviewSessionSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["in_progress", "completed"],
      default: "in_progress",
    },
    messages: [mockInterviewMessageSchema],
    finalSummary: {
      overallScore: Number,
      communicationRating: Number,
      technicalRating: Number,
      feedback: String,
    },
  },
  { timestamps: true },
);

const interviewReportSchema = new mongoose.Schema(
  {
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
    },
    resume: {
      type: String,
    },
    selfDescription: {
      type: String,
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    technicalQuestions: [techicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGap: [skillGapSchema],
    preparationPlan: [preperationPlanSchema],
    practiceAnswers: [practiceAnswerSchema],
    tailoredResumeData: { type: mongoose.Schema.Types.Mixed },
    atsKeywords: {
      matched: [String],
      missing: [String],
      score: Number,
    },
    mockInterviewSessions: [mockInterviewSessionSchema],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "User is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
    },
  },
  {
    timestamps: true,
  },
);

const interviewReportModel = mongoose.model(
  "interviewReport",
  interviewReportSchema,
);

module.exports = interviewReportModel;
