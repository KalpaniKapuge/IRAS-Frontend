import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { JOB_TEMPLATE_KEYS, type JobTemplateKey } from "../types";

const TEMPLATE_META: Record<JobTemplateKey, { label: string; description: string; swatch: string }> = {
  modern: {
    label: "Modern",
    description: "Gradient hero header with icon-led highlights.",
    swatch: "bg-gradient-to-br from-primary to-chart-2",
  },
  classic: {
    label: "Classic",
    description: "Letterhead style — clean, traditional, professional.",
    swatch: "bg-muted border border-border",
  },
  bold: {
    label: "Bold",
    description: "Large typography with strong color accents.",
    swatch: "bg-chart-3",
  },
};

export function TemplatePicker({
  value,
  onChange,
}: {
  value: JobTemplateKey | null;
  onChange: (key: JobTemplateKey) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {JOB_TEMPLATE_KEYS.map((key) => {
        const meta = TEMPLATE_META[key];
        const selected = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
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
            <div className={cn("h-10 w-full rounded-md", meta.swatch)} />
            <div>
              <p className="text-sm font-semibold text-foreground">{meta.label}</p>
              <p className="text-xs text-muted-foreground">{meta.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
