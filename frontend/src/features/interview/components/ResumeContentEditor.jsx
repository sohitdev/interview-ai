import { Trash, Plus } from "@phosphor-icons/react";
import { Button } from "../../../components/ui/Button.jsx";

export const ResumeContentEditor = ({ resumeData, setResumeData }) => {
  const updateField = (field, value) => {
    setResumeData(p => ({ ...p, [field]: value }));
  };

  const updateArrayItem = (field, index, value) => {
    setResumeData(p => {
      const newArray = [...(p[field] || [])];
      newArray[index] = value;
      return { ...p, [field]: newArray };
    });
  };

  const addArrayItem = (field, emptyItem) => {
    setResumeData(p => ({ ...p, [field]: [...(p[field] || []), emptyItem] }));
  };

  const removeArrayItem = (field, index) => {
    setResumeData(p => {
      const newArray = [...(p[field] || [])];
      newArray.splice(index, 1);
      return { ...p, [field]: newArray };
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in duration-300 pb-12">
      
      {/* Header Info */}
      <section className="space-y-4">
        <h3 className="text-sm font-medium text-body border-b border-hairline pb-2">Personal Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-body mb-1 block">Full Name</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.name || ""} onChange={e => updateField('name', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-body mb-1 block">Email</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.email || ""} onChange={e => updateField('email', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-body mb-1 block">Phone</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.phone || ""} onChange={e => updateField('phone', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-body mb-1 block">Location</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.location || ""} onChange={e => updateField('location', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-body mb-1 block">LinkedIn</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.linkedin || ""} onChange={e => updateField('linkedin', e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-body mb-1 block">Website / GitHub</label>
            <input className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary" value={resumeData.website || ""} onChange={e => updateField('website', e.target.value)} />
          </div>
        </div>
      </section>

      {/* Professional Summary */}
      <section className="space-y-3">
        <h3 className="text-sm font-medium text-body border-b border-hairline pb-2">Professional Summary</h3>
        <textarea
          className="w-full min-h-[100px] bg-canvas-soft border border-hairline rounded-md p-3 text-sm text-ink focus:outline-none focus:border-primary resize-y"
          value={resumeData.objective || ""}
          onChange={e => updateField('objective', e.target.value)}
        />
      </section>

      {/* Experience */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h3 className="text-sm font-medium text-body">Experience</h3>
          <button className="text-xs text-primary font-medium flex items-center hover:underline" onClick={() => addArrayItem('experience', { role: '', company: '', dates: '', location: '', bullets: [''] })}>
            <Plus weight="bold" className="mr-1" /> Add Role
          </button>
        </div>
        {(resumeData.experience || []).map((exp, idx) => (
          <div key={idx} className="p-4 bg-canvas-soft border border-hairline rounded-md space-y-3 relative group">
            <button className="absolute top-3 right-3 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('experience', idx)}>
              <Trash weight="bold" />
            </button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <input placeholder="Role Title" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-semibold" value={exp.role} onChange={e => updateArrayItem('experience', idx, { ...exp, role: e.target.value })} />
              <input placeholder="Company" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none" value={exp.company} onChange={e => updateArrayItem('experience', idx, { ...exp, company: e.target.value })} />
              <input placeholder="Dates (e.g. Jan 2020 - Present)" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-mono" value={exp.dates || ""} onChange={e => updateArrayItem('experience', idx, { ...exp, dates: e.target.value })} />
              <input placeholder="Location" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none" value={exp.location || ""} onChange={e => updateArrayItem('experience', idx, { ...exp, location: e.target.value })} />
            </div>
            <div className="space-y-2 mt-2">
              <label className="text-xs font-medium text-body">Bullets</label>
              {(exp.bullets || []).map((b, bIdx) => (
                <div key={bIdx} className="flex gap-2">
                  <textarea className="flex-1 min-h-[40px] bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none resize-y" value={b} onChange={e => {
                    const newBullets = [...exp.bullets];
                    newBullets[bIdx] = e.target.value;
                    updateArrayItem('experience', idx, { ...exp, bullets: newBullets });
                  }} />
                  <button className="text-mute hover:text-error self-start mt-2" onClick={() => {
                    const newBullets = [...exp.bullets];
                    newBullets.splice(bIdx, 1);
                    updateArrayItem('experience', idx, { ...exp, bullets: newBullets });
                  }}><Trash /></button>
                </div>
              ))}
              <button className="text-xs text-primary font-medium mt-1" onClick={() => {
                updateArrayItem('experience', idx, { ...exp, bullets: [...(exp.bullets || []), ""] });
              }}>+ Add Bullet</button>
            </div>
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h3 className="text-sm font-medium text-body">Projects</h3>
          <button className="text-xs text-primary font-medium flex items-center hover:underline" onClick={() => addArrayItem('projects', { title: '', description: '', bullets: [] })}>
            <Plus weight="bold" className="mr-1" /> Add Project
          </button>
        </div>
        {(resumeData.projects || []).map((proj, idx) => (
          <div key={idx} className="p-4 bg-canvas-soft border border-hairline rounded-md space-y-3 relative group">
            <button className="absolute top-3 right-3 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('projects', idx)}>
              <Trash weight="bold" />
            </button>
            <input placeholder="Project Title" className="w-full max-w-sm bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-semibold" value={proj.title} onChange={e => updateArrayItem('projects', idx, { ...proj, title: e.target.value })} />
            <textarea placeholder="Description (Optional)" className="w-full min-h-[60px] bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none resize-y" value={proj.description || ""} onChange={e => updateArrayItem('projects', idx, { ...proj, description: e.target.value })} />
            
            <div className="space-y-2 mt-2">
              <label className="text-xs font-medium text-body">Bullets</label>
              {(proj.bullets || []).map((b, bIdx) => (
                <div key={bIdx} className="flex gap-2">
                  <textarea className="flex-1 min-h-[40px] bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none resize-y" value={b} onChange={e => {
                    const newBullets = [...(proj.bullets || [])];
                    newBullets[bIdx] = e.target.value;
                    updateArrayItem('projects', idx, { ...proj, bullets: newBullets });
                  }} />
                  <button className="text-mute hover:text-error self-start mt-2" onClick={() => {
                    const newBullets = [...(proj.bullets || [])];
                    newBullets.splice(bIdx, 1);
                    updateArrayItem('projects', idx, { ...proj, bullets: newBullets });
                  }}><Trash /></button>
                </div>
              ))}
              <button className="text-xs text-primary font-medium mt-1" onClick={() => {
                updateArrayItem('projects', idx, { ...proj, bullets: [...(proj.bullets || []), ""] });
              }}>+ Add Bullet</button>
            </div>
          </div>
        ))}
        {!(resumeData.projects?.length) && <p className="text-sm text-mute italic">No projects added yet.</p>}
      </section>

      {/* Education */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h3 className="text-sm font-medium text-body">Education</h3>
          <button className="text-xs text-primary font-medium flex items-center hover:underline" onClick={() => addArrayItem('education', { degree: '', institution: '', dates: '', details: '' })}>
            <Plus weight="bold" className="mr-1" /> Add Education
          </button>
        </div>
        {(resumeData.education || []).map((edu, idx) => (
          <div key={idx} className="p-4 bg-canvas-soft border border-hairline rounded-md space-y-3 relative group">
            <button className="absolute top-3 right-3 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('education', idx)}>
              <Trash weight="bold" />
            </button>
            <div className="grid grid-cols-2 gap-3 pr-8">
              <input placeholder="Degree / Certification" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-semibold" value={edu.degree} onChange={e => updateArrayItem('education', idx, { ...edu, degree: e.target.value })} />
              <input placeholder="Institution" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none" value={edu.institution} onChange={e => updateArrayItem('education', idx, { ...edu, institution: e.target.value })} />
              <input placeholder="Dates" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-mono" value={edu.dates || ""} onChange={e => updateArrayItem('education', idx, { ...edu, dates: e.target.value })} />
            </div>
            <input placeholder="Additional Details (GPA, Honors...)" className="w-full bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none" value={edu.details || ""} onChange={e => updateArrayItem('education', idx, { ...edu, details: e.target.value })} />
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h3 className="text-sm font-medium text-body">Technical Skills</h3>
          <button className="text-xs text-primary font-medium flex items-center hover:underline" onClick={() => addArrayItem('skills', { category: 'New Category', items: [] })}>
            <Plus weight="bold" className="mr-1" /> Add Category
          </button>
        </div>
        {(resumeData.skills || []).map((skill, idx) => (
          <div key={idx} className="flex flex-col gap-1.5 relative group pl-2 border-l-2 border-transparent hover:border-hairline-strong transition-colors">
            <div className="flex items-center justify-between">
              <input className="bg-transparent border-none text-sm font-medium text-ink focus:outline-none focus:text-primary p-0 w-48" value={skill.category} onChange={e => updateArrayItem('skills', idx, { ...skill, category: e.target.value })} />
              <button className="text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('skills', idx)}>
                <Trash size={14} weight="bold" />
              </button>
            </div>
            <input
              placeholder="Comma separated skills..."
              className="w-full bg-canvas-soft border border-hairline rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-primary"
              value={skill.items.join(", ")}
              onChange={e => {
                const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                updateArrayItem('skills', idx, { ...skill, items: arr.length ? arr : e.target.value.split(",") });
              }}
              onBlur={e => {
                const arr = e.target.value.split(",").map(s => s.trim()).filter(Boolean);
                updateArrayItem('skills', idx, { ...skill, items: arr });
              }}
            />
          </div>
        ))}
      </section>

      {/* Custom Sections */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-2">
          <h3 className="text-sm font-medium text-body">Custom Sections</h3>
          <button className="text-xs text-primary font-medium flex items-center hover:underline" onClick={() => addArrayItem('customSections', { heading: 'Custom Section', items: [] })}>
            <Plus weight="bold" className="mr-1" /> Add Custom Section
          </button>
        </div>
        {(resumeData.customSections || []).map((sec, idx) => (
          <div key={idx} className="p-4 bg-canvas-soft border border-hairline rounded-md space-y-3 relative group">
            <button className="absolute top-3 right-3 text-mute hover:text-error opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeArrayItem('customSections', idx)}>
              <Trash weight="bold" />
            </button>
            <input placeholder="Section Heading" className="w-full max-w-sm bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none font-semibold uppercase tracking-wider" value={sec.heading} onChange={e => updateArrayItem('customSections', idx, { ...sec, heading: e.target.value })} />
            
            <div className="space-y-2 mt-2">
              <label className="text-xs font-medium text-body">Bullets</label>
              {(sec.items || []).map((b, bIdx) => (
                <div key={bIdx} className="flex gap-2">
                  <textarea className="flex-1 min-h-[40px] bg-canvas border border-hairline rounded px-2 py-1.5 text-sm text-ink focus:border-primary outline-none resize-y" value={b} onChange={e => {
                    const newItems = [...(sec.items || [])];
                    newItems[bIdx] = e.target.value;
                    updateArrayItem('customSections', idx, { ...sec, items: newItems });
                  }} />
                  <button className="text-mute hover:text-error self-start mt-2" onClick={() => {
                    const newItems = [...(sec.items || [])];
                    newItems.splice(bIdx, 1);
                    updateArrayItem('customSections', idx, { ...sec, items: newItems });
                  }}><Trash /></button>
                </div>
              ))}
              <button className="text-xs text-primary font-medium mt-1" onClick={() => {
                updateArrayItem('customSections', idx, { ...sec, items: [...(sec.items || []), ""] });
              }}>+ Add Bullet</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};
