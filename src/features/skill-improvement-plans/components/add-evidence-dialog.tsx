import { useState } from "react";
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
import { LINK_EVIDENCE_TYPES, SKILL_EVIDENCE_TYPES, type SkillEvidenceType } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { skillImprovementPlansApi } from "../api";

const isLinkType = (type: SkillEvidenceType) => (LINK_EVIDENCE_TYPES as readonly string[]).includes(type);

export function AddEvidenceDialog({
  candidateId,
  planId,
  onAdded,
}: {
  candidateId: number;
  planId: number;
  onAdded: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [evidenceType, setEvidenceType] = useState<SkillEvidenceType>("GitHub");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const reset = () => {
    setEvidenceType("GitHub");
    setUrl("");
    setFile(null);
    setNotes("");
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      if (isLinkType(evidenceType)) {
        await skillImprovementPlansApi.addEvidenceLink(candidateId, planId, {
          evidenceType,
          evidenceUrl: url.trim(),
          notes: notes.trim() || undefined,
        });
      } else {
        if (!file) return;
        await skillImprovementPlansApi.addEvidenceFile(candidateId, planId, evidenceType, notes.trim() || undefined, file);
      }
      toast.success("Evidence submitted for review.");
      setOpen(false);
      reset();
      onAdded();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to submit evidence.");
    } finally {
      setIsSaving(false);
    }
  };

  const canSubmit = isLinkType(evidenceType) ? url.trim().length > 0 : file !== null;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="h-4 w-4" /> Add Evidence</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submit evidence</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select value={evidenceType} onValueChange={(v) => setEvidenceType(v as SkillEvidenceType)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {SKILL_EVIDENCE_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>{titleCase(t)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLinkType(evidenceType) ? (
            <div className="space-y-2">
              <Label>URL</Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://github.com/you/project" />
            </div>
          ) : (
            <div className="space-y-2">
              <Label>File</Label>
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.zip"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Notes (optional)</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="What does this prove?" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!canSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
