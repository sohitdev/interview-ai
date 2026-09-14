const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

const qaSchema = z.object({
  question: z
    .string()
    .describe("The question that can be asked during the interview"),
  intention: z.string().describe("The intention behind asking this question"),
  answer: z
    .string()
    .describe(
      "How to answer this question, what points to cover, what approach to take, what to avoid, etc.",
    ),
  example: z
    .string()
    .describe(
      "An example answer to this question, demonstrating how to answer it well",
    ),
});

const interviewReportSchema = z.object({
  matchScore: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "A score between 0 and 10 indicating how well the candidate profile matches the job description",
    ),
  technicalQuestions: z
    .array(qaSchema)
    .describe(
      "A list of technical questions that can be asked during the interview",
    ),
  behavioralQuestions: z
    .array(qaSchema)
    .describe(
      "A list of behavioral questions that can be asked during the interview",
    ),
  skillGap: z
    .array(
      z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z
          .enum(["low", "medium", "high"])
          .describe("The severity of the skill gap"),
      }),
    )
    .describe(
      "A list of skill gaps between the candidate profile and the job description, with severity",
    ),
  preparationPlan: z
    .array(
      z.object({
        day: z.number().describe("The day number in the preparation plan"),
        focus: z.string().describe("The main focus area for the day"),
        tasks: z.array(z.string()).describe("Tasks to complete on this day"),
      }),
    )
    .describe(
      "A day-by-day plan for the candidate to prepare for the interview",
    ),
});

function buildPrompt(resume, jobDescription, selfDescription) {
  return `
You are an expert career coach and interviewer. Based on the candidate's resume, the job description, and their self-description, generate an interview report covering:
1. Match Score (0-10): how well the candidate profile matches the job.
2. Technical Questions: with the intention behind each and how to answer it.
3. Behavioral Questions: with the intention behind each and how to answer it.
4. Skill Gaps: with severity (low, medium, high).
5. Preparation Plan: a day-by-day plan with a focus area and tasks per day.

Candidate's resume:
${resume}

Job description:
${jobDescription}

Candidate's self-description:
${selfDescription}
  `.trim();
}

async function generateInterviewReport(
  resume,
  jobDescription,
  selfDescription,
) {
  const prompt = buildPrompt(resume, jobDescription, selfDescription);

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: z.toJSONSchema(interviewReportSchema),
    },
  });

  return JSON.parse(response.text);
}

module.exports = generateInterviewReport;
