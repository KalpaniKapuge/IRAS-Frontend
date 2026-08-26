import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { SKILL_RESOURCE_TYPES, type SkillResourceType } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { SkillPicker } from "@/features/skill-taxonomy/components/skill-picker";
import { skillResourcesApi } from "../api";
import type { SkillResourceDto } from "../types";

export function ResourceFormDialog({ resource, onSaved }: { resource?: SkillResourceDto; onSaved: () => void }) {
  const isEditing = !!resource;
  const [open, setOpen] = useState(false);
  const [skillId, setSkillId] = useState<number | null>(resource?.skillId ?? null);
  const [skillName, setSkillName] = useState(resource?.skillName ?? "");
  const [title, setTitle] = useState(resource?.title ?? "");
  const [url, setUrl] = useState(resource?.url ?? "");
  const [resourceType, setResourceType] = useState<SkillResourceType>(resource?.resourceType ?? "Course");
  const [provider, setProvider] = useState(resource?.provider ?? "");
  const [isActive, setIsActive] = useState(resource?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setSkillId(resource?.skillId ?? null);
      setSkillName(resource?.skillName ?? "");
      setTitle(resource?.title ?? "");
      setUrl(resource?.url ?? "");
      setResourceType(resource?.resourceType ?? "Course");
      setProvider(resource?.provider ?? "");
      setIsActive(resource?.isActive ?? true);
    }
  }, [open, resource]);

  const handleSubmit = async () => {
    if (!skillId) return;
    setIsSaving(true);
    try {
      const payload = { skillId, title, url, resourceType, provider: provider.trim() || null, isActive };
      if (isEditing) await skillResourcesApi.update(resource.resourceId, payload);
      else await skillResourcesApi.create(payload);
      toast.success(isEditing ? "Resource updated." : "Resource created.");
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save resource.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="sm">Edit</Button>
        ) : (
          <Button size="sm"><Plus className="h-4 w-4" /> New resource</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit skill resource" : "New skill resource"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Skill</Label>
            {skillId ? (
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                <span className="text-sm font-medium">{skillName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSkillId(null);
                    setSkillName("");
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <SkillPicker
                onSelect={(skill) => {
                  setSkillId(skill.skillId);
                  setSkillName(skill.skillName);
                }}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Docker for Beginners" />
          </div>
          <div className="space-y-2">
            <Label>URL</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={resourceType} onValueChange={(v) => setResourceType(v as SkillResourceType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SKILL_RESOURCE_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Provider (optional)</Label>
              <Input value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. freeCodeCamp" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">Active (visible to candidates)</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!skillId || !title.trim() || !url.trim()}>
            {isEditing ? "Save changes" : "Create resource"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
