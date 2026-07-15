import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";
import { useResumeStore } from "../store";

const ACCEPTED = [".pdf", ".docx"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

export function ResumeUploadDropzone() {
  const upload = useResumeStore((s) => s.upload);
  const isUploading = useResumeStore((s) => s.isUploading);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED.includes(ext)) {
      toast.error("Only PDF and DOCX files are supported.");
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File exceeds the 10 MB limit.");
      return;
    }
    upload(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
        isUploading && "pointer-events-none opacity-70",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {isUploading ? (
        <>
          <Spinner className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">Uploading and analyzing your resume…</p>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">Drag & drop your resume, or click to browse</p>
            <p className="mt-1 text-xs text-muted-foreground">PDF or DOCX, up to 10 MB · up to 5 resumes</p>
          </div>
        </>
      )}
    </div>
  );
}
