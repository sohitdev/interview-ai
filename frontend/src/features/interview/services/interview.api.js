import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/",
  withCredentials: true,
});

/**
 *@description service to generate interview reports based on resume, jobDescription and self Description
 */
export const generateInterviewReport = async ({
  resumeFile,
  jobDescription,
  selfDescription,
}) => {
  const formData = new FormData();
  formData.append("resume", resumeFile);
  formData.append("jobDescription", jobDescription);
  formData.append("selfDescription", selfDescription);

  try {
    const response = await api.post("api/interview/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error generating interview report:", error);
    throw error;
  }
};

/**
 * @description service to get interview report by id
 */
export const getInterviewReportById = async (interviewId) => {
  try {
    const response = await api.get(`api/interview/report/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching interview report by id:", error);
    throw error;
  }
};

/**
 * @description service to get all interview reports
 */
export const getAllInterviewReports = async () => {
  try {
    const response = await api.get("api/interview/reports");
    return response.data;
  } catch (error) {
    console.error("Error fetching all interview reports:", error);
    throw error;
  }
};

/**
 * @description service to delete an interview report by id
 */
export const deleteInterviewReport = async (interviewId) => {
  try {
    const response = await api.delete(`api/interview/report/${interviewId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting interview report:", error);
    throw error;
  }
};

/**
 * @description service to rename an interview report title
 */
export const renameInterviewReport = async (interviewId, title) => {
  try {
    const response = await api.patch(`api/interview/report/${interviewId}`, {
      title,
    });
    return response.data;
  } catch (error) {
    console.error("Error renaming interview report:", error);
    throw error;
  }
};

/**
 * @description service to generate resume pdf based on user selfdescription, resume and job      description
 */

const buildResumeFilename = (resumeText, interviewReportId) => {
  const candidateName = resumeText
    ?.split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("PDF PARSED TEXT"));

  const safeName = candidateName
    ?.replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();

  return safeName
    ? `${safeName}_resume.pdf`
    : `resume_${interviewReportId}.pdf`;
};

export const generateResumePdf = async (
  interviewReportId,
  resumeText,
  template = "classic",
  resumeData = null,
) => {
  try {
    const response = await api.post(
      `api/interview/resume/pdf/${interviewReportId}?template=${template}`,
      { template, resumeData },
      {
        responseType: "blob", // Important for handling binary data
      },
    );

    // Create a Blob from the PDF data
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });

    // Create a URL for the Blob
    const pdfUrl = window.URL.createObjectURL(pdfBlob);

    // Create a temporary link element to trigger the download
    const link = document.createElement("a");
    link.href = pdfUrl;
    link.download = buildResumeFilename(resumeText, interviewReportId);
    document.body.appendChild(link);
    link.click();

    // Clean up the temporary link and URL
    document.body.removeChild(link);
    window.URL.revokeObjectURL(pdfUrl);
  } catch (error) {
    console.error("Error generating resume PDF:", error);
    throw error;
  }
};

export const getPreviewResumePdfUrl = async (
  interviewReportId,
  template = "classic",
  resumeData = null,
) => {
  try {
    const response = await api.post(
      `api/interview/resume/pdf/${interviewReportId}?template=${template}`,
      { template, resumeData },
      { responseType: "blob" }
    );
    const pdfBlob = new Blob([response.data], { type: "application/pdf" });
    return window.URL.createObjectURL(pdfBlob);
  } catch (error) {
    console.error("Error generating preview PDF:", error);
    throw error;
  }
};

/**
 * @description service to evaluate a candidate's answer with AI
 */
export const evaluateAnswer = async ({
  interviewId,
  question,
  questionType,
  candidateAnswer,
  intention,
  modelAnswer,
}) => {
  try {
    const response = await api.post("api/interview/evaluate-answer", {
      interviewId,
      question,
      questionType,
      candidateAnswer,
      intention,
      modelAnswer,
    });
    return response.data;
  } catch (error) {
    console.error("Error evaluating answer:", error);
    throw error;
  }
};

/**
 * @description service to get resume studio data (tailored JSON and ATS keywords)
 */
export const getResumeStudioData = async (interviewReportId) => {
  try {
    const response = await api.get(
      `api/interview/resume/studio/${interviewReportId}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching resume studio data:", error);
    throw error;
  }
};

/**
 * @description service to save tailored resume data
 */
export const saveResumeStudioData = async (interviewReportId, resumeData) => {
  try {
    const response = await api.put(
      `api/interview/resume/studio/${interviewReportId}`,
      { resumeData },
    );
    return response.data;
  } catch (error) {
    console.error("Error saving resume studio data:", error);
    throw error;
  }
};

/**
 * @description service to start mock interview
 */
export const startMockInterview = async (interviewId) => {
  try {
    const response = await api.post(`api/interview/mock/${interviewId}/start`);
    return response.data;
  } catch (error) {
    console.error("Error starting mock interview:", error);
    throw error;
  }
};

/**
 * @description service to send candidate turn in mock interview
 */
export const sendMockInterviewTurn = async (interviewId, candidateAnswer) => {
  try {
    const response = await api.post(`api/interview/mock/${interviewId}/turn`, {
      candidateAnswer,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending mock interview answer:", error);
    throw error;
  }
};

/**
 * @description service to get mock interview session
 */
export const getMockInterviewSession = async (interviewId) => {
  try {
    const response = await api.get(
      `api/interview/mock/${interviewId}/session`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching mock interview session:", error);
    throw error;
  }
};
