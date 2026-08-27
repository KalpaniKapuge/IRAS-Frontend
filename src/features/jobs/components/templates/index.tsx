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
  classic: { border: "border-t-muted-foreground/40", bar: "bg-muted-foreground/40" },
  bold: { border: "border-t-chart-3", bar: "bg-chart-3" },
};

export type { JobTemplateProps } from "./types";
