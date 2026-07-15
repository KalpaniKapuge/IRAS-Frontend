import { useState } from "react";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useCandidateProfileStore } from "../store";
import type { EducationDto, EducationFormValues } from "../types";

const emptyForm: EducationFormValues = {
  degree: "",
  institution: "",
  fieldOfStudy: "",
  startYear: null,
  endYear: null,
  grade: "",
};

export function EducationSection({ candidateId, educations }: { candidateId: number; educations: EducationDto[] }) {
  const addEducation = useCandidateProfileStore((s) => s.addEducation);
  const updateEducation = useCandidateProfileStore((s) => s.updateEducation);
  const deleteEducation = useCandidateProfileStore((s) => s.deleteEducation);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<EducationFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (edu: EducationDto) => {
    setEditingId(edu.educationId);
    setForm(edu);
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) await updateEducation(candidateId, editingId, form);
      else await addEducation(candidateId, form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Education</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit education" : "Add education"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Degree</Label>
                <Input value={form.degree} onChange={(e) => setForm({ ...form, degree: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Institution</Label>
                <Input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Field of study</Label>
                <Input
                  value={form.fieldOfStudy ?? ""}
                  onChange={(e) => setForm({ ...form, fieldOfStudy: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Start year</Label>
                  <Input
                    type="number"
                    value={form.startYear ?? ""}
                    onChange={(e) => setForm({ ...form, startYear: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End year</Label>
                  <Input
                    type="number"
                    value={form.endYear ?? ""}
                    onChange={(e) => setForm({ ...form, endYear: e.target.value ? Number(e.target.value) : null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Input value={form.grade ?? ""} onChange={(e) => setForm({ ...form, grade: e.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={saving} disabled={!form.degree || !form.institution}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {educations.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No education added yet" className="py-8" />
        ) : (
          <ul className="space-y-3">
            {educations.map((edu) => (
              <li key={edu.educationId} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                <div>
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.institution}
                    {edu.fieldOfStudy ? ` · ${edu.fieldOfStudy}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {edu.startYear ?? "—"} – {edu.endYear ?? "Present"}
                    {edu.grade ? ` · Grade: ${edu.grade}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(edu)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Remove this education record?"
                    description="This action cannot be undone."
                    variant="destructive"
                    confirmLabel="Remove"
                    onConfirm={() => deleteEducation(candidateId, edu.educationId)}
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
