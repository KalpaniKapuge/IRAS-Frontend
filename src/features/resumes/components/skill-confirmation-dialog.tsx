import { useState } from "react";
import { Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "../store";

export function SkillConfirmationDialog() {
  const pendingParseResult = useResumeStore((s) => s.pendingParseResult);
  const confirmSkills = useResumeStore((s) => s.confirmSkills);
  const dismissParseResult = useResumeStore((s) => s.dismissParseResult);

  const [selected, setSelected] = useState<Set<number>>(new Set());

  if (!pendingParseResult) return null;
  const newSkills = pendingParseResult.suggestedSkills.filter((s) => !s.alreadyOnProfile);

  const toggle = (skillId: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(skillId) ? next.delete(skillId) : next.add(skillId);
      return next;
    });
  };

  const handleConfirm = () => {
    confirmSkills(pendingParseResult.resumeId, Array.from(selected));
    setSelected(new Set());
  };

  return (
    <Dialog open onOpenChange={(open) => !open && dismissParseResult()}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <DialogTitle>We found skills in your resume</DialogTitle>
          <DialogDescription>
            Select the skills detected below to add them to your profile. You can edit proficiency later.
          </DialogDescription>
        </DialogHeader>

        {newSkills.length === 0 ? (
          <p className="py-4 text-sm text-muted-foreground">
            All detected skills are already on your profile — nothing new to confirm.
          </p>
        ) : (
          <div className="max-h-72 space-y-1 overflow-y-auto scrollbar-thin py-2">
            {newSkills.map((skill) => (
              <label
                key={skill.skillId}
                className="flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <Checkbox checked={selected.has(skill.skillId)} onCheckedChange={() => toggle(skill.skillId)} />
                  <div>
                    <p className="text-sm font-medium">{skill.skillName}</p>
                    <p className="text-xs text-muted-foreground">Matched "{skill.matchedText}"</p>
                  </div>
                </div>
                <Badge variant="muted">{skill.occurrences}×</Badge>
              </label>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={dismissParseResult}>
            Skip for now
          </Button>
          <Button onClick={handleConfirm} disabled={selected.size === 0}>
            Add {selected.size > 0 ? selected.size : ""} skill{selected.size === 1 ? "" : "s"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
