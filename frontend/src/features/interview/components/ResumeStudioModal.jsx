import { useEffect, useState } from "react";
import { getResumeStudioData, saveResumeStudioData, generateResumePdf, getPreviewResumePdfUrl } from "../services/interview.api.js";
import { useToast } from "../../../context/toast.context.jsx";
import { Button } from "../../../components/ui/Button.jsx";
import { Card } from "../../../components/ui/Card.jsx";
import { ThemeToggle } from "../../../components/ui/ThemeToggle.jsx";
import { ResumeContentEditor } from "./ResumeContentEditor.jsx";
import { X, CheckCircle, WarningCircle, DownloadSimple, FloppyDisk } from "@phosphor-icons/react";

const ResumeStudioModal = ({ isOpen, onClose, interviewReportId, resumeText }) => {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [template, setTemplate] = useState("classic");
  const [activeTab, setActiveTab] = useState("edit");
  const [resumeData, setResumeData] = useState(null);
  const [atsKeywords, setAtsKeywords] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchPreview = async (currentTemplate) => {
    if (!resumeData) return;
    setPreviewLoading(true);
    try {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      const url = await getPreviewResumePdfUrl(interviewReportId, currentTemplate || template, resumeData);
      setPreviewUrl(url);
    } catch {
      showToast("Failed to generate preview.", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === "preview" && !previewUrl) {
      fetchPreview();
    }
  };

  const handleTemplateChange = (t) => {
    setTemplate(t);
    if (activeTab === "preview") {
      fetchPreview(t);
    }
  };

  useEffect(() => {
    if (!isOpen || !interviewReportId) return;
    let isMounted = true;
    const fetchStudioData = async () => {
      setLoading(true);
      try {
        const data = await getResumeStudioData(interviewReportId);
        if (isMounted) {
          setResumeData(data.resumeData);
          setAtsKeywords(data.atsKeywords);
        }
      } catch {
        showToast("Failed to load tailored resume data.", "error");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchStudioData();
    return () => { isMounted = false; };
  }, [isOpen, interviewReportId, showToast]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!resumeData) return;
    setSaving(true);
    try {
      await saveResumeStudioData(interviewReportId, resumeData);
      showToast("Resume changes saved successfully!", "success");
    } catch {
      showToast("Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!resumeData || downloading) return;
    setDownloading(true);
    try {
      await saveResumeStudioData(interviewReportId, resumeData);
      await generateResumePdf(interviewReportId, resumeText, template, resumeData);
      showToast("Resume PDF downloaded successfully!", "success");
    } catch {
      showToast("Failed to generate PDF. Please try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-canvas animate-in fade-in duration-200" onClick={e => e.stopPropagation()}>
      {/* Header */}
      <header className="px-6 py-4 border-b border-hairline flex items-center justify-between shrink-0 bg-canvas-soft">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-ink">Resume Studio</h2>
          <p className="text-sm text-body">Tailor content and optimize for ATS systems</p>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button onClick={onClose} className="p-2 text-mute hover:text-ink hover:bg-canvas-soft-2 rounded-full transition-colors">
            <X weight="bold" className="w-6 h-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full">
          {/* Toolbar */}
          <div className="px-6 py-4 border-b border-hairline flex flex-wrap items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 text-sm">
            <span className="font-medium text-ink">Format:</span>
            <div className="flex bg-canvas border border-hairline rounded-md p-1">
              {["classic", "modern", "minimal"].map(t => (
                <button
                  key={t}
                  className={`px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors ${template === t ? 'bg-primary text-on-primary' : 'text-body hover:text-ink'}`}
                  onClick={() => handleTemplateChange(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex border-b-2 border-transparent">
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'edit' ? 'text-primary border-primary' : 'text-body border-transparent hover:text-ink'}`}
              onClick={() => handleTabChange('edit')}
            >
              Content Editor
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${activeTab === 'ats' ? 'text-primary border-primary' : 'text-body border-transparent hover:text-ink'}`}
              onClick={() => handleTabChange('ats')}
            >
              ATS Audit {atsKeywords && <span className="px-1.5 py-0.5 bg-canvas-soft-2 text-ink rounded font-mono text-[10px] border border-hairline">{atsKeywords.score}%</span>}
            </button>
            <button
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'preview' ? 'text-primary border-primary' : 'text-body border-transparent hover:text-ink'}`}
              onClick={() => handleTabChange('preview')}
            >
              Live Preview
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-mute gap-4">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Calibrating tailored resume data...</p>
            </div>
          ) : activeTab === 'preview' ? (
            <div className="w-full h-full animate-in fade-in duration-300">
              {previewLoading || !previewUrl ? (
                <div className="h-full flex flex-col items-center justify-center text-mute gap-4">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  <p className="text-sm font-medium">Generating live PDF preview...</p>
                </div>
              ) : (
                <iframe 
                  src={previewUrl} 
                  className="w-full h-full rounded-md border border-hairline bg-white" 
                  title="Resume Preview"
                />
              )}
            </div>
          ) : activeTab === 'ats' && atsKeywords ? (
            <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-300">
              <Card elevation="1" padding="lg" className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight text-ink">Keyword Congruence</h3>
                  <p className="text-sm text-body max-w-sm">Ratio of target skills detected in your experience.</p>
                </div>
                <div className="w-20 h-20 rounded-full border-4 border-success/20 flex items-center justify-center">
                  <span className="text-2xl font-mono font-bold text-success">{atsKeywords.score}%</span>
                </div>
              </Card>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-success mb-4">
                  <CheckCircle weight="fill" className="w-5 h-5" /> Matched Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {atsKeywords.matched.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-success/10 text-success border border-success/20 rounded-sm text-sm font-medium">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-error mb-4">
                  <WarningCircle weight="fill" className="w-5 h-5" /> Missing Keywords
                </h4>
                <div className="flex flex-wrap gap-2">
                  {atsKeywords.missing.map((kw, i) => (
                    <span key={i} className="px-2 py-1 bg-error/10 text-error border border-error/20 rounded-sm text-sm font-medium">
                      + {kw}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : resumeData ? (
            <ResumeContentEditor resumeData={resumeData} setResumeData={setResumeData} />
          ) : null}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-hairline bg-canvas-soft flex items-center justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={handleSave} disabled={saving || loading}>
            <FloppyDisk className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : "Save Edits"}
          </Button>
          <Button variant="primary" onClick={handleDownload} disabled={downloading || loading}>
            <DownloadSimple className="w-4 h-4 mr-2" />
            {downloading ? "Generating..." : `Download ${template.charAt(0).toUpperCase() + template.slice(1)} PDF`}
          </Button>
        </footer>
        </div>
      </div>
    </div>
  );
};

export default ResumeStudioModal;
