import "../style/home.scss";
import { useInterview } from "../hooks/useInterview.js";
import { useState, useRef } from "react";
import { useNavigate } from "react-router";

const Home = () => {
  const navigation = useNavigate();

  const { loading, generateReport } = useInterview();
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const resumeInputRef = useRef(null);

  const handleGenerateReport = async () => {
    const resumeFile = resumeInputRef.current?.files[0] || null;
    if (!jobDescription.trim()) {
      alert("Please provide a job description.");
      return;
    }
    if (!resumeFile || !selfDescription.trim()) {
      alert("Please provide either a resume or a self-description.");
      return;
    }

    try {
      const data = await generateReport({
        jobDescription,
        selfDescription,
        resumeFile,
      });
      navigation(`/interview/${data.interviewReport._id}`);
    } catch (error) {
      console.error("Error generating interview report:", error);
      alert(
        "An error occurred while generating the interview report. Please try again.",
      );
    }
  };

  if (loading) {
    return (
      <main className="loading-screen">
        <h1>Generating your interview strategy...</h1>
      </main>
    );
  }

  return (
    <main className="home">
      <section className="interview-page">
        <header className="page-heading">
          <h1>
            Create Your Custom <span>Interview Plan</span>
          </h1>
          <p>
            Let our AI analyze the job requirements and your unique profile to
            <br className="desktop-break" /> build a winning strategy.
          </p>
        </header>

        <div className="interview-card">
          <div className="form-content">
            <section className="panel job-panel">
              <div className="section-heading">
                <h2>
                  <span className="heading-icon" aria-hidden="true">
                    [ ]
                  </span>
                  Target Job Description
                </h2>
                <span className="badge required-badge">Required</span>
              </div>
              <div className="textarea-wrap">
                <textarea
                  onChange={(e) => setJobDescription(e.target.value)}
                  id="jobDescription"
                  name="jobDescription"
                  maxLength="5000"
                  placeholder={
                    'Paste the full job description here...\ne.g. "Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design..."'
                  }
                ></textarea>
                <span className="character-count">0 / 5000 chars</span>
              </div>
            </section>

            <section className="panel profile-panel">
              <div className="section-heading">
                <h2>
                  <span className="heading-icon" aria-hidden="true">
                    &lt; &gt;
                  </span>
                  Your Profile
                </h2>
              </div>

              <div className="input-group resume-group">
                <div className="field-label-row">
                  <label htmlFor="resume">Upload Resume</label>
                  <span className="badge results-badge">Best Results</span>
                </div>
                <label className="file-label" htmlFor="resume">
                  <span className="upload-icon" aria-hidden="true">
                    ^
                  </span>
                  <strong>Click to upload or drag &amp; drop</strong>
                  <small>PDF (Max 3MB)</small>
                </label>
                <input
                  ref={resumeInputRef}
                  hidden
                  type="file"
                  name="resume"
                  id="resume"
                  accept=".pdf,.docx"
                />
              </div>

              <div className="or-divider" aria-hidden="true">
                <span>OR</span>
              </div>

              <div className="input-group description-group">
                <label htmlFor="selfDescription">Quick Self-Description</label>
                <textarea
                  onChange={(e) => setSelfDescription(e.target.value)}
                  id="selfDescription"
                  name="selfDescription"
                  placeholder="Briefly describe your experience, key skills, and years of experience if you do not have a resume handy..."
                ></textarea>
              </div>

              <div className="info-message">
                <span className="info-icon" aria-hidden="true">
                  i
                </span>
                <span>
                  Either a <strong>Resume</strong> or a{" "}
                  <strong>Self Description</strong> is required to generate a
                  personalized plan.
                </span>
              </div>
            </section>
          </div>

          <footer className="form-footer">
            <span className="footer-note">
              AI-Powered Strategy Generation&nbsp; &bull; &nbsp;Approx 30s
            </span>
            <button
              onClick={() => {
                handleGenerateReport();
              }}
              className="button primary-button"
              type="button"
            >
              <span aria-hidden="true">*</span> Generate My Interview Strategy
            </button>
          </footer>
        </div>

        <nav className="page-links" aria-label="Footer navigation">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#help">Help Center</a>
        </nav>
      </section>
    </main>
  );
};

export default Home;
