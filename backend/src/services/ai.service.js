const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });
const primaryModel = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || "gemini-3.5-flash";
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

  const response = await generateJsonContent(prompt, {
    responseMimeType: "application/json",
    responseSchema: z.toJSONSchema(interviewReportSchema),
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
      description: z.string(),
    }),
  ),
  extracurricularActivities: z.array(z.string()),
  leadership: z.array(z.string()),
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

function buildResumeHtml(resumeData) {
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

  const education = resumeData.education
    .map(
      (item) =>
        `<div class="entry"><div class="entry-line"><strong>${escapeHtml(item.degree)}</strong><span>${escapeHtml(item.dates)}</span></div><div>${escapeHtml(item.institution)}</div>${item.details ? `<div>${escapeHtml(item.details)}</div>` : ""}</div>`,
    )
    .join("");

  const skills = resumeData.skills
    .map(
      (item) =>
        `<div><strong>${escapeHtml(item.category)}</strong> ${escapeHtml(item.items.join(", "))}</div>`,
    )
    .join("");

  const experience = resumeData.experience
    .map(
      (item) =>
        `<div class="entry"><div class="entry-line"><strong>${escapeHtml(item.role)}</strong><span>${escapeHtml(item.dates)}</span></div><div class="sub-entry-line"><span>${escapeHtml(item.company)}</span><em>${escapeHtml(item.location)}</em></div>${renderList(item.bullets)}</div>`,
    )
    .join("");

  const projects = resumeData.projects
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.title)}.</strong> ${escapeHtml(item.description)}</li>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    @page { size: Letter; margin: 0.4in; }
    * { box-sizing: border-box; }
    body { margin: 0; color: #111; font-family: "Times New Roman", Times, serif; font-size: 11pt; line-height: 1.15; }
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
    p { margin: 0; }
  </style></head><body>
    <header><h1>${escapeHtml(resumeData.name)}</h1><div class="address-row">${firstAddress}</div><div class="address-row">${secondAddress}</div></header>
    ${renderSection("Objective", `<p>${escapeHtml(resumeData.objective)}</p>`)}
    ${renderSection("Education", education)}
    ${renderSection("Skills", skills)}
    ${renderSection("Experience", experience)}
    ${renderSection("Projects", `<ul class="project-list">${projects}</ul>`)}
    ${renderSection("Extra-Curricular Activities", renderList(resumeData.extracurricularActivities))}
    ${renderSection("Leadership", renderList(resumeData.leadership))}
  </body></html>`;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
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

  const html = buildResumeHtml(
    resumeContentSchema.parse(JSON.parse(response.text)),
  );
  const browser = await puppeteer.launch({ headless: "shell" });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    // Force screen CSS so print styles don't break your layout
    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: "Letter",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    return pdfBuffer;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generateInterviewReport,
  generateResumePdf,
  buildResumeHtml,
};
