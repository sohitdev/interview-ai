const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const primaryModel = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.0-flash";
const transientAiStatuses = new Set([429, 500, 502, 503, 504]);

function getAiStatus(error) {
  return Number(error?.status || error?.error?.code);
}

function isTransientAiError(error) {
  return transientAiStatuses.has(getAiStatus(error));
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function generateJsonContent(contents, config) {
  let lastError;

  for (const model of [primaryModel, fallbackModel]) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        return await ai.models.generateContent({ model, contents, config });
      } catch (error) {
        lastError = error;
        if (!isTransientAiError(error) || attempt === 1) {
          break;
        }
        await wait(1000 * 2 ** attempt);
      }
    }
  }

  throw lastError;
}

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
  title: z
    .string()
    .describe(
      "The title of the job for whcih the  interview report is generated",
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
${resume && resume.trim() ? resume.trim() : "Not provided (Candidate relying on self-description)"}

Job description:
${jobDescription}

Candidate's self-description:
${selfDescription && selfDescription.trim() ? selfDescription.trim() : "Not provided (Candidate relying on uploaded resume)"}
  `.trim();
}

async function generateInterviewReport(
  resume,
  jobDescription,
  selfDescription,
) {
  const prompt = buildPrompt(resume, jobDescription, selfDescription);

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(interviewReportSchema),
  });

  return JSON.parse(response.text);
}

const answerEvaluationSchema = z.object({
  score: z
    .number()
    .min(0)
    .max(10)
    .describe(
      "A score between 0 and 10 evaluating the candidate's answer quality, clarity, and depth",
    ),
  strengths: z
    .array(z.string())
    .describe("Key highlights and strong points in the candidate's answer"),
  improvements: z
    .array(z.string())
    .describe(
      "Constructive, actionable feedback on how the candidate can strengthen their answer",
    ),
  starFeedback: z
    .object({
      situation: z
        .string()
        .describe("Evaluation of context/situation setting"),
      task: z.string().describe("Evaluation of problem/task definition"),
      action: z
        .string()
        .describe("Evaluation of specific actions candidate took"),
      result: z
        .string()
        .describe("Evaluation of outcomes/impact delivered"),
    })
    .optional(),
  refinedAnswer: z
    .string()
    .describe(
      "An elevated, professional, and impactful version of the candidate's answer, preserving their core experience but phrasing it at a senior engineer standard",
    ),
});

async function evaluateCandidateAnswer({
  question,
  questionType,
  candidateAnswer,
  intention,
  modelAnswer,
  roleTitle,
}) {
  const prompt = `
You are an expert tech hiring manager and interview coach evaluating a candidate's answer for the role of "${roleTitle || "Target Role"}".

Question (${questionType}):
${question}

Interviewer's Intention:
${intention || "Assess depth of knowledge and problem solving"}

Expected / Ideal Answer Elements:
${modelAnswer || "Clear, structured, accurate answer"}

Candidate's Submitted Answer:
${candidateAnswer}

Instructions:
1. Grade the answer from 0 to 10 objectively based on technical accuracy, structure, relevance, and clarity.
2. Provide 2-3 specific strengths of the answer.
3. Provide 2-3 actionable areas where the answer fell short or can be significantly improved.
4. For behavioral questions, analyze adherence to the STAR method (Situation, Task, Action, Result).
5. Provide a "refinedAnswer" that takes the candidate's authentic points and rewrites them into an executive, highly compelling interview response.
`.trim();

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(answerEvaluationSchema),
  });

  return JSON.parse(response.text);
}

const resumeContentSchema = z.object({
  name: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  email: z.string().optional(),
  linkedin: z.string().optional(),
  website: z.string().optional(),
  objective: z.string(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      dates: z.string().optional(),
      details: z.string().optional(),
    }),
  ),
  skills: z.array(
    z.object({
      category: z.string(),
      items: z.array(z.string()),
    }),
  ),
  experience: z.array(
    z.object({
      role: z.string(),
      dates: z.string().optional(),
      company: z.string(),
      location: z.string().optional(),
      bullets: z.array(z.string()),
    }),
  ),
  projects: z.array(
    z.object({
      title: z.string(),
      description: z.string().optional(),
      bullets: z.array(z.string()).optional(),
    }),
  ),
  extracurricularActivities: z.array(z.string()).optional(),
  leadership: z.array(z.string()).optional(),
  customSections: z.array(
    z.object({
      heading: z.string(),
      items: z.array(z.string()),
    })
  ).optional(),
});

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderList(items) {
  return items.length
    ? `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
    : "";
}

function renderSection(title, content) {
  return content ? `<section><h2>${title}</h2>${content}</section>` : "";
}

function buildResumeHtml(resumeData, template = "classic") {
  const firstAddress = [resumeData.phone, resumeData.location]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' <span class="separator">&#8901;</span> ');
  const secondAddress = [
    resumeData.email,
    resumeData.linkedin,
    resumeData.website,
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' <span class="separator">&#8901;</span> ');

  const education = (resumeData.education || [])
    .map(
      (item) =>
        `<div class="entry"><div class="entry-line"><strong>${escapeHtml(item.degree)}</strong><span>${escapeHtml(item.dates)}</span></div><div>${escapeHtml(item.institution)}</div>${item.details ? `<div>${escapeHtml(item.details)}</div>` : ""}</div>`,
    )
    .join("");

  const skills = (resumeData.skills || [])
    .map(
      (item) =>
        `<div class="skill-cat"><strong>${escapeHtml(item.category)}:</strong> ${escapeHtml(item.items.join(", "))}</div>`,
    )
    .join("");

  const experience = (resumeData.experience || [])
    .map(
      (item) =>
        `<div class="entry"><div class="entry-line"><strong>${escapeHtml(item.role)}</strong><span>${escapeHtml(item.dates)}</span></div><div class="sub-entry-line"><span>${escapeHtml(item.company)}</span><em>${escapeHtml(item.location)}</em></div>${renderList(item.bullets || [])}</div>`,
    )
    .join("");

  const projects = (resumeData.projects || [])
    .map((item) => {
      let descHtml = item.description ? escapeHtml(item.description) : "";
      if (item.bullets && item.bullets.length) {
        descHtml += renderList(item.bullets);
      }
      return `<li><strong>${escapeHtml(item.title)}.</strong> ${descHtml}</li>`;
    })
    .join("");

  // Template specific CSS
  let templateCss = "";
  if (template === "modern") {
    templateCss = `
      body { color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 10pt; line-height: 1.25; }
      header { border-bottom: 2.5px solid #2563eb; padding-bottom: 0.5em; margin-bottom: 0.8em; }
      h1 { font-size: 19pt; margin: 0 0 0.2em; color: #0f172a; font-weight: 700; letter-spacing: -0.02em; }
      .address-row { margin: 0 0 0.25em; color: #475569; font-size: 9pt; }
      .separator { padding: 0 4px; color: #94a3b8; }
      section { margin-top: 0.9em; }
      h2 { color: #1e3a8a; font-size: 10.5pt; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.45em; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.15em; }
      .entry { margin-bottom: 0.55em; }
      .entry-line { display: flex; justify-content: space-between; gap: 16px; font-size: 9.8pt; }
      .entry-line strong { color: #0f172a; }
      .entry-line span { white-space: nowrap; color: #64748b; font-size: 9pt; }
      .sub-entry-line { display: flex; justify-content: space-between; gap: 16px; color: #334155; font-size: 9.2pt; }
      .sub-entry-line em { font-style: normal; color: #64748b; }
      ul { margin: 0.2em 0 0 1.1em; padding: 0; }
      li { margin-bottom: 0.1em; color: #334155; font-size: 9.2pt; }
      .skill-cat { margin-bottom: 0.25em; font-size: 9.2pt; }
      p { margin: 0; color: #334155; font-size: 9.2pt; }
    `;
  } else if (template === "minimal") {
    templateCss = `
      body { color: #171717; font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; font-size: 10pt; line-height: 1.25; }
      header { margin-bottom: 1.1em; }
      h1 { font-size: 18pt; margin: 0 0 0.25em; font-weight: 400; letter-spacing: 0.05em; text-transform: uppercase; }
      .address-row { margin: 0 0 0.25em; color: #737373; font-size: 8.5pt; letter-spacing: 0.03em; }
      .separator { padding: 0 4px; color: #a3a3a3; }
      section { margin-top: 1.1em; }
      h2 { font-size: 9pt; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: #525252; margin: 0 0 0.5em; border-bottom: 0.5px solid #d4d4d4; padding-bottom: 0.2em; }
      .entry { margin-bottom: 0.6em; }
      .entry-line { display: flex; justify-content: space-between; gap: 16px; }
      .entry-line span { white-space: nowrap; color: #737373; font-size: 8.5pt; }
      .sub-entry-line { display: flex; justify-content: space-between; gap: 16px; color: #525252; font-size: 9pt; }
      .sub-entry-line em { font-style: normal; color: #737373; }
      ul { margin: 0.2em 0 0 1.1em; padding: 0; }
      li { margin-bottom: 0.1em; color: #262626; font-size: 9pt; }
      .skill-cat { margin-bottom: 0.25em; font-size: 9pt; }
      p { margin: 0; color: #262626; font-size: 9pt; }
    `;
  } else {
    // Classic serif
    templateCss = `
      body { color: #111; font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.15; }
      header { text-align: center; margin-bottom: 0.8em; }
      h1 { font-size: 17pt; margin: 0 0 0.35em; text-transform: uppercase; }
      .address-row { margin: 0 0 0.35em; }
      .separator { padding: 0 4px; }
      section { margin-top: 1em; }
      h2 { border-bottom: 1px solid #111; font-size: 11pt; margin: 0 0 0.55em; padding-bottom: 0.25em; text-transform: uppercase; }
      .entry { margin-bottom: 0.6em; }
      .entry-line { display: flex; justify-content: space-between; gap: 16px; }
      .entry-line span { white-space: nowrap; }
      .sub-entry-line { display: flex; justify-content: space-between; gap: 16px; }
      .sub-entry-line em { white-space: nowrap; }
      ul { margin: 0.25em 0 0 1.25em; padding: 0; }
      li { margin-bottom: -0.15em; padding-left: 0.1em; }
      .project-list { margin-top: -0.9em; }
      .skill-cat { margin-bottom: 0.25em; }
      p { margin: 0; }
    `;
  }

  const customSectionsHtml = (resumeData.customSections || [])
    .map((sec) => renderSection(sec.heading, renderList(sec.items)))
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: Letter; margin: 0.38in; }
    * { box-sizing: border-box; }
    ${templateCss}
  </style></head><body>
    <header><h1>${escapeHtml(resumeData.name)}</h1><div class="address-row">${firstAddress}</div><div class="address-row">${secondAddress}</div></header>
    ${renderSection("Objective", resumeData.objective?.trim() ? `<p>${escapeHtml(resumeData.objective)}</p>` : "")}
    ${renderSection("Education", education)}
    ${renderSection("Skills", skills)}
    ${renderSection("Experience", experience)}
    ${renderSection("Projects", projects ? `<ul class="project-list">${projects}</ul>` : "")}
    ${renderSection("Extra-Curricular Activities", renderList(resumeData.extracurricularActivities || []))}
    ${renderSection("Leadership", renderList(resumeData.leadership || []))}
    ${customSectionsHtml}
  </body></html>`;
}

async function generateStructuredResumeData({
  resume,
  jobDescription,
  selfDescription,
}) {
  const prompt = `
You are an expert resume writer. Convert the candidate's resume into structured resume content tailored to the job description.
The resume should be tailored to the job description, highlighting relevant skills, experiences, and achievements.
The content should not be generic or sound AI-generated. Keep it ATS-friendly and use only facts present in the inputs.

Rules:
- Return every field required by the response schema.
- Use empty arrays or omit optional fields when the source does not support them.
- Keep the section content concise enough for a one-page US Letter resume.

Candidate's resume:
${resume}

Job description:
${jobDescription}

Candidate's self-description:
${selfDescription}
  `.trim();

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(resumeContentSchema),
  });

  return resumeContentSchema.parse(JSON.parse(response.text));
}

const atsKeywordSchema = z.object({
  matched: z
    .array(z.string())
    .describe(
      "Skills, technologies, and qualifications present in both the resume and the job description",
    ),
  missing: z
    .array(z.string())
    .describe(
      "Important skills, tools, or qualifications required in the job description that the resume lacks",
    ),
  score: z
    .number()
    .min(0)
    .max(100)
    .describe("Overall ATS keyword match percentage (0-100)"),
});

async function extractAtsKeywords({ resumeText, jobDescription }) {
  const prompt = `
Analyze the candidate's resume text against the target job description to evaluate ATS keyword matching.

Candidate's Resume:
${resumeText}

Target Job Description:
${jobDescription}

Identify:
1. "matched": Array of key technologies, hard skills, and methodologies found in both.
2. "missing": Array of high-priority keywords/skills required in the job description that the resume does NOT mention.
3. "score": Overall keyword match percentage from 0 to 100 based on the job description requirements.
`.trim();

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(atsKeywordSchema),
  });

  return JSON.parse(response.text);
}

const mockInterviewTurnSchema = z.object({
  feedback: z
    .string()
    .describe(
      "1-2 sentences of immediate coaching on the candidate's response (what was strong and how to sharpen it)",
    ),
  score: z.number().min(0).max(10).describe("Score out of 10 for this answer"),
  interviewerResponse: z
    .string()
    .describe(
      "The interviewer's next spoken reply acknowledging the answer and smoothly transitioning to the next question",
    ),
  nextQuestion: z
    .string()
    .optional()
    .describe("The next interview question to ask, or omitted if concluding"),
  isCompleted: z
    .boolean()
    .describe("True if this was the final question and the interview is done"),
  finalSummary: z
    .object({
      overallScore: z.number().min(0).max(10),
      communicationRating: z.number().min(0).max(10),
      technicalRating: z.number().min(0).max(10),
      feedback: z
        .string()
        .describe("Comprehensive summary of interview performance and actionable hiring recommendation"),
    })
    .optional(),
});

async function generateMockInterviewTurn({
  roleTitle,
  jobDescription,
  messages,
  candidateAnswer,
}) {
  const prompt = `
You are an expert, supportive yet rigorous hiring manager conducting an interactive job interview for the role of: "${roleTitle}".

Job Description:
${jobDescription}

Interview Transcript So Far:
${messages
  .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
  .join("\n")}

Candidate's Latest Spoken/Typed Answer:
CANDIDATE: ${candidateAnswer}

Total candidate answers given so far (including this one): ${
    messages.filter((m) => m.role === "candidate").length + 1
  }

Instructions:
1. Provide constructive coaching "feedback" on their answer (1-2 sentences).
2. Score their answer from 0 to 10.
3. If they have answered 4 questions (or if this is their 4th answer), conclude the interview, set "isCompleted" to true, and provide the "finalSummary" (overallScore, communicationRating, technicalRating, feedback).
4. If not yet done, set "isCompleted" to false, provide the interviewer's natural conversational response in "interviewerResponse", and give the "nextQuestion" (a mix of technical and situational questions).
`.trim();

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(mockInterviewTurnSchema),
  });

  return JSON.parse(response.text);
}

async function generateResumePdf({
  resumeData,
  resume,
  selfDescription,
  jobDescription,
  template = "classic",
}) {
  let structuredData = resumeData;
  if (!structuredData) {
    structuredData = await generateStructuredResumeData({
      resume,
      selfDescription,
      jobDescription,
    });
  }

  const html = buildResumeHtml(structuredData, template);
  const browser = await puppeteer.launch({
    headless: "shell",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    return { pdfBuffer, resumeData: structuredData };
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  generateStructuredResumeData,
  extractAtsKeywords,
  buildResumeHtml,
  evaluateCandidateAnswer,
  generateMockInterviewTurn,
};
