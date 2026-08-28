import { Briefcase, ExternalLink, FolderKanban, GraduationCap, Languages, Mail, Phone, User } from "lucide-react";
import { formatDate } from "@/lib/format";
import { initialsFromFullName, type CvTemplateProps } from "./types";

// "Classic" — clean navy-on-white, icon-marked vertical timeline for the main
// content, minimal single-accent color (closest to a traditional, ATS-style
// layout of the three). Fixed palette regardless of app theme.
export function ClassicCvTemplate({ cv }: CvTemplateProps) {
  // Skills lives in the fixed sidebar (a chip list doesn't fit a timeline entry);
  // everything else renders in the main timeline in exactly the order set by the
  // candidate's Section order editor, Summary included.
  const sections = cv.sectionOrder.filter((s) => s !== "Skills");
  const sectionIcon: Record<string, typeof User> = {
    Summary: User,
    Experience: Briefcase,
    Education: GraduationCap,
    Languages,
    Projects: FolderKanban,
  };

  return (
    // See modern-template.tsx for why this is a fixed min-width, not a viewport
    // breakpoint — the host panel provides scroll instead.
    <div className="grid min-w-[640px] grid-cols-[220px_1fr] gap-0 overflow-hidden rounded-xl bg-white text-slate-900 shadow-elevated">
      <div className="min-w-0 space-y-6 border-r border-slate-200 p-6">
        {cv.photoUrl ? (
          <img src={cv.photoUrl} alt={cv.fullName} className="h-20 w-20 rounded-full border-2 border-slate-900 object-cover" />
        ) : (
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-900 bg-slate-100 text-lg font-bold text-slate-700">
            {initialsFromFullName(cv.fullName)}
          </div>
        )}

        <div>
          <p className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900">Contact</p>
          <div className="space-y-2">
            {cv.phone && (
              <p className="flex items-start gap-2 text-xs text-slate-600">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" /> <span className="min-w-0 break-all">{cv.phone}</span>
              </p>
            )}
            {cv.email && (
              <p className="flex items-start gap-2 text-xs text-slate-600">
                <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-900" /> <span className="min-w-0 break-all">{cv.email}</span>
              </p>
            )}
          </div>
        </div>

        {cv.sectionOrder.includes("Skills") && cv.resolvedSkills.length > 0 && (
          <div>
            <p className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase tracking-widest text-slate-900">Skills</p>
            <ul className="space-y-1.5">
              {cv.resolvedSkills.map((skill) => (
                <li key={skill} className="break-words text-xs text-slate-600">{skill}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-w-0 p-6">
        <h1 className="break-words text-3xl font-black uppercase tracking-tight text-slate-900">{cv.fullName}</h1>
        {cv.headline && <p className="mt-1 break-words text-sm uppercase tracking-widest text-slate-500">{cv.headline}</p>}
        <div className="mt-2 h-0.5 w-16 bg-slate-900" />

        <div className="relative mt-6 space-y-6 border-l-2 border-slate-200 pl-6">
          {sections.map((section) => (
            <ClassicSection key={section} section={section} cv={cv} icon={sectionIcon[section] ?? Briefcase} />
          ))}
        </div>
      </div>
    </div>
  );
}

function TimelineEntry({ icon: Icon, children }: { icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="relative min-w-0">
      <span className="absolute -left-[31px] flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-white">
        <Icon className="h-3 w-3" />
      </span>
      {children}
    </div>
  );
}

function ClassicSection({ section, cv, icon }: { section: string; cv: CvTemplateProps["cv"]; icon: typeof User }) {
  if (section === "Summary" && cv.summary) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-1 text-sm font-bold uppercase tracking-widest text-slate-900">Profile</h2>
        <p className="whitespace-pre-wrap break-words text-justify text-sm leading-relaxed text-slate-600">{cv.summary}</p>
      </TimelineEntry>
    );
  }

  if (section === "Experience" && cv.resolvedExperience.length > 0) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Work Experience</h2>
        <div className="space-y-3">
          {cv.resolvedExperience.map((e, i) => (
            <div key={i} className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">{e.jobTitle}</p>
              <p className="break-words text-xs text-slate-500">
                {e.companyName} · {formatDate(e.startDate, "MMM yyyy")} – {e.isCurrent ? "Present" : formatDate(e.endDate, "MMM yyyy")}
              </p>
              {e.description && <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{e.description}</p>}
            </div>
          ))}
        </div>
      </TimelineEntry>
    );
  }

  if (section === "Education" && cv.resolvedEducation.length > 0) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Education</h2>
        <div className="space-y-2">
          {cv.resolvedEducation.map((e, i) => (
            <div key={i} className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">
                {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""}
              </p>
              <p className="break-words text-xs text-slate-500">{e.institution} · {e.startYear ?? "—"} – {e.endYear ?? "Present"}</p>
            </div>
          ))}
        </div>
      </TimelineEntry>
    );
  }

  if (section === "Certifications" && cv.resolvedCertifications.length > 0) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Certifications</h2>
        <ul className="space-y-1">
          {cv.resolvedCertifications.map((c, i) => (
            <li key={i} className="break-words text-sm text-slate-600">{c.name}{c.issuingOrg ? ` — ${c.issuingOrg}` : ""}</li>
          ))}
        </ul>
      </TimelineEntry>
    );
  }

  if (section === "Languages" && cv.resolvedLanguages.length > 0) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Languages</h2>
        <ul className="space-y-1">
          {cv.resolvedLanguages.map((l, i) => (
            <li key={i} className="break-words text-sm text-slate-600">{l.languageName} — {l.proficiency}</li>
          ))}
        </ul>
      </TimelineEntry>
    );
  }

  if (section === "Projects" && cv.resolvedProjects.length > 0) {
    return (
      <TimelineEntry icon={icon}>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-widest text-slate-900">Projects</h2>
        <div className="space-y-3">
          {cv.resolvedProjects.map((p, i) => (
            <div key={i} className="min-w-0">
              <p className="break-words text-sm font-semibold text-slate-900">{p.title}</p>
              {p.description && <p className="mt-1 whitespace-pre-wrap break-words text-justify text-sm text-slate-600">{p.description}</p>}
              {p.projectUrl && (
                <a href={p.projectUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-w-0 items-center gap-1 break-all text-xs font-medium text-slate-700 hover:underline">
                  <ExternalLink className="h-3 w-3 shrink-0" /> {p.projectUrl}
                </a>
              )}
            </div>
          ))}
        </div>
      </TimelineEntry>
    );
  }

  return null;
}
