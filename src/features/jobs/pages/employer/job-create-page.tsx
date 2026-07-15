import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_LEVELS, EMPLOYMENT_TYPES, type EducationLevel, type EmploymentType } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store";
import { useJobsStore } from "../../store";
import { RequiredSkillsEditor } from "../../components/required-skills-editor";
import type { JobRequiredSkillDto } from "../../types";

const SENIORITY_LEVELS = ["Internship", "Junior", "Mid-Level", "Senior", "Lead", "Principal"];

export function JobCreatePage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const createJob = useJobsStore((s) => s.createJob);
  const isMutating = useJobsStore((s) => s.isMutating);
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [seniorityLevel, setSeniorityLevel] = useState("Mid-Level");
  const [minExpYears, setMinExpYears] = useState("2");
  const [educationReq, setEducationReq] = useState<EducationLevel>("Bachelor");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("FullTime");
  const [location, setLocation] = useState("");
  const [closingDate, setClosingDate] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<JobRequiredSkillDto[]>([]);

  const canSubmit = title.trim().length > 0 && requiredSkills.length > 0;

  const handleSubmit = async () => {
    const job = await createJob(employerId, {
      title: title.trim(),
      seniorityLevel,
      minExpYears: Number(minExpYears) || 0,
      educationReq,
      employmentType,
      location: location || undefined,
      closingDate: closingDate || undefined,
      requiredSkills,
    });
    if (job) navigate(`/employer/jobs/${job.jobId}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="New Job Posting" description="Define the role's requirements — you'll generate the description with AI next." />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Role details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Job title</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Senior Backend Engineer" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>Seniority level</Label>
              <Select value={seniorityLevel} onValueChange={setSeniorityLevel}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SENIORITY_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Employment type</Label>
              <Select value={employmentType} onValueChange={(v) => setEmploymentType(v as EmploymentType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{titleCase(type)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum education</Label>
              <Select value={educationReq} onValueChange={(v) => setEducationReq(v as EducationLevel)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {EDUCATION_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>{titleCase(level)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Minimum experience (years)</Label>
              <Input type="number" min={0} value={minExpYears} onChange={(e) => setMinExpYears(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Location (optional)</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Colombo, Sri Lanka / Remote" />
            </div>
            <div className="space-y-2">
              <Label>Closing date (optional)</Label>
              <Input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} />
            </div>
          </div>
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
        <Button variant="outline" onClick={() => navigate("/employer/jobs")}>Cancel</Button>
        <Button onClick={handleSubmit} loading={isMutating} disabled={!canSubmit}>
          Create draft
        </Button>
      </div>
    </div>
  );
}
