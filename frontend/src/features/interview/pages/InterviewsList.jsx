import { useEffect } from "react";
import { Link } from "react-router";
import { useInterview } from "../hooks/useInterview.js";
import { useToast } from "../../../context/toast.context.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Trash, PencilSimple, ArrowLeft } from "@phosphor-icons/react";

const InterviewsList = () => {
  const { reports, getAllReports, deleteReport, renameReport } = useInterview();
  const { showToast } = useToast();

  useEffect(() => {
    getAllReports();
  }, [getAllReports]);

  const handleDeleteReport = async (e, reportId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this interview plan?")) {
      try {
        await deleteReport(reportId);
        showToast("Interview plan deleted successfully.", "success");
      } catch {
        showToast("Failed to delete interview plan.", "error");
      }
    }
  };

  const handleRenameReport = async (e, reportId, currentTitle) => {
    e.preventDefault();
    e.stopPropagation();
    const newTitle = window.prompt("Enter new title for this plan:", currentTitle);
    if (newTitle && newTitle.trim() && newTitle.trim() !== currentTitle) {
      try {
        await renameReport(reportId, newTitle.trim());
        showToast("Interview plan renamed successfully.", "success");
      } catch {
        showToast("Failed to rename interview plan.", "error");
      }
    }
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      <header className="py-8 md:py-12">
        <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-mute hover:text-ink transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Generator
        </Link>
        <div className="flex items-end justify-between border-b border-hairline pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-ink mb-1">Previous Interviews</h1>
            <p className="text-body">Manage and review your AI-generated preparation plans.</p>
          </div>
          <span className="text-sm font-mono font-medium text-mute bg-canvas-soft-2 px-3 py-1 rounded-full border border-hairline">
            {reports.length} Total
          </span>
        </div>
      </header>

      {reports.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-canvas-soft border border-hairline rounded-lg border-dashed">
          <p className="text-lg text-ink font-medium mb-2">No previous interviews found.</p>
          <p className="text-body mb-6 max-w-sm">Generate your first interview strategy from the home dashboard.</p>
          <Link to="/">
            <Button variant="primary">Generate Strategy</Button>
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <Card key={report._id} elevation="2" padding="lg" className="group flex flex-col hover:shadow-[var(--shadow-level-3)] transition-shadow">
              <Link to={`/interview/${report._id}`} className="flex-1 flex flex-col">
                <div className="text-xs text-mute font-mono mb-4">
                  {new Date(report.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-ink mb-2 leading-snug line-clamp-2">
                  {report.title}
                </h3>
                <div className="mt-auto pt-6">
                  <span className="text-sm font-medium text-link group-hover:text-link-deep transition-colors flex items-center gap-1">
                    Open preparation track &rarr;
                  </span>
                </div>
              </Link>

              <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 !rounded-md bg-canvas/80 backdrop-blur" onClick={(e) => handleRenameReport(e, report._id, report.title)}>
                  <PencilSimple className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 !rounded-md text-error hover:bg-error-soft bg-canvas/80 backdrop-blur" onClick={(e) => handleDeleteReport(e, report._id)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default InterviewsList;
