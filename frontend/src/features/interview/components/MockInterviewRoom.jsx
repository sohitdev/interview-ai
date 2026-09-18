import { useState, useEffect, useRef } from "react";
import {
  startMockInterview,
  sendMockInterviewTurn,
  getMockInterviewSession,
} from "../services/interview.api.js";
import { useToast } from "../../../context/toast.context.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { MicrophoneStage, SpeakerHigh, Microphone, PaperPlaneRight, Lightbulb, ChatCircleText, ChartLineUp, ArrowCounterClockwise, CornersIn, CornersOut } from "@phosphor-icons/react";

const MockInterviewRoom = ({ interviewId, roleTitle, isFullscreen, onToggleFullscreen }) => {
  const { showToast } = useToast();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [candidateInput, setCandidateInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState(null);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      setLoading(true);
      try {
        const res = await getMockInterviewSession(interviewId);
        if (isMounted && res.session) {
          setSession(res.session);
        }
      } catch (e) {
        console.error("Error fetching session", e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSession();
    return () => {
      isMounted = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      recognitionRef.current?.stop();
    };
  }, [interviewId]);

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const res = await startMockInterview(interviewId);
      setSession(res.session);
      showToast("Mock interview started! Good luck.", "success");
    } catch {
      showToast("Failed to start mock interview session.", "error");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSendTurn = async (e) => {
    e?.preventDefault();
    if (!candidateInput.trim() || isSubmitting) return;

    const answer = candidateInput.trim();
    setCandidateInput("");
    setIsSubmitting(true);

    try {
      const res = await sendMockInterviewTurn(interviewId, answer);
      setSession(res.session);
      if (res.turnResult?.isCompleted) {
        showToast("Mock interview completed! Check your scorecard.", "success");
      }
    } catch {
      showToast("Failed to process your response. Please retry.", "error");
      setCandidateInput(answer);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      showToast("Voice dictation is not supported in this browser. Please type your answer.", "info");
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
        showToast("Microphone active. Speak your answer...", "info", 2000);
      };

      recognition.onresult = (event) => {
        const last = event.results.length - 1;
        const text = event.results[last][0].transcript;
        setCandidateInput((prev) => (prev ? `${prev} ${text}` : text));
      };

      recognition.onerror = () => setIsRecording(false);
      recognition.onend = () => setIsRecording(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const readAloud = (text, index) => {
    if (!window.speechSynthesis) return;

    if (speakingIndex === index) {
      window.speechSynthesis.cancel();
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setSpeakingIndex(null);
    setSpeakingIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-mute gap-4">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Mock Interview Room...</p>
      </div>
    );
  }

  return (
    <Card elevation="1" padding="none" className={`flex flex-col border border-hairline overflow-hidden transition-all duration-300 ${isFullscreen ? "h-[85vh] max-h-none" : "min-h-[600px] max-h-[80vh]"}`}>
      <header className="px-6 py-4 border-b border-hairline bg-canvas-soft flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-body mb-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
            </span>
            Live Simulation
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">AI Mock Interviewer</h2>
          <p className="text-sm text-body line-clamp-1">Simulating hiring panel for {roleTitle}</p>
        </div>
        <div className="flex items-center gap-4">
          {!session || session.status === "completed" ? (
            <Button onClick={handleStart} disabled={isStarting}>
              <MicrophoneStage className="w-4 h-4 mr-2" />
              {isStarting ? "Calibrating..." : session ? "Retake Interview" : "Start Mock Session"}
            </Button>
          ) : null}
          {onToggleFullscreen && (
            <Button variant="ghost" size="icon" onClick={onToggleFullscreen} className="text-mute hover:text-ink">
              {isFullscreen ? <CornersIn className="w-5 h-5" /> : <CornersOut className="w-5 h-5" />}
            </Button>
          )}
        </div>
      </header>

      {!session ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-canvas">
          <div className="w-16 h-16 bg-canvas-soft-2 border border-hairline rounded-full flex items-center justify-center mb-6">
            <ChatCircleText className="w-8 h-8 text-mute" />
          </div>
          <h3 className="text-2xl font-semibold tracking-tight text-ink mb-2">Ready to Test Your Readiness?</h3>
          <p className="text-body max-w-md mb-8">
            Experience an adaptive interview session with voice synthesis read-aloud, instant coaching tips, and an end-of-session hiring scorecard.
          </p>
          <Button size="lg" onClick={handleStart} disabled={isStarting}>
            {isStarting ? "Calibrating..." : "Begin Interactive Session"}
          </Button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-canvas">
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {session.messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col max-w-[85%] ${msg.role === 'candidate' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className={`text-xs font-semibold tracking-wider uppercase ${msg.role === 'candidate' ? 'text-primary' : 'text-mute'}`}>
                    {msg.role === 'candidate' ? 'You' : 'AI Interviewer'}
                  </span>
                  {msg.score != null && (
                    <span className="text-[10px] font-mono font-bold bg-canvas-soft-2 text-ink px-1.5 py-0.5 rounded border border-hairline">
                      Score: {msg.score}/10
                    </span>
                  )}
                  {msg.role === "interviewer" && (
                    <button
                      className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors ${speakingIndex === idx ? 'bg-primary/10 text-primary' : 'text-mute hover:bg-canvas-soft hover:text-ink'}`}
                      onClick={() => readAloud(msg.content, idx)}
                    >
                      <SpeakerHigh weight={speakingIndex === idx ? "fill" : "regular"} className="w-3 h-3" />
                      {speakingIndex === idx ? "Speaking..." : "Read Aloud"}
                    </button>
                  )}
                </div>

                <div className={`p-4 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'candidate' ? 'bg-primary text-on-primary rounded-tr-sm' : 'bg-canvas-soft border border-hairline text-ink rounded-tl-sm'}`}>
                  {msg.content}
                </div>

                {msg.feedback && (
                  <div className={`mt-2 p-3 rounded-md text-sm border flex items-start gap-3 w-full max-w-lg ${msg.role === 'candidate' ? 'bg-canvas-soft-2 border-hairline text-body' : 'bg-warning/5 border-warning/20 text-ink'}`}>
                    <Lightbulb weight="fill" className={`w-5 h-5 shrink-0 mt-0.5 ${msg.role === 'candidate' ? 'text-mute' : 'text-warning'}`} />
                    <div>
                      <strong className="block text-sm font-medium mb-1">Instant Coaching Tip</strong>
                      <p className="leading-snug">{msg.feedback}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isSubmitting && (
              <div className="flex flex-col max-w-[85%] mr-auto items-start animate-in fade-in">
                <span className="text-xs font-semibold tracking-wider uppercase text-mute mb-1.5 px-1">AI Interviewer</span>
                <div className="p-4 rounded-xl rounded-tl-sm bg-canvas-soft border border-hairline flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-mute rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                  <span className="text-xs font-medium text-mute ml-2">Analyzing response...</span>
                </div>
              </div>
            )}

            {session.status === "completed" && session.finalSummary && (
              <div className="mt-8 animate-in slide-in-from-bottom-4">
                <Card elevation="2" padding="xl" className="border border-success/20 bg-success/5 max-w-2xl mx-auto">
                  <div className="flex items-start justify-between mb-8 pb-6 border-b border-success/10">
                    <div>
                      <div className="flex items-center gap-2 text-sm font-medium text-success mb-2">
                        <ChartLineUp weight="bold" className="w-4 h-4" /> Session Completed
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight text-ink">Evaluation Scorecard</h3>
                    </div>
                    <Button onClick={handleStart}>
                      <ArrowCounterClockwise className="w-4 h-4 mr-2" /> Retake
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-canvas border border-hairline rounded-md p-4 text-center shadow-sm">
                      <div className="text-sm font-medium text-body mb-1">Overall</div>
                      <div className="text-2xl font-mono font-bold text-ink">{session.finalSummary.overallScore}/10</div>
                    </div>
                    <div className="bg-canvas border border-hairline rounded-md p-4 text-center shadow-sm">
                      <div className="text-sm font-medium text-body mb-1">Communication</div>
                      <div className="text-2xl font-mono font-bold text-ink">{session.finalSummary.communicationRating}/10</div>
                    </div>
                    <div className="bg-canvas border border-hairline rounded-md p-4 text-center shadow-sm">
                      <div className="text-sm font-medium text-body mb-1">Technical</div>
                      <div className="text-2xl font-mono font-bold text-ink">{session.finalSummary.technicalRating}/10</div>
                    </div>
                  </div>

                  <div>
                    <strong className="block text-sm font-medium text-ink mb-2">Strategic Recommendations</strong>
                    <p className="text-sm leading-relaxed text-body bg-canvas p-4 rounded-md border border-hairline">{session.finalSummary.feedback}</p>
                  </div>
                </Card>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {session.status !== "completed" && (
            <div className="p-4 bg-canvas-soft border-t border-hairline shrink-0">
              <form onSubmit={handleSendTurn} className="flex flex-col gap-2 max-w-4xl mx-auto bg-canvas border border-hairline rounded-lg p-2 focus-within:border-primary focus-within:shadow-[0_0_0_1px_var(--color-primary)] transition-all">
                <textarea
                  className="w-full min-h-[60px] max-h-[200px] p-2 text-sm text-ink bg-transparent resize-none focus:outline-none"
                  value={candidateInput}
                  onChange={(e) => setCandidateInput(e.target.value)}
                  placeholder="Type your answer, or click Dictate..."
                  disabled={isSubmitting}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendTurn();
                    }
                  }}
                />
                <div className="flex items-center justify-between pt-2 border-t border-hairline">
                  <div className="flex items-center gap-3">
                    <Button type="button" variant={isRecording ? "danger" : "ghost"} size="sm" onClick={toggleMic}>
                      <Microphone className={`w-4 h-4 mr-2 ${isRecording ? "animate-pulse" : ""}`} />
                      {isRecording ? "Listening..." : "Dictate"}
                    </Button>
                    <span className="hidden sm:inline text-xs text-mute font-medium">
                      Press <kbd className="px-1 py-0.5 bg-canvas-soft border border-hairline rounded mx-0.5">Enter</kbd> to send
                    </span>
                  </div>
                  <Button type="submit" variant="primary" size="sm" disabled={!candidateInput.trim() || isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Response"}
                    {!isSubmitting && <PaperPlaneRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default MockInterviewRoom;
