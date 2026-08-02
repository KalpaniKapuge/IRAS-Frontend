import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { FileText } from "lucide-react";
import type { CvItemDto, CvReferenceType } from "../types";

interface SectionItemsEditorProps {
  referenceType: CvReferenceType;
  items: CvItemDto[];
  onSave: (referenceType: CvReferenceType, orderedIncludedIds: number[]) => void;
  isSaving: boolean;
}

export function SectionItemsEditor({ referenceType, items, onSave, isSaving }: SectionItemsEditorProps) {
  const [local, setLocal] = useState<CvItemDto[]>(items);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLocal(items);
    setDirty(false);
  }, [items]);

  if (items.length === 0) {
    return <EmptyState icon={FileText} title="Nothing here yet" description="Add this to your profile first." className="py-6" />;
  }

  const toggle = (referenceId: number) => {
    setLocal((prev) => prev.map((i) => (i.referenceId === referenceId ? { ...i, included: !i.included } : i)));
    setDirty(true);
  };

  const move = (index: number, direction: -1 | 1) => {
    setLocal((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const handleSave = () => {
    const orderedIncludedIds = local.filter((i) => i.included).map((i) => i.referenceId);
    onSave(referenceType, orderedIncludedIds);
    setDirty(false);
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {local.map((item, index) => (
          <li key={item.referenceId} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
            <label className="flex min-w-0 flex-1 items-center gap-2.5 text-sm">
              <Checkbox checked={item.included} onCheckedChange={() => toggle(item.referenceId)} />
              <span className={item.included ? "truncate" : "truncate text-muted-foreground"}>{item.label}</span>
            </label>
            <div className="flex shrink-0 items-center gap-0.5">
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === 0} onClick={() => move(index, -1)}>
                <ChevronUp className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" disabled={index === local.length - 1} onClick={() => move(index, 1)}>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </div>
          </li>
        ))}
      </ul>
      {dirty && (
        <Button size="sm" onClick={handleSave} loading={isSaving}>
          Save selection
        </Button>
      )}
    </div>
  );
}
