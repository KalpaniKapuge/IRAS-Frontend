import { useState } from "react";
import { BadgeCheck, Sparkles, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/shared/empty-state";
import { SkillPicker } from "@/features/skill-taxonomy/components/skill-picker";
import type { SkillDto } from "@/features/skill-taxonomy/types";
import { PROFICIENCY_LEVELS, type ProficiencyLevel } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { useCandidateProfileStore } from "../store";
import type { CandidateSkillDto } from "../types";

export function SkillsSection({ candidateId, skills }: { candidateId: number; skills: CandidateSkillDto[] }) {
  const upsertSkill = useCandidateProfileStore((s) => s.upsertSkill);
  const removeSkill = useCandidateProfileStore((s) => s.removeSkill);

  const [pendingSkill, setPendingSkill] = useState<SkillDto | null>(null);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("Intermediate");
  const [yearsExp, setYearsExp] = useState("1");

  const handlePick = (skill: SkillDto) => {
    setPendingSkill(skill);
    setProficiency("Intermediate");
    setYearsExp("1");
  };

  const handleAdd = async () => {
    if (!pendingSkill) return;
    await upsertSkill(candidateId, { skillId: pendingSkill.skillId, proficiency, yearsExp: Number(yearsExp) || 0 });
    setPendingSkill(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Skills</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3 rounded-lg border border-dashed border-border p-4">
          <SkillPicker onSelect={handlePick} excludeIds={skills.map((s) => s.skillId)} />
          {pendingSkill && (
            <div className="flex flex-wrap items-end gap-3 rounded-lg bg-muted/50 p-3">
              <Badge variant="default" className="h-9 px-3 text-sm">
                {pendingSkill.skillName}
              </Badge>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Proficiency</p>
                <Select value={proficiency} onValueChange={(v) => setProficiency(v as ProficiencyLevel)}>
                  <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROFICIENCY_LEVELS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Years</p>
                <Input
                  type="number"
                  min={0}
                  step={0.5}
                  className="h-9 w-20"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={handleAdd}>Add skill</Button>
              <Button size="sm" variant="ghost" onClick={() => setPendingSkill(null)}>Cancel</Button>
            </div>
          )}
        </div>

        {skills.length === 0 ? (
          <EmptyState icon={Sparkles} title="No skills added yet" description="Upload a resume to auto-detect skills, or add them manually above." className="py-8" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill.skillId}
                className="group flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3 pr-1.5 text-sm shadow-soft"
              >
                {skill.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-success" />}
                <span className="font-medium">{skill.skillName}</span>
                <span className="text-xs text-muted-foreground">
                  {titleCase(skill.proficiency)} · {skill.yearsExp}y
                </span>
                <button
                  onClick={() => removeSkill(candidateId, skill.skillId)}
                  className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                  aria-label={`Remove ${skill.skillName}`}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
