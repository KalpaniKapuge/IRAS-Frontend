import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store";
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useJobsStore } from "../../store";
import { RequiredSkillsEditor } from "../../components/required-skills-editor";
import { JobRoleFields, type JobRoleFieldsValue } from "../../components/job-role-fields";
import type { JobRequiredSkillDto } from "../../types";

export function JobCreatePage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const createJob = useJobsStore((s) => s.createJob);
  const isMutating = useJobsStore((s) => s.isMutating);
  const navigate = useNavigate();

  const [values, setValues] = useState<JobRoleFieldsValue>({
    title: "",
    seniorityLevel: "Mid-Level",
    minExpYears: "2",
    educationReq: "Bachelor",
    employmentType: "FullTime",
    location: "",
    closingDate: "",
    requireAssessment: false,
  });
  const [requiredSkills, setRequiredSkills] = useState<JobRequiredSkillDto[]>([]);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  const canSubmit = values.title.trim().length > 0 && requiredSkills.length > 0;

  const handleSubmit = async () => {
    const job = await createJob(employerId, {
      title: values.title.trim(),
      seniorityLevel: values.seniorityLevel,
      minExpYears: Number(values.minExpYears) || 0,
      educationReq: values.educationReq,
      employmentType: values.employmentType,
      location: values.location || undefined,
      closingDate: values.closingDate || undefined,
      requiredSkills,
      requireAssessment: values.requireAssessment,
    });
    if (job) navigate(`/employer/jobs/${job.jobId}`);
  };

  return (
    <form
      ref={ref}
      onKeyDownCapture={onKeyDown} onFocus={onFocus}
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      noValidate
      className="space-y-6"
    >
      <PageHeader title="New Job Posting" description="Define the role's requirements — you'll generate the description with AI next." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role details</CardTitle>
        </CardHeader>
        <CardContent>
          <JobRoleFields values={values} onChange={(patch) => setValues((v) => ({ ...v, ...patch }))} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Required skills</CardTitle>
        </CardHeader>
        <CardContent>
          <RequiredSkillsEditor value={requiredSkills} onChange={setRequiredSkills} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => navigate("/employer/jobs")}>Cancel</Button>
        <Button type="submit" loading={isMutating} disabled={!canSubmit}>
          Create draft
        </Button>
      </div>
    </form>
  );
}
