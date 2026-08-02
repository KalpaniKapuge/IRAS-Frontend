import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useCvStore } from "../store";

export function CvFormDialog() {
  const { templates, loadTemplates, create, isSaving } = useCvStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [templateName, setTemplateName] = useState("");

  useEffect(() => {
    if (open) {
      loadTemplates();
      setTitle("");
    }
  }, [open, loadTemplates]);

  useEffect(() => {
    if (templates.length > 0 && !templateName) setTemplateName(templates[0].name);
  }, [templates, templateName]);

  const handleCreate = async () => {
    const cv = await create({ title: title.trim(), templateName });
    if (cv) {
      setOpen(false);
      navigate(`/candidate/cvs/${cv.cvId}`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New CV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new CV</DialogTitle>
          <DialogDescription>Choose a template and give it a name — you can customize everything after.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>CV title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer CV" />
          </div>
          <div className="space-y-2">
            <Label>Template</Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {templates.map((template) => (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => setTemplateName(template.name)}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-colors",
                    templateName === template.name ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40",
                  )}
                >
                  <p className="text-sm font-medium">{template.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{template.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} loading={isSaving} disabled={!title.trim() || !templateName}>
            Create CV
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
