import "../style/interview.scss";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useInterview } from "../hooks/useInterview.js";
import { generateResumePdf } from "../services/interview.api.js";

const NAV_ITEMS = [
  {
    id: "technical",
    label: "Technical Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    id: "behavioral",
    label: "Behavioral Questions",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    id: "roadmap",
    label: "Road Map",
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
      </svg>
    ),
  },
];

// ── Sub-components ────────────────────────────────────────────────────────────
const QuestionCard = ({ item, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="q-card">
      <div className="q-card__header" onClick={() => setOpen((o) => !o)}>
        <span className="q-card__index">Q{index + 1}</span>
        <p className="q-card__question">{item.question}</p>
      </div>
      {open && (
        <div className="q-card__body">
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--intention">
              Intention
            </span>
            <p>{item.intention}</p>
          </div>
          <div className="q-card__section">
            <span className="q-card__tag q-card__tag--answer">
              Model Answer
            </span>
            <p>{item.answer}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const RoadMapDay = ({ day }) => (
  <div className="roadmap-day">
    <div className="roadmap-day__header">
      <span className="roadmap-day__badge">Day {day.day}</span>
      <h3 className="roadmap-day__focus">{day.focus}</h3>
    </div>
    <ul className="roadmap-day__tasks">
      {day.tasks.map((task, i) => (
        <li key={i}>
          <span className="roadmap-day__bullet" />
          {task}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const Interview = () => {
  const [activeNav, setActiveNav] = useState("technical");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState("");
  const { report, getReportById, loading } = useInterview();
  const { interviewId } = useParams();

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId);
    }
  }, [interviewId, getReportById]);

  if (loading || !report) {
    return (
      <main className="loading-screen">
        <h1>Loading your interview plan...</h1>
      </main>
    );
  }

  const scorePercent = report.matchScore * 10;
  const scoreColor =
    scorePercent >= 80
      ? "score--high"
      : scorePercent >= 60
        ? "score--mid"
        : "score--low";

  const handleDownloadResume = async () => {
    if (!report?._id || isDownloading) return;

    setDownloadError("");
    setIsDownloading(true);
    try {
      await generateResumePdf(report._id, report.resume);
    } catch (error) {
      setDownloadError(
        error.response?.data?.message ||
          "We could not generate your resume. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="interview-page">
      <div className="interview-layout">
        {/* ── Left Nav ── */}
        <nav className="interview-nav">
          <div className="nav-content">
            <p className="interview-nav__label">Sections</p>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                className={`interview-nav__item ${activeNav === item.id ? "interview-nav__item--active" : ""}`}
                onClick={() => setActiveNav(item.id)}
              >
                <span className="interview-nav__icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <div className="resume-download">
            <button
              className="button primary-button resume-download__button"
              type="button"
              onClick={handleDownloadResume}
              disabled={isDownloading}
            >
              <svg
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 3v12" />
                <path d="m7 10 5 5 5-5" />
                <path d="M5 21h14" />
              </svg>
              {isDownloading ? "Generating PDF..." : "Download Resume"}
            </button>
            {downloadError && (
              <p className="resume-download__error" role="alert">
                {downloadError}
              </p>
            )}
          </div>
        </nav>

        <div className="interview-divider" />

        {/* ── Center Content ── */}
        <main className="interview-content">
          {activeNav === "technical" && (
            <section>
              <div className="content-header">
                <h2>Technical Questions</h2>
                <span className="content-header__count">
                  {report.technicalQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {report.technicalQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "behavioral" && (
            <section>
              <div className="content-header">
                <h2>Behavioral Questions</h2>
                <span className="content-header__count">
                  {report.behavioralQuestions.length} questions
                </span>
              </div>
              <div className="q-list">
                {report.behavioralQuestions.map((q, i) => (
                  <QuestionCard key={i} item={q} index={i} />
                ))}
              </div>
            </section>
          )}

          {activeNav === "roadmap" && (
            <section>
              <div className="content-header">
                <h2>Preparation Road Map</h2>
                <span className="content-header__count">
                  {report.preparationPlan.length}-day plan
                </span>
              </div>
              <div className="roadmap-list">
                {report.preparationPlan.map((day) => (
                  <RoadMapDay key={day.day} day={day} />
                ))}
              </div>
            </section>
          )}
        </main>

        <div className="interview-divider" />

        {/* ── Right Sidebar ── */}
        <aside className="interview-sidebar">
          {/* Match Score */}
          <div className="match-score">
            <p className="match-score__label">Match Score</p>
            <div className={`match-score__ring ${scoreColor}`}>
              <span className="match-score__value-group">
                <span className="match-score__value">{scorePercent}</span>
                <span className="match-score__pct">%</span>
              </span>
            </div>
            <p className="match-score__sub">Strong match for this role</p>
          </div>

          <div className="sidebar-divider" />

          {/* Skill Gaps */}
          <div className="skill-gaps">
            <p className="skill-gaps__label">Skill Gaps</p>
            <div className="skill-gaps__list">
              {report.skillGap.map((gap, i) => (
                <span
                  key={i}
                  className={`skill-tag skill-tag--${gap.severity}`}
                >
                  <span>{gap.skill}</span>
                  <small>{gap.severity}</small>
                </span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Interview;
