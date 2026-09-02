import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_LEVELS, EMPLOYMENT_TYPES, WORK_ARRANGEMENTS, type EducationLevel, type EmploymentType, type WorkArrangement } from "@/types/enums";
import { titleCase } from "@/lib/utils";
import { sanitizeInteger, tomorrowIsoDate } from "@/lib/validation";

export const SENIORITY_LEVELS = ["Internship", "Junior", "Mid-Level", "Senior", "Lead", "Principal"];

export interface JobRoleFieldsValue {
  title: string;
  seniorityLevel: string;
  minExpYears: string;
  educationReq: EducationLevel;
  employmentType: EmploymentType;
  workArrangement: WorkArrangement;
  location: string;
  closingDate: string;
  requireAssessment: boolean;
}

interface JobRoleFieldsProps {
  values: JobRoleFieldsValue;
  onChange: (patch: Partial<JobRoleFieldsValue>) => void;
}

export function JobRoleFields({ values, onChange }: JobRoleFieldsProps) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label>Job title</Label>
        <Input
          value={values.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. Senior Backend Engineer"
          maxLength={150}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="space-y-2">
          <Label>Seniority level</Label>
          <Select value={values.seniorityLevel} onValueChange={(v) => onChange({ seniorityLevel: v })}>
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
          <Select value={values.employmentType} onValueChange={(v) => onChange({ employmentType: v as EmploymentType })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((type) => (
                <SelectItem key={type} value={type}>{titleCase(type)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Work arrangement</Label>
          <Select value={values.workArrangement} onValueChange={(v) => onChange({ workArrangement: v as WorkArrangement })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {WORK_ARRANGEMENTS.map((arrangement) => (
                <SelectItem key={arrangement} value={arrangement}>{titleCase(arrangement)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Minimum education</Label>
          <Select value={values.educationReq} onValueChange={(v) => onChange({ educationReq: v as EducationLevel })}>
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
          <Input
            type="text"
            inputMode="numeric"
            value={values.minExpYears}
            onChange={(e) => onChange({ minExpYears: sanitizeInteger(e.target.value, 2) })}
            placeholder="0–30"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Location (optional)</Label>
          <Input
            value={values.location}
            onChange={(e) => onChange({ location: e.target.value })}
            placeholder="e.g. Colombo, Sri Lanka / Remote"
            maxLength={150}
          />
        </div>
        <div className="space-y-2">
          <Label>Closing date (optional)</Label>
          <Input
            type="date"
            min={tomorrowIsoDate()}
            value={values.closingDate}
            onChange={(e) => onChange({ closingDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-border p-3">
        <Checkbox
          id="require-assessment"
          checked={values.requireAssessment}
          onCheckedChange={(checked) => onChange({ requireAssessment: checked === true })}
        />
        <div className="space-y-1">
          <Label htmlFor="require-assessment" className="cursor-pointer">
            Require a skill assessment before candidates can apply
          </Label>
          <p className="text-xs text-muted-foreground">
            Candidates must pass a short AI-generated quiz on this role's required skills before they can submit an
            application. Their score is shown alongside their CV match when you review applicants.
          </p>
        </div>
      </div>
    </div>
  );
}
