import { useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { useResumeStore } from "../store";
import { ResumeUploadDropzone } from "../components/resume-upload-dropzone";
import { ResumeList } from "../components/resume-list";
import { SkillConfirmationDialog } from "../components/skill-confirmation-dialog";

export function ResumesPage() {
  const { resumes, isLoading, load } = useResumeStore();

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resumes"
        description="Upload up to 5 resumes. We'll parse them with AI to extract skills, contact details, and experience."
      />
      <ResumeUploadDropzone />
      {isLoading && resumes.length === 0 ? <RowSkeletonList count={3} /> : <ResumeList resumes={resumes} />}
      <SkillConfirmationDialog />
    </div>
  );
}
