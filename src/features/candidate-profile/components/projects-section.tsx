import { useState } from "react";
import { ExternalLink, FolderKanban, Pencil, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { FieldError } from "@/components/shared/field-error";
import { formatDate } from "@/lib/format";
import { isValidUrl } from "@/lib/validation";
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useCandidateProfileStore } from "../store";
import type { ProjectDto, ProjectFormValues } from "../types";

const emptyForm: ProjectFormValues = {
  title: "",
  description: "",
  projectUrl: "",
  startDate: null,
  endDate: null,
};

function toDateInputValue(iso?: string | null) {
  if (!iso) return "";
  return iso.slice(0, 10);
}

export function ProjectsSection({ candidateId, projects }: { candidateId: number; projects: ProjectDto[] }) {
  const addProject = useCandidateProfileStore((s) => s.addProject);
  const updateProject = useCandidateProfileStore((s) => s.updateProject);
  const deleteProject = useCandidateProfileStore((s) => s.deleteProject);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProjectFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ projectUrl?: string; dates?: string }>({});
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (project: ProjectDto) => {
    setEditingId(project.projectId);
    setForm(project);
    setOpen(true);
  };

  const handleSubmit = async () => {
    const errors: { projectUrl?: string; dates?: string } = {};
    if (!isValidUrl(form.projectUrl ?? "")) errors.projectUrl = "Enter a valid URL (e.g. https://github.com/you/project).";
    if (form.startDate && form.endDate && form.endDate < form.startDate) {
      errors.dates = "End date can't be before the start date.";
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      // The backend validates projectUrl with [Url], which (unlike a plain optional
      // string) only skips validation for a literal null — an empty string fails it
      // outright. Normalize blank optional fields to null before sending.
      const payload: ProjectFormValues = {
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || null,
        projectUrl: form.projectUrl?.trim() || null,
      };
      if (editingId) await updateProject(candidateId, editingId, payload);
      else await addProject(candidateId, payload);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Projects</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit project" : "Add project"}</DialogTitle>
            </DialogHeader>
            <form
              ref={ref}
              onKeyDownCapture={onKeyDown} onFocus={onFocus}
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              noValidate
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. E-commerce Analytics Dashboard" maxLength={150} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  rows={3}
                  value={form.description ?? ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="What did you build, and what was your role?"
                />
              </div>
              <div className="space-y-2">
                <Label>Project URL (optional)</Label>
                <Input
                  type="url"
                  value={form.projectUrl ?? ""}
                  onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                  placeholder="https://…"
                  aria-invalid={!!fieldErrors.projectUrl}
                  className={fieldErrors.projectUrl ? "border-destructive focus-visible:ring-destructive" : undefined}
                />
                <FieldError message={fieldErrors.projectUrl} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <Input
                    type="date"
                    value={toDateInputValue(form.startDate)}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value || null })}
                    aria-invalid={!!fieldErrors.dates}
                    className={fieldErrors.dates ? "border-destructive focus-visible:ring-destructive" : undefined}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End date</Label>
                  <Input
                    type="date"
                    value={toDateInputValue(form.endDate)}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value || null })}
                    aria-invalid={!!fieldErrors.dates}
                    className={fieldErrors.dates ? "border-destructive focus-visible:ring-destructive" : undefined}
                  />
                </div>
              </div>
              <FieldError message={fieldErrors.dates} />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} disabled={!form.title.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState icon={FolderKanban} title="No projects added yet" className="py-8" />
        ) : (
          <ul className="space-y-3">
            {projects.map((project) => (
              <li key={project.projectId} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="font-medium">{project.title}</p>
                  {project.description && <p className="mt-1 whitespace-pre-wrap text-sm text-foreground/80">{project.description}</p>}
                  {(project.startDate || project.endDate) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDate(project.startDate, "MMM yyyy")} – {formatDate(project.endDate, "MMM yyyy") || "Present"}
                    </p>
                  )}
                  {project.projectUrl && (
                    <a
                      href={project.projectUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{project.projectUrl}</span>
                    </a>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(project)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Remove this project?"
                    description="This action cannot be undone."
                    variant="destructive"
                    confirmLabel="Remove"
                    onConfirm={() => deleteProject(candidateId, project.projectId)}
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
