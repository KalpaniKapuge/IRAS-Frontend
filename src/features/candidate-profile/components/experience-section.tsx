import { useState } from "react";
import { Briefcase, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { useCandidateProfileStore } from "../store";
import type { WorkExperienceDto, WorkExperienceFormValues } from "../types";

const emptyForm: WorkExperienceFormValues = {
  companyName: "",
  jobTitle: "",
  startDate: "",
  endDate: null,
  isCurrent: false,
  description: "",
};

function toDateInputValue(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ExperienceSection({
  candidateId,
  experiences,
}: {
  candidateId: number;
  experiences: WorkExperienceDto[];
}) {
  const addExperience = useCandidateProfileStore((s) => s.addExperience);
  const updateExperience = useCandidateProfileStore((s) => s.updateExperience);
  const deleteExperience = useCandidateProfileStore((s) => s.deleteExperience);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<WorkExperienceFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (exp: WorkExperienceDto) => {
    setEditingId(exp.experienceId);
    setForm(exp);
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const payload: WorkExperienceFormValues = {
        ...form,
        endDate: form.isCurrent ? null : form.endDate,
      };
      if (editingId) await updateExperience(candidateId, editingId, payload);
      else await addExperience(candidateId, payload);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Work Experience</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit experience" : "Add experience"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Job title</Label>
                  <Input value={form.jobTitle} onChange={(e) => setForm({ ...form, jobTitle: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={toDateInputValue(form.startDate)}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    disabled={form.isCurrent}
                    value={toDateInputValue(form.endDate)}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={form.isCurrent}
                  onCheckedChange={(checked) => setForm({ ...form, isCurrent: checked === true })}
                />
                I currently work here
              </label>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={4}
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Key responsibilities and achievements…"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                loading={saving}
                disabled={!form.jobTitle || !form.companyName || !form.startDate}
              >
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {experiences.length === 0 ? (
          <EmptyState icon={Briefcase} title="No work experience added yet" className="py-8" />
        ) : (
          <ul className="space-y-3">
            {experiences.map((exp) => (
              <li key={exp.experienceId} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">{exp.jobTitle}</p>
                  <p className="text-sm text-muted-foreground">{exp.companyName}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(exp.startDate, "MMM yyyy")} – {exp.isCurrent ? "Present" : formatDate(exp.endDate, "MMM yyyy")}
                  </p>
                  {exp.description && <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{exp.description}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(exp)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Remove this work experience?"
                    description="This will also recalculate your total years of experience."
                    variant="destructive"
                    confirmLabel="Remove"
                    onConfirm={() => deleteExperience(candidateId, exp.experienceId)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
