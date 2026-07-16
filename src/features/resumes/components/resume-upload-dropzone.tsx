import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/shared/loading-state";
import { cn } from "@/lib/utils";
import { useResumeStore } from "../store";
import type { ParseResultDto } from "../types";

const ACCEPTED = [".pdf", ".docx"];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_RESUMES = 5;

interface ResumeUploadDropzoneProps {
  className?: string;
  existingCount?: number;
  onUploaded?: (result: ParseResultDto) => void | Promise<void>;
}

export function ResumeUploadDropzone({ className, existingCount = 0, onUploaded }: ResumeUploadDropzoneProps = {}) {
  const upload = useResumeStore((s) => s.upload);
  const isUploading = useResumeStore((s) => s.isUploading);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLimitReached = existingCount >= MAX_RESUMES;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;

    if (isLimitReached) {
      toast.error("You can keep up to 5 resumes. Delete one before uploading another.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!ACCEPTED.includes(ext)) {
      toast.error("Only PDF and DOCX files are supported.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("File exceeds the 10 MB limit.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    const result = await upload(file);
    if (inputRef.current) inputRef.current.value = "";
    if (result) await onUploaded?.(result);
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
        if (e.dataTransfer.files.length > 1) {
          toast.error("Please upload one resume at a time.");
          return;
        }
        handleFile(e.dataTransfer.files?.[0]);
      }}
      onClick={() => {
        if (isLimitReached) {
          toast.error("You can keep up to 5 resumes. Delete one before uploading another.");
          return;
        }
        inputRef.current?.click();
      }}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30",
        (isUploading || isLimitReached) && "opacity-70",
        isUploading && "pointer-events-none",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        disabled={isUploading || isLimitReached}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {isUploading ? (
        <>
          <Spinner className="h-6 w-6" />
          <p className="text-sm text-muted-foreground">Uploading and analyzing your resume...</p>
        </>
      ) : (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium">
              {isLimitReached ? "Resume limit reached" : "Drag & drop one resume, or click to browse"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isLimitReached
                ? "Delete an old resume before uploading another."
                : "PDF or DOCX, up to 10 MB. Upload one at a time."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
