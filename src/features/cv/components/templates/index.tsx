import type { ComponentType } from "react";
import { ModernCvTemplate } from "./modern-template";
import { CompactCvTemplate } from "./compact-template";
import { ClassicCvTemplate } from "./classic-template";
import type { CvTemplateProps } from "./types";

export const CV_TEMPLATES: Record<string, ComponentType<CvTemplateProps>> = {
  Modern: ModernCvTemplate,
  Compact: CompactCvTemplate,
  Classic: ClassicCvTemplate,
};

export const CV_TEMPLATE_ACCENT: Record<string, string> = {
  Modern: "bg-gradient-to-br from-teal-900 to-amber-400",
  Compact: "bg-gradient-to-br from-neutral-900 to-orange-500",
  Classic: "bg-gradient-to-br from-slate-800 to-slate-400",
};

export function resolveCvTemplate(templateName: string): ComponentType<CvTemplateProps> {
  return CV_TEMPLATES[templateName] ?? ClassicCvTemplate;
}

export type { CvTemplateProps } from "./types";
