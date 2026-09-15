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
