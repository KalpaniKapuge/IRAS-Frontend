import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EDUCATION_LEVELS, EMPLOYMENT_TYPES, type EducationLevel, type EmploymentType } from "@/types/enums";
import { titleCase } from "@/lib/utils";

export const SENIORITY_LEVELS = ["Internship", "Junior", "Mid-Level", "Senior", "Lead", "Principal"];

export interface JobRoleFieldsValue {
  title: string;
  seniorityLevel: string;
  minExpYears: string;
  educationReq: EducationLevel;
  employmentType: EmploymentType;
  location: string;
  closingDate: string;
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
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
            type="number"
            min={0}
            value={values.minExpYears}
            onChange={(e) => onChange({ minExpYears: e.target.value })}
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
          />
        </div>
        <div className="space-y-2">
          <Label>Closing date (optional)</Label>
          <Input type="date" value={values.closingDate} onChange={(e) => onChange({ closingDate: e.target.value })} />
        </div>
      </div>
    </div>
  );
}
