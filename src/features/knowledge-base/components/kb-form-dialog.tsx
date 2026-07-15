import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { knowledgeBaseApi } from "../api";
import type { KnowledgeBaseDto } from "../types";

export function KbFormDialog({ entry, onSaved }: { entry?: KnowledgeBaseDto; onSaved: () => void }) {
  const isEditing = !!entry;
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(entry?.title ?? "");
  const [content, setContent] = useState(entry?.content ?? "");
  const [category, setCategory] = useState<KnowledgeCategory>(entry?.category ?? "FAQ");
  const [isActive, setIsActive] = useState(entry?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(entry?.title ?? "");
      setContent(entry?.content ?? "");
      setCategory(entry?.category ?? "FAQ");
      setIsActive(entry?.isActive ?? true);
    }
  }, [open, entry]);

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = { title, content, category, isActive };
      if (isEditing) await knowledgeBaseApi.update(entry.kbId, payload);
      else await knowledgeBaseApi.create(payload);
      toast.success(isEditing ? "Entry updated." : "Entry created.");
      setOpen(false);
      onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save entry.");
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
          <Button size="sm"><Plus className="h-4 w-4" /> New entry</Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit knowledge base entry" : "New knowledge base entry"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. How is my application score calculated?" />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as KnowledgeCategory)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {KNOWLEDGE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{titleCase(cat)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea rows={6} value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">Active (visible to the chatbot)</span>
            <Switch checked={isActive} onCheckedChange={setIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isSaving} disabled={!title.trim() || !content.trim()}>
            {isEditing ? "Save changes" : "Create entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
