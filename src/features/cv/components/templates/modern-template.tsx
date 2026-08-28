import { ExternalLink, Github, Linkedin, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/format";
import { initialsFromFullName, type CvTemplateProps } from "./types";

// "Modern" — dark teal header + gold accents, circular photo, sidebar for
// contact/skills. Fixed palette regardless of app theme: a CV is a document,
// not app chrome, so it should look the same whether the app is in light or
// dark mode.
export function ModernCvTemplate({ cv }: CvTemplateProps) {
  // Skills and Languages live in the fixed sidebar (chip/list styling doesn't fit
  // the main column); everything else — Summary included — renders in the main
  // column in exactly the order set by the candidate's Section order editor.
  const sidebarTypes = new Set(["Skills", "Languages"]);
  const sections = cv.sectionOrder.filter((s) => !sidebarTypes.has(s));
  const sidebarOrder = cv.sectionOrder.filter((s) => sidebarTypes.has(s));

  return (
    // Fixed minimum width, like a real document page, rather than reflowing at
    // arbitrary widths: Tailwind's `sm:` etc. breakpoints key off the browser
    // viewport, not this component's own rendered width, so using them here would
    // force the 2-column layout on even a very narrow host panel (e.g. a sidebar
    // preview) and clip content instead of adapting to it. The host container is
    // expected to provide horizontal scroll when it's narrower than this.
    <div className="min-w-[640px] overflow-hidden rounded-xl bg-white text-slate-800 shadow-elevated">
      <div className="relative bg-teal-900 px-8 pb-10 pt-8">
        <div className="flex items-center gap-5">
          {cv.photoUrl ? (
            <img
              src={cv.photoUrl}
              alt={cv.fullName}
              className="h-24 w-24 shrink-0 rounded-full border-4 border-amber-400 object-cover"
            />
          ) : (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-amber-400 bg-teal-800 text-2xl font-bold text-amber-300">
              {initialsFromFullName(cv.fullName)}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="break-words text-3xl font-black uppercase tracking-wide text-white">{cv.fullName}</h1>
            {cv.headline && <p className="mt-1 break-words text-sm font-medium uppercase tracking-widest text-amber-400">{cv.headline}</p>}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-3 bg-amber-400" />
      </div>

      <div className="grid grid-cols-[220px_1fr]">
        <div className="min-w-0 space-y-6 bg-teal-950/95 p-6 text-teal-50">
          <div className="space-y-2">
            {cv.email && (
              <p className="flex items-start gap-2 text-xs"><Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> <span className="min-w-0 break-all">{cv.email}</span></p>
            )}
            {cv.phone && (
              <p className="flex items-start gap-2 text-xs"><Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> <span className="min-w-0 break-all">{cv.phone}</span></p>
            )}
            {cv.githubUrl && (
              <p className="flex items-start gap-2 text-xs"><Github className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> <span className="min-w-0 break-all">{cv.githubUrl}</span></p>
            )}
            {cv.linkedInUrl && (
              <p className="flex items-start gap-2 text-xs"><Linkedin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" /> <span className="min-w-0 break-all">{cv.linkedInUrl}</span></p>
            )}
          </div>

          {sidebarOrder.map((section) =>
            section === "Skills" && cv.resolvedSkills.length > 0 ? (
              <div key={section}>
                <p className="mb-2 rounded-full border border-amber-400/60 px-3 py-1 text-center text-xs font-bold uppercase tracking-widest text-amber-400">
                  Skills
                </p>
                <ul className="space-y-1.5">
                  {cv.resolvedSkills.map((skill) => (
                    <li key={skill} className="break-words text-xs text-teal-50/90">• {skill}</li>
                  ))}
                </ul>
              </div>
            ) : section === "Languages" && cv.resolvedLanguages.length > 0 ? (
              <div key={section}>
                <p className="mb-2 rounded-full border border-amber-400/60 px-3 py-1 text-center text-xs font-bold uppercase tracking-widest text-amber-400">
                  Languages
                </p>
                <ul className="space-y-1.5">
                  {cv.resolvedLanguages.map((l, i) => (
                    <li key={i} className="break-words text-xs text-teal-50/90">
                      {l.languageName} <span className="text-amber-300">— {l.proficiency}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
        </div>

        <div className="min-w-0 space-y-6 p-6">
          {sections.map((section) => (
            <CvSection key={section} section={section} cv={cv} headerClassName="text-teal-900 border-amber-400" />
          ))}
        </div>
      </div>
    </div>
  );
}

function CvSection({ section, cv, headerClassName }: { section: string; cv: CvTemplateProps["cv"]; headerClassName: string }) {
  if (section === "Summary" && cv.summary) {
    return (
      <div>
        <h2 className={`mb-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest ${headerClassName}`}>Profile</h2>
        <p className="whitespace-pre-wrap break-words text-justify text-sm leading-relaxed text-slate-600">{cv.summary}</p>
      </div>
    );
  }

  if (section === "Experience" && cv.resolvedExperience.length > 0) {
    return (
      <div>
        <h2 className={`mb-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest ${headerClassName}`}>Experience</h2>
        <div className="space-y-4">
          {cv.resolvedExperience.map((e, i) => (
            <div key={i} className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="min-w-0 break-words font-semibold text-slate-900">{e.jobTitle}</p>
                <p className="shrink-0 text-xs text-slate-500">
                  {formatDate(e.startDate, "MMM yyyy")} – {e.isCurrent ? "Present" : formatDate(e.endDate, "MMM yyyy")}
                </p>
              </div>
              <p className="break-words text-sm text-slate-600">{e.companyName}</p>
              {e.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{e.description}</p>}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "Education" && cv.resolvedEducation.length > 0) {
    return (
      <div>
        <h2 className={`mb-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest ${headerClassName}`}>Education</h2>
        <div className="space-y-3">
          {cv.resolvedEducation.map((e, i) => (
            <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <div className="min-w-0">
                <p className="break-words font-semibold text-slate-900">
                  {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}
                </p>
                <p className="break-words text-sm text-slate-600">{e.institution}</p>
              </div>
              <p className="shrink-0 text-xs text-slate-500">{e.startYear ?? "—"} – {e.endYear ?? "Present"}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (section === "Certifications" && cv.resolvedCertifications.length > 0) {
    return (
      <div>
        <h2 className={`mb-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest ${headerClassName}`}>Certifications</h2>
        <ul className="space-y-1.5">
          {cv.resolvedCertifications.map((c, i) => (
            <li key={i} className="break-words text-sm text-slate-600">
              {c.name}{c.issuingOrg ? ` — ${c.issuingOrg}` : ""}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  if (section === "Projects" && cv.resolvedProjects.length > 0) {
    return (
      <div>
        <h2 className={`mb-3 border-b-2 pb-1 text-sm font-bold uppercase tracking-widest ${headerClassName}`}>Projects</h2>
        <div className="space-y-3">
          {cv.resolvedProjects.map((p, i) => (
            <div key={i} className="min-w-0">
              <p className="break-words font-semibold text-slate-900">{p.title}</p>
              {p.description && <p className="mt-1 whitespace-pre-wrap break-words text-justify text-sm text-slate-600">{p.description}</p>}
              {p.projectUrl && (
                <a href={p.projectUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-w-0 items-center gap-1 break-all text-xs font-medium text-teal-700 hover:underline">
                  <ExternalLink className="h-3 w-3 shrink-0" /> {p.projectUrl}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}
