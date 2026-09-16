import {
  generateInterviewReport,
  getInterviewReportById,
  getAllInterviewReports,
  generateResumePdf,
  deleteInterviewReport,
  renameInterviewReport,
  evaluateAnswer,
} from "../services/interview.api.js";
import { useCallback, useContext } from "react";
import { InterviewContext } from "../interview.context.jsx";

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  const { loading, setLoading, report, setReport, reports, setReports } =
    context;

  const generateReport = async ({
    jobDescription,
    selfDescription,
    resumeFile,
  }) => {
    setLoading(true);
    try {
      const response = await generateInterviewReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      setReport(response.interviewReport);
      return response;
    } catch (error) {
      console.error("Error generating interview report:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getReportById = useCallback(
    async (interviewId) => {
      setLoading(true);
      try {
        const response = await getInterviewReportById(interviewId);
        setReport(response.interviewReport);
      } catch (error) {
        console.error("Error fetching interview report by ID:", error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setReport],
  );

  const getAllReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllInterviewReports();
      setReports(response.interviewReports);
    } catch (error) {
      console.error("Error fetching all interview reports:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setReports]);

  const getresumePdf = async (interviewId) => {
    setLoading(true);
    try {
      const response = await generateResumePdf(interviewId);
      return response;
    } catch (error) {
      console.error("Error generating resume PDF:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReport = async (interviewId) => {
    try {
      await deleteInterviewReport(interviewId);
      setReports((prev) => prev.filter((r) => r._id !== interviewId));
      if (report?._id === interviewId) {
        setReport(null);
      }
    } catch (error) {
      console.error("Error deleting interview report:", error);
      throw error;
    }
  };

  const renameReport = async (interviewId, title) => {
    try {
      const response = await renameInterviewReport(interviewId, title);
      setReports((prev) =>
        prev.map((r) => (r._id === interviewId ? { ...r, title } : r))
      );
      if (report?._id === interviewId) {
        setReport((prev) => (prev ? { ...prev, title } : null));
      }
      return response;
    } catch (error) {
      console.error("Error renaming interview report:", error);
      throw error;
    }
  };

  const evaluatePracticeAnswer = async ({
    interviewId,
    question,
    questionType,
    candidateAnswer,
    intention,
    modelAnswer,
  }) => {
    try {
      const response = await evaluateAnswer({
        interviewId,
        question,
        questionType,
        candidateAnswer,
        intention,
        modelAnswer,
      });
      return response;
    } catch (error) {
      console.error("Error evaluating practice answer:", error);
      throw error;
    }
  };

  return {
    loading,
    report,
    reports,
    generateReport,
    getReportById,
    getAllReports,
    getresumePdf,
    deleteReport,
    renameReport,
    evaluatePracticeAnswer,
  };
};
