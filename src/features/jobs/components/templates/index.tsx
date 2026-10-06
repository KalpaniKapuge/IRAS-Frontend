import type { ComponentType } from "react";
import type { JobTemplateKey } from "../../types";
import { ModernTemplate } from "./modern-template";
import { ClassicTemplate } from "./classic-template";
import { BoldTemplate } from "./bold-template";
import type { JobTemplateProps } from "./types";

export const JOB_TEMPLATES: Record<JobTemplateKey, ComponentType<JobTemplateProps>> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  bold: BoldTemplate,
};

export const TEMPLATE_ACCENT: Record<JobTemplateKey, { border: string; bar: string }> = {
  modern: { border: "border-t-primary", bar: "bg-gradient-to-r from-primary to-chart-2" },
  classic: { border: "border-t-primary/50", bar: "bg-primary/50" },
  bold: { border: "border-t-info", bar: "bg-gradient-to-r from-primary to-info" },
};

export type { JobTemplateProps } from "./types";
