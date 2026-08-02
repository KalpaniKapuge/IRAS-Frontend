import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CV_SECTION_TYPES, type CvSectionType } from "../types";

interface SectionOrderEditorProps {
  value: CvSectionType[];
  onChange: (next: CvSectionType[]) => void;
}

export function SectionOrderEditor({ value, onChange }: SectionOrderEditorProps) {
  const available = CV_SECTION_TYPES.filter((s) => !value.includes(s));

  const move = (index: number, direction: -1 | 1) => {
    const next = [...value];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const remove = (section: CvSectionType) => onChange(value.filter((s) => s !== section));
  const add = (section: string) => onChange([...value, section as CvSectionType]);

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Add at least one section to include on your CV.
        </p>
      ) : (
        <ol className="space-y-2">
          {value.map((section, index) => (
            <li key={section} className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
              <span className="text-sm font-medium">{section}</span>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => move(index, -1)}>
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === value.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => remove(section)}>
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ol>
      )}

      {available.length > 0 && (
        <Select onValueChange={add} value="">
          <SelectTrigger className="w-56">
            <span className="flex items-center gap-1.5 text-muted-foreground"><Plus className="h-3.5 w-3.5" /> <SelectValue placeholder="Add a section" /></span>
          </SelectTrigger>
          <SelectContent>
            {available.map((section) => (
              <SelectItem key={section} value={section}>{section}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
