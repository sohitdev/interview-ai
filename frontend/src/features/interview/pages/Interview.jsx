import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useInterview } from "../hooks/useInterview.js";
import { useToast } from "../../../context/toast.context.jsx";
import ResumeStudioModal from "../components/ResumeStudioModal.jsx";
import MockInterviewRoom from "../components/MockInterviewRoom.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { Code, Users, Calendar, MicrophoneStage, ArrowLeft, FilePdf, Play, CheckCircle, Circle, CaretDown, Check, Info, Microphone, Copy } from "@phosphor-icons/react";
import { motion, AnimatePresence } from "motion/react";

const NAV_ITEMS = [
  { id: "technical", label: "Technical", icon: Code },
  { id: "behavioral", label: "Behavioral", icon: Users },
  { id: "roadmap", label: "Road Map", icon: Calendar },
  { id: "mock", label: "Mock Interview", icon: MicrophoneStage },
];

const QuestionCard = ({ item, index, questionType, interviewId, initialPractice }) => {
  const [open, setOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(!!initialPractice);
  const [userAnswer, setUserAnswer] = useState(initialPractice?.candidateAnswer || "");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(initialPractice || null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(null);

  const { evaluatePracticeAnswer } = useInterview();
  const { showToast } = useToast();

  const handleToggleVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Speech recognition is not supported in this browser.", "info");
      return;
    }
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.onstart = () => {
        setIsRecording(true);
        showToast("Listening...", "info", 2000);
      };
      recognition.onresult = (event) => {
        const chunk = event.results[event.results.length - 1][0].transcript;
        setUserAnswer((prev) => (prev ? `${prev} ${chunk}` : chunk));
      };
      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);
      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleEvaluate = async () => {
    if (!userAnswer.trim() || isEvaluating) return;
    setIsEvaluating(true);
    try {
      const res = await evaluatePracticeAnswer({
        interviewId,
        question: item.question,
        questionType,
        candidateAnswer: userAnswer,
        intention: item.intention,
        modelAnswer: item.answer,
      });
      setEvaluation(res.evaluation);
      showToast("Answer evaluated successfully!", "success");
    } catch {
      showToast("Failed to evaluate answer.", "error");
    } finally {
      setIsEvaluating(false);
    }
  };

  const scoreColor = evaluation?.score >= 8 ? "text-success" : evaluation?.score >= 6 ? "text-warning" : "text-error";

  return (
    <Card elevation="2" padding="none" className="mb-4">
      <button className="w-full text-left p-5 flex items-start gap-4 hover:bg-canvas-soft transition-colors" onClick={() => setOpen(!open)}>
        <span className="text-sm font-mono text-mute mt-1 shrink-0">Q{String(index + 1).padStart(2, "0")}</span>
        <div className="flex-1">
          <p className="text-ink font-medium leading-snug">{item.question}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {evaluation ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2 py-1 rounded-sm">
              <Check weight="bold" /> {evaluation.score}/10
            </span>
          ) : (
            <span className="text-xs font-medium text-mute bg-canvas-soft-2 px-2 py-1 rounded-sm border border-hairline">
              Not Practiced
            </span>
          )}
          <CaretDown className={`w-5 h-5 text-mute transition-transform ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-hairline pt-5 flex flex-col gap-5">
              
              <div className="bg-canvas-soft-2 rounded-md p-4 border border-hairline">
                <div className="flex gap-2 items-center text-xs font-semibold uppercase tracking-wider text-mute mb-2">
                  <Info className="w-4 h-4" /> Intention
                </div>
                <p className="text-sm text-body">{item.intention}</p>
                <div className="flex gap-2 items-center text-xs font-semibold uppercase tracking-wider text-mute mt-4 mb-2">
                  <CheckCircle className="w-4 h-4" /> Model Answer
                </div>
                <p className="text-sm text-body">{item.answer}</p>
              </div>

              {!practiceOpen ? (
                <Button variant="outline" size="sm" onClick={() => setPracticeOpen(true)} className="self-start">
                  Open Practice Sandbox
                </Button>
              ) : (
                <div className="flex flex-col gap-4 border border-hairline rounded-md p-1">
                  <textarea
                    className="w-full min-h-[120px] bg-canvas p-3 text-sm focus:outline-none resize-none"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type or dictate your answer..."
                  />
                  <div className="flex items-center justify-between p-2 border-t border-hairline bg-canvas-soft">
                    <Button variant={isRecording ? "danger" : "ghost"} size="sm" onClick={handleToggleVoice}>
                      <Microphone className={`w-4 h-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
                      {isRecording ? "Listening..." : "Dictate"}
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleEvaluate} disabled={isEvaluating}>
                      {isEvaluating ? "Analyzing..." : "Evaluate"}
                    </Button>
                  </div>
                </div>
              )}

              {evaluation && (
                <div className="mt-4 flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-hairline pb-2">
                    <h4 className="font-semibold text-ink">Evaluation Results</h4>
                    <span className={`font-mono font-bold ${scoreColor}`}>{evaluation.score}/10</span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {evaluation.strengths?.length > 0 && (
                      <div className="bg-success/5 border border-success/20 rounded-md p-4">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-success mb-3">Strengths</h5>
                        <ul className="flex flex-col gap-2">
                          {evaluation.strengths.map((s, i) => (
                            <li key={i} className="text-sm text-body flex items-start gap-2">
                              <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {evaluation.improvements?.length > 0 && (
                      <div className="bg-warning/5 border border-warning/20 rounded-md p-4">
                        <h5 className="text-xs font-semibold uppercase tracking-wider text-warning mb-3">Improvements</h5>
                        <ul className="flex flex-col gap-2">
                          {evaluation.improvements.map((s, i) => (
                            <li key={i} className="text-sm text-body flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0 mt-1.5"></span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {evaluation.starFeedback && (
                    <div className="border border-hairline rounded-md overflow-hidden">
                      <div className="bg-canvas-soft px-4 py-2 border-b border-hairline text-xs font-semibold uppercase tracking-wider text-mute">
                        STAR Framework
                      </div>
                      <div className="grid sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-hairline">
                        {["situation", "task", "action", "result"].map((key) => 
                          evaluation.starFeedback[key] ? (
                            <div key={key} className="p-4 bg-canvas">
                              <div className="text-xs font-medium text-ink capitalize mb-1">{key}</div>
                              <p className="text-xs text-body">{evaluation.starFeedback[key]}</p>
                            </div>
                          ) : null
                        )}
                      </div>
                    </div>
                  )}

                  {evaluation.refinedAnswer && (
                    <div className="bg-canvas-soft-2 border border-hairline rounded-md p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-mute">Ideal Answer</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => {
                          navigator.clipboard?.writeText(evaluation.refinedAnswer);
                          showToast("Copied!", "success");
                        }}>
                          <Copy className="w-3 h-3 mr-1" /> Copy
                        </Button>
                      </div>
                      <p className="text-sm text-ink">{evaluation.refinedAnswer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

const RoadMapDay = ({ day }) => {
  const [completed, setCompleted] = useState({});

  return (
    <Card elevation="2" padding="lg" className="mb-4">
      <div className="flex items-start gap-4 mb-4">
        <div className="bg-primary text-on-primary text-xs font-mono font-bold px-2 py-1 rounded-sm shrink-0 mt-0.5">
          DAY {String(day.day).padStart(2, "0")}
        </div>
        <h3 className="text-lg font-semibold tracking-tight text-ink">{day.focus}</h3>
      </div>
      <div className="flex flex-col gap-2 pl-[4.5rem]">
        {day.tasks.map((task, i) => (
          <label key={i} className={`flex items-start gap-3 cursor-pointer group ${completed[i] ? 'opacity-60' : ''}`}>
            <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0" onClick={() => setCompleted(p => ({...p, [i]: !p[i]}))}>
              {completed[i] ? (
                <CheckCircle weight="fill" className="w-5 h-5 text-primary" />
              ) : (
                <Circle className="w-5 h-5 text-mute group-hover:text-ink transition-colors" />
              )}
            </div>
            <span className={`text-sm text-body leading-relaxed select-none ${completed[i] ? 'line-through' : ''}`}>
              {task}
            </span>
          </label>
        ))}
      </div>
    </Card>
  );
};

const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const [isResumeStudioOpen, setIsResumeStudioOpen] = useState(false);
  const { report, getReportById, loading } = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) getReportById(interviewId);
  }, [interviewId, getReportById]);

  if (loading || !report) {
    return (
      <main className="flex h-[60vh] items-center justify-center">
        <span className="text-sm font-medium text-mute">Loading interview plan...</span>
      </main>
    );
  }

  const scorePercent = report.matchScore * 10;
  const scoreColor = scorePercent >= 80 ? "text-success" : scorePercent >= 60 ? "text-warning" : "text-error";
  const scoreBorder = scorePercent >= 80 ? "border-success" : scorePercent >= 60 ? "border-warning" : "border-error";

  return (
    <div className="pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-mute hover:text-ink transition-colors mb-2">
            <ArrowLeft className="w-4 h-4" /> All Plans
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">{report.title}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsResumeStudioOpen(true)}>
            <FilePdf className="w-4 h-4 mr-2" /> Resume Studio
          </Button>
          <Button variant="primary" onClick={() => setActiveNav("mock")}>
            <Play className="w-4 h-4 mr-2" /> Mock Session
          </Button>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Nav */}
        <aside className="lg:w-64 shrink-0">
          <div className="sticky top-24 flex flex-col gap-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-mute mb-2 px-3">Curriculum</div>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${activeNav === item.id ? 'bg-canvas border border-hairline text-ink shadow-[0_1px_2px_rgba(0,0,0,0.04)]' : 'text-body hover:text-ink hover:bg-canvas/50 border border-transparent'}`}
                onClick={() => setActiveNav(item.id)}
              >
                <item.icon className={`w-4 h-4 ${activeNav === item.id ? 'text-primary' : 'text-mute'}`} />
                {item.label}
              </button>
            ))}
          </div>
        </aside>

        {/* Center Content */}
        <main className="flex-1 min-w-0">
          {activeNav === "technical" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-ink">Technical Questions</h2>
                <span className="text-sm font-mono text-mute">{report.technicalQuestions.length}</span>
              </div>
              <div className="flex flex-col">
                {report.technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} questionType="technical" interviewId={report._id} initialPractice={report.practiceAnswers?.find((pa) => pa.question === q.question)} />
                ))}
              </div>
            </div>
          )}

          {activeNav === "behavioral" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-ink">Behavioral Questions</h2>
                <span className="text-sm font-mono text-mute">{report.behavioralQuestions.length}</span>
              </div>
              <div className="flex flex-col">
                {report.behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} questionType="behavioral" interviewId={report._id} initialPractice={report.practiceAnswers?.find((pa) => pa.question === q.question)} />
                ))}
              </div>
            </div>
          )}

          {activeNav === "roadmap" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold tracking-tight text-ink">Preparation Road Map</h2>
                <span className="text-sm font-mono text-mute">{report.preparationPlan.length} Days</span>
              </div>
              <div className="flex flex-col">
                {report.preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </div>
          )}

          {activeNav === "mock" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <MockInterviewRoom interviewId={report._id} roleTitle={report.title} />
            </div>
          )}
        </main>

        {/* Right Sidebar (Match & Gaps) */}
        <aside className="lg:w-72 shrink-0">
          <div className="sticky top-24 flex flex-col gap-6">
            <Card elevation="2" padding="lg">
              <div className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Match Score</div>
              <div className="flex items-center gap-4">
                <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 ${scoreBorder}`}>
                  <span className={`font-mono font-bold text-xl ${scoreColor}`}>{scorePercent}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">
                    {scorePercent >= 80 ? "Strong Match" : scorePercent >= 60 ? "Fair Match" : "Weak Match"}
                  </p>
                  <p className="text-xs text-body">For this specific role</p>
                </div>
              </div>
            </Card>

            <Card elevation="2" padding="lg">
              <div className="text-xs font-semibold uppercase tracking-wider text-mute mb-4">Skill Gaps</div>
              <div className="flex flex-wrap gap-2">
                {report.skillGap.map((gap, i) => (
                  <div key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium ${gap.severity === 'High' ? 'bg-error/10 text-error border border-error/20' : gap.severity === 'Medium' ? 'bg-warning/10 text-warning border border-warning/20' : 'bg-canvas-soft-2 text-mute border border-hairline'}`}>
                    <span>{gap.skill}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </aside>

      </div>

      <ResumeStudioModal
        isOpen={isResumeStudioOpen}
        onClose={() => setIsResumeStudioOpen(false)}
        interviewReportId={report._id}
        resumeText={report.resume}
      />
    </div>
  );
};

export default Interview;
