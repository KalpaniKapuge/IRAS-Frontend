import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ApiError } from "@/types/common";
import { SKILL_CATEGORIES, type SkillCategory } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { skillTaxonomyApi } from "../api";
import type { SkillDto } from "../types";

interface SkillFormDialogProps {
  skill?: SkillDto;
  onSaved: () => void;
  trigger?: React.ReactNode;
}

export function SkillFormDialog({ skill, onSaved, trigger }: SkillFormDialogProps) {
  const isEditing = !!skill;
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(skill?.skillName ?? "");
  const [category, setCategory] = useState<SkillCategory>(skill?.category ?? "ProgrammingLanguage");
  const [description, setDescription] = useState(skill?.description ?? "");
  const [aliasText, setAliasText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName(skill?.skillName ?? "");
      setCategory(skill?.category ?? "ProgrammingLanguage");
      setDescription(skill?.description ?? "");
      setAliasText("");
    }
  }, [open, skill]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      if (isEditing) {
        await skillTaxonomyApi.update(skill.skillId, { skillName: name, category, description: description || undefined });
      } else {
        await skillTaxonomyApi.create({
          skillName: name,
          category,
          description: description || undefined,
          aliases: aliasText
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        });
      }
      toast.success(isEditing ? "Skill updated." : "Skill created.");
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save skill.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button size="sm">
            <Plus className="h-4 w-4" /> Add skill
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit skill" : "Add skill"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Skill name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ASP.NET Core" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as SkillCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKILL_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{titleCase(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          {!isEditing && (
            <div className="space-y-2">
              <Label>Initial aliases (optional, comma-separated)</Label>
              <Input value={aliasText} onChange={(e) => setAliasText(e.target.value)} placeholder="e.g. JS, ECMAScript" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!name.trim()}>
            {isEditing ? "Save changes" : "Create skill"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
