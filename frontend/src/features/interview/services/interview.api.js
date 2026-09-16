import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/",
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

export const generateResumePdf = async (interviewReportId, resumeText) => {
  try {
    const response = await api.post(
      `api/interview/resume/pdf/${interviewReportId}`,
      {},
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
