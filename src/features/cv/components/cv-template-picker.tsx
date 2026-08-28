import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { CV_TEMPLATE_ACCENT } from "./templates";
import type { CvTemplateDto } from "../types";

export function CvTemplatePicker({
  templates,
  value,
  onChange,
}: {
  templates: CvTemplateDto[];
  value: string;
  onChange: (name: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {templates.map((template) => {
        const selected = value === template.name;
        return (
          <button
            key={template.name}
            type="button"
            onClick={() => onChange(template.name)}
            className={cn(
              "relative flex flex-col gap-2 rounded-lg border p-3 text-left transition-colors",
              selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
            )}
          >
            {selected && (
              <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Check className="h-3 w-3" />
              </span>
            )}
            <div
              className={cn(
                "h-16 w-full rounded-md",
                CV_TEMPLATE_ACCENT[template.name] ?? "bg-muted",
              )}
            />
            <div>
              <p className="text-sm font-semibold text-foreground">{template.name}</p>
              <p className="text-xs text-muted-foreground">{template.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
