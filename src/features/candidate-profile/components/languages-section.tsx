import { useState } from "react";
import { Languages as LanguagesIcon, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useCandidateProfileStore } from "../store";
import type { LanguageDto, LanguageFormValues } from "../types";

const emptyForm: LanguageFormValues = {
  languageName: "",
  proficiency: "",
};

export function LanguagesSection({ candidateId, languages }: { candidateId: number; languages: LanguageDto[] }) {
  const addLanguage = useCandidateProfileStore((s) => s.addLanguage);
  const updateLanguage = useCandidateProfileStore((s) => s.updateLanguage);
  const deleteLanguage = useCandidateProfileStore((s) => s.deleteLanguage);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<LanguageFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (lang: LanguageDto) => {
    setEditingId(lang.languageId);
    setForm(lang);
    setOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      if (editingId) await updateLanguage(candidateId, editingId, form);
      else await addLanguage(candidateId, form);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Languages</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit language" : "Add language"}</DialogTitle>
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
                <Label>Language</Label>
                <Input
                  value={form.languageName}
                  onChange={(e) => setForm({ ...form, languageName: e.target.value })}
                  placeholder="e.g. Spanish"
                />
              </div>
              <div className="space-y-2">
                <Label>Proficiency</Label>
                <Input
                  value={form.proficiency}
                  onChange={(e) => setForm({ ...form, proficiency: e.target.value })}
                  placeholder="e.g. Fluent, Native, B2"
                />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} disabled={!form.languageName.trim() || !form.proficiency.trim()}>
                  Save
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {languages.length === 0 ? (
          <EmptyState icon={LanguagesIcon} title="No languages added yet" className="py-8" />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {languages.map((lang) => (
              <li
                key={lang.languageId}
                className="group flex items-center gap-2 rounded-full border border-border bg-card py-1.5 pl-3 pr-1.5 text-sm shadow-soft"
              >
                <span className="font-medium">{lang.languageName}</span>
                <span className="text-xs text-muted-foreground">{lang.proficiency}</span>
                <button type="button" className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" onClick={() => openEdit(lang)} aria-label={`Edit ${lang.languageName}`}>
                  <Pencil className="h-3 w-3" />
                </button>
                <ConfirmAction
                  trigger={
                    <button type="button" className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label={`Remove ${lang.languageName}`}>
                      <Trash2 className="h-3 w-3" />
                    </button>
                  }
                  title="Remove this language?"
                  description="This action cannot be undone."
                  variant="destructive"
                  confirmLabel="Remove"
                  onConfirm={() => deleteLanguage(candidateId, lang.languageId)}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
