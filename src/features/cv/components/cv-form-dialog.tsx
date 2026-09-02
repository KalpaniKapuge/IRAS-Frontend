import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Camera, Plus, User } from "lucide-react";
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
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useCvStore } from "../store";
import { CvTemplatePicker } from "./cv-template-picker";

const CV_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CV_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export function CvFormDialog() {
  const { templates, loadTemplates, create, uploadPhoto, isSaving } = useCvStore();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  useEffect(() => {
    if (open) {
      loadTemplates();
      setTitle("");
      setPhotoFile(null);
      setPhotoPreviewUrl(null);
    }
  }, [open, loadTemplates]);

  useEffect(() => {
    if (templates.length > 0 && !templateName) setTemplateName(templates[0].name);
  }, [templates, templateName]);

  // Revoke the local preview URL whenever it's replaced or the dialog closes, so we
  // don't leak object URLs across create attempts.
  useEffect(() => {
    return () => {
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    };
  }, [photoPreviewUrl]);

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!CV_PHOTO_TYPES.includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > CV_PHOTO_MAX_BYTES) {
      toast.error("CV photo must be 2 MB or smaller.");
      return;
    }
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreate = async () => {
    const cv = await create({ title: title.trim(), templateName });
    if (!cv) return;
    if (photoFile) await uploadPhoto(cv.cvId, photoFile);
    setOpen(false);
    navigate(`/candidate/cvs/${cv.cvId}`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" /> New CV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create a new CV</DialogTitle>
          <DialogDescription>Choose a template, add a photo, and give it a name — you can customize everything after.</DialogDescription>
        </DialogHeader>
        <form
          ref={ref}
          onKeyDownCapture={onKeyDown} onFocus={onFocus}
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
          noValidate
          className="space-y-4"
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                {photoPreviewUrl ? (
                  <img src={photoPreviewUrl} alt="CV photo preview" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <input ref={fileInputRef} type="file" accept={CV_PHOTO_TYPES.join(",")} className="hidden" onChange={handlePhotoChange} />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border border-background shadow-soft"
                aria-label="Add CV photo"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="h-3 w-3" />
              </Button>
            </div>
            <div className="space-y-2 flex-1">
              <Label>CV title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Backend Engineer CV" maxLength={150} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Template</Label>
            <CvTemplatePicker templates={templates} value={templateName} onChange={setTemplateName} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isSaving} disabled={!title.trim() || !templateName}>
              Create CV
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
