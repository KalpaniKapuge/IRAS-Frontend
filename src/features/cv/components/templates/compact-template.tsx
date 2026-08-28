import { ExternalLink, Github, Linkedin, Mail, Phone } from "lucide-react";
import { formatDate } from "@/lib/format";
import { initialsFromFullName, type CvTemplateProps } from "./types";

// "Compact" — dark sidebar with a warm accent color, photo at the top of the
// sidebar, dense main column. Fixed palette regardless of app theme.
export function CompactCvTemplate({ cv }: CvTemplateProps) {
  // Skills and Languages live in the fixed dark sidebar (chip/list styling doesn't
  // fit the main column); everything else — Summary included — renders in the main
  // column in exactly the order set by the candidate's Section order editor.
  const sidebarTypes = new Set(["Skills", "Languages"]);
  const sections = cv.sectionOrder.filter((s) => !sidebarTypes.has(s));
  const sidebarOrder = cv.sectionOrder.filter((s) => sidebarTypes.has(s));
  const contact = [
    cv.phone && { icon: Phone, value: cv.phone },
    cv.email && { icon: Mail, value: cv.email },
    cv.linkedInUrl && { icon: Linkedin, value: cv.linkedInUrl },
    cv.githubUrl && { icon: Github, value: cv.githubUrl },
  ].filter(Boolean) as { icon: typeof Phone; value: string }[];

  return (
    // See modern-template.tsx for why this is a fixed min-width, not a viewport
    // breakpoint — the host panel provides scroll instead.
    <div className="grid min-w-[680px] grid-cols-[240px_1fr] overflow-hidden rounded-xl bg-white text-slate-800 shadow-elevated">
      <div className="min-w-0 space-y-6 bg-neutral-900 p-6 text-neutral-100">
        {cv.photoUrl ? (
          <img src={cv.photoUrl} alt={cv.fullName} className="h-28 w-28 rounded-full border-4 border-orange-500 object-cover" />
        ) : (
          <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-orange-500 bg-neutral-800 text-2xl font-bold text-orange-400">
            {initialsFromFullName(cv.fullName)}
          </div>
        )}

        <div>
          <p className="mb-2 border-b-2 border-orange-500 pb-1 text-xs font-bold uppercase tracking-widest text-orange-400">Contact</p>
          <div className="space-y-2">
            {contact.map(({ icon: Icon, value }, i) => (
              <p key={i} className="flex items-start gap-2 text-xs text-neutral-300">
                <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-orange-400" />
                <span className="min-w-0 break-all">{value}</span>
              </p>
            ))}
          </div>
        </div>

        {sidebarOrder.map((section) =>
          section === "Skills" && cv.resolvedSkills.length > 0 ? (
            <div key={section}>
              <p className="mb-2 border-b-2 border-orange-500 pb-1 text-xs font-bold uppercase tracking-widest text-orange-400">Skills</p>
              <ul className="space-y-1.5">
                {cv.resolvedSkills.map((skill) => (
                  <li key={skill} className="flex items-start gap-2 text-xs text-neutral-300">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" /> <span className="min-w-0 break-words">{skill}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : section === "Languages" && cv.resolvedLanguages.length > 0 ? (
            <div key={section}>
              <p className="mb-2 border-b-2 border-orange-500 pb-1 text-xs font-bold uppercase tracking-widest text-orange-400">Languages</p>
              <ul className="space-y-1.5">
                {cv.resolvedLanguages.map((l, i) => (
                  <li key={i} className="break-words text-xs text-neutral-300">
                    {l.languageName} <span className="text-orange-400">— {l.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null,
        )}
      </div>

      <div className="min-w-0 p-6">
        <h1 className="break-words text-3xl font-black text-neutral-900">{cv.fullName}</h1>
        {cv.headline && <p className="mt-1 break-words text-sm font-semibold uppercase tracking-wide text-orange-600">{cv.headline}</p>}

        <div className="mt-5 space-y-5">
          {sections.map((section) => (
            <CompactSection key={section} section={section} cv={cv} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CompactSection({ section, cv }: { section: string; cv: CvTemplateProps["cv"] }) {
  const header = (label: string) => (
    <h2 className="mb-2.5 inline-block rounded bg-orange-500 px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white">
      {label}
    </h2>
  );

  if (section === "Summary" && cv.summary) {
    return (
      <div>
        {header("Profile")}
        <p className="whitespace-pre-wrap break-words text-justify text-sm leading-relaxed text-slate-600">{cv.summary}</p>
      </div>
    );
  }

  if (section === "Experience" && cv.resolvedExperience.length > 0) {
    return (
      <div>
        {header("Experience")}
        <div className="space-y-3">
          {cv.resolvedExperience.map((e, i) => (
            <div key={i} className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="min-w-0 break-words text-sm font-bold text-neutral-900">{e.jobTitle}</p>
                <p className="shrink-0 text-xs text-slate-500">
                  {formatDate(e.startDate, "MMM yyyy")} – {e.isCurrent ? "Present" : formatDate(e.endDate, "MMM yyyy")}
                </p>
              </div>
              <p className="break-words text-xs text-slate-500">{e.companyName}</p>
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
        {header("Education")}
        <div className="space-y-2">
          {cv.resolvedEducation.map((e, i) => (
            <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
              <p className="min-w-0 break-words text-sm font-bold text-neutral-900">
                {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ""} <span className="font-normal text-slate-500">— {e.institution}</span>
              </p>
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
        {header("Certifications")}
        <ul className="space-y-1">
          {cv.resolvedCertifications.map((c, i) => (
            <li key={i} className="break-words text-sm text-slate-600">{c.name}{c.issuingOrg ? ` — ${c.issuingOrg}` : ""}</li>
          ))}
        </ul>
      </div>
    );
  }

  if (section === "Projects" && cv.resolvedProjects.length > 0) {
    return (
      <div>
        {header("Projects")}
        <div className="space-y-3">
          {cv.resolvedProjects.map((p, i) => (
            <div key={i} className="min-w-0">
              <p className="break-words text-sm font-bold text-neutral-900">{p.title}</p>
              {p.description && <p className="mt-1 whitespace-pre-wrap break-words text-justify text-sm text-slate-600">{p.description}</p>}
              {p.projectUrl && (
                <a href={p.projectUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex min-w-0 items-center gap-1 break-all text-xs font-medium text-orange-600 hover:underline">
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
