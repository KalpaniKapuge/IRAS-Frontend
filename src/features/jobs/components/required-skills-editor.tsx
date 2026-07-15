import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SkillPicker } from "@/features/skill-taxonomy/components/skill-picker";
import type { SkillDto } from "@/features/skill-taxonomy/types";
import { IMPORTANCE_LEVELS, type ImportanceLevel } from "@/types/enums";
import type { JobRequiredSkillDto } from "../types";

interface RequiredSkillsEditorProps {
  value: JobRequiredSkillDto[];
  onChange: (skills: JobRequiredSkillDto[]) => void;
}

export function RequiredSkillsEditor({ value, onChange }: RequiredSkillsEditorProps) {
  const addSkill = (skill: SkillDto) => {
    onChange([
      ...value,
      { skillId: skill.skillId, skillName: skill.skillName, importance: "MustHave", minYears: 0 },
    ]);
  };

  const updateSkill = (skillId: number, patch: Partial<JobRequiredSkillDto>) => {
    onChange(value.map((s) => (s.skillId === skillId ? { ...s, ...patch } : s)));
  };

  const removeSkill = (skillId: number) => {
    onChange(value.filter((s) => s.skillId !== skillId));
  };

  return (
    <div className="space-y-3">
      <SkillPicker onSelect={addSkill} excludeIds={value.map((s) => s.skillId)} placeholder="Search and add required skills…" />

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Add at least one must-have skill before publishing.
        </p>
      ) : (
        <div className="space-y-2">
          {value.map((skill) => (
            <div key={skill.skillId} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
              <Badge variant="outline" className="text-sm">{skill.skillName ?? `Skill #${skill.skillId}`}</Badge>
              <Select
                value={skill.importance}
                onValueChange={(v) => updateSkill(skill.skillId, { importance: v as ImportanceLevel })}
              >
                <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMPORTANCE_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level === "MustHave" ? "Must-have" : "Nice-to-have"}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Input
                  type="number"
                  min={0}
                  className="h-8 w-16"
                  value={skill.minYears}
                  onChange={(e) => updateSkill(skill.skillId, { minYears: Number(e.target.value) || 0 })}
                />
                yrs min
              </div>
              <button
                onClick={() => removeSkill(skill.skillId)}
                className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Remove ${skill.skillName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
