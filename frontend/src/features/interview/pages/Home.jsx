import { useInterview } from "../hooks/useInterview.js";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useToast } from "../../../context/toast.context.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { FilePdf, Briefcase, User, Plus } from "@phosphor-icons/react";

const Home = () => {
  const navigation = useNavigate();
  const { showToast } = useToast();

  const { loading, generateReport } =
    useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const resumeInputRef = useRef(null);

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files[0] || null;
    if (!jobDescription.trim()) {
      showToast("Please provide a job description.", "error");
      return;
    }
    if (!resumeFile && !selfDescription.trim()) {
      showToast(
        "Please provide either a resume or a self-description.",
        "error"
      );
      return;
    }

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      showToast("Interview plan generated successfully!", "success");
      navigation(`/interview/${data.interviewReport._id}`);
    } catch (error) {
      console.error("Error generating interview report:", error);
      showToast(
        "An error occurred while generating the interview report. Please try again.",
        "error"
      );
    }
  };

  if (loading) {
    return (
      <main className="flex flex-col h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-mute mb-4">Generating your interview strategy...</span>
        <div className="w-48 h-1 bg-hairline rounded-full overflow-hidden">
          <div className="h-full bg-primary animate-pulse w-1/2"></div>
        </div>
      </main>
    );
  }

  return (
    <div className="pb-16">
      <header className="py-8 flex flex-col items-center text-center">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.04em] text-ink mb-4">
          Architect Your Winning Strategy.
        </h1>
        <p className="text-base md:text-lg text-body max-w-[65ch]">
          Precision AI analysis benchmarking candidate credentials against deep role requirements.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Left Panel: Target Job Description */}
        <Card elevation="2" padding="xl" className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">Target Role</h2>
              <p className="text-sm text-body">Paste the job description.</p>
            </div>
          </div>
          
          <div className="flex flex-col">
            <textarea
              className="w-full h-[180px] bg-canvas-soft-2 border border-hairline rounded-md p-4 text-sm focus:outline-none focus:border-hairline-strong resize-none transition-colors"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="e.g., Senior Software Engineer at Stripe: Looking for deep expertise in distributed systems, TypeScript, API architecture, and high-availability database design..."
            />
            <div className="mt-2 text-xs text-mute text-right">
              {jobDescription.length} / 5000 chars
            </div>
          </div>
        </Card>

        {/* Right Panel: Candidate Profile */}
        <Card elevation="2" padding="xl" className="flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-ink" />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-ink">Candidate Profile</h2>
              <p className="text-sm text-body">Provide your background.</p>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="border border-hairline rounded-md p-4 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-canvas-soft transition-colors" onClick={() => resumeInputRef.current?.click()}>
              <FilePdf className="w-6 h-6 text-mute mb-2" />
              <span className="text-sm font-medium text-ink mb-1">
                {selectedFileName ? selectedFileName : "Upload Resume PDF"}
              </span>
              <span className="text-xs text-body">
                {selectedFileName ? "Click to replace" : "Standard PDF up to 5MB"}
              </span>
              <input
                ref={resumeInputRef}
                hidden
                type="file"
                accept=".pdf"
                onChange={(e) => setSelectedFileName(e.target.files[0]?.name || "")}
              />
            </div>

            <div className="flex items-center gap-4">
              <hr className="flex-1 border-hairline" />
              <span className="text-xs font-medium text-mute tracking-widest uppercase">OR</span>
              <hr className="flex-1 border-hairline" />
            </div>

            <div className="flex flex-col">
              <textarea
                className="w-full h-[100px] bg-canvas-soft-2 border border-hairline rounded-md p-4 text-sm focus:outline-none focus:border-hairline-strong resize-none transition-colors"
                value={selfDescription}
                onChange={(e) => setSelfDescription(e.target.value)}
                placeholder="Briefly describe your years of experience, core tech stack, standout achievements..."
              />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-center mb-24">
        <Button size="lg" onClick={handleGenerateReport} className="shadow-[0_0_0_1px_rgba(0,0,0,0.1)] w-full md:w-auto px-12">
          <Plus weight="bold" className="w-5 h-5 mr-2" />
          Generate Strategy
        </Button>
      </div>

    </div>
  );
};

export default Home;
