import { useState } from "react";
import { toast } from "sonner";
import { Plus, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApiError } from "@/types/common";
import { skillTaxonomyApi } from "../api";
import type { SkillDto } from "../types";

export function AliasManagerDialog({ skill, onChanged }: { skill: SkillDto; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [aliasText, setAliasText] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    if (!aliasText.trim()) return;
    setIsSaving(true);
    try {
      await skillTaxonomyApi.addAlias(skill.skillId, aliasText.trim());
      setAliasText("");
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add alias.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (aliasId: number) => {
    try {
      await skillTaxonomyApi.deleteAlias(skill.skillId, aliasId);
      onChanged();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to remove alias.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Tags className="h-3.5 w-3.5" /> Aliases ({skill.aliases.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aliases for {skill.skillName}</DialogTitle>
          <DialogDescription>Aliases let resume parsing and search match alternate names (e.g. "JS" → "JavaScript").</DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {skill.aliases.length === 0 && <p className="text-sm text-muted-foreground">No aliases yet.</p>}
          {skill.aliases.map((alias) => (
            <Badge key={alias.aliasId} variant="outline" className="gap-1.5 py-1 pl-2.5">
              {alias.aliasText}
              <button onClick={() => handleDelete(alias.aliasId)} className="rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            value={aliasText}
            onChange={(e) => setAliasText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="New alias…"
          />
          <Button onClick={handleAdd} loading={isSaving} disabled={!aliasText.trim()}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
