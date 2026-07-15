// Central mirror of the backend's C# enums (IRAS.Domain.Enums).
// Kept as string unions since the API serializes enums as strings
// (see IrasDbContext.OnModelCreating: `.HasConversion<string>()`).

export const USER_ROLES = ["Candidate", "Employer", "Admin"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EDUCATION_LEVELS = ["HighSchool", "Diploma", "Bachelor", "Master", "Doctorate"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const PROFICIENCY_LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"] as const;
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number];

export const SKILL_SOURCES = ["ManuallyAdded", "ResumeParsed"] as const;
export type SkillSource = (typeof SKILL_SOURCES)[number];

export const SKILL_CATEGORIES = [
  "ProgrammingLanguage",
  "Framework",
  "Database",
  "CloudPlatform",
  "Tool",
  "Methodology",
  "SoftSkill",
  "Other",
] as const;
export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export const COMPANY_SIZES = ["Small", "Medium", "Large", "Enterprise"] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const EMPLOYMENT_TYPES = ["FullTime", "PartTime", "Contract", "Internship", "Temporary"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const JOB_STATUSES = ["Draft", "Published", "Closed", "Archived"] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const IMPORTANCE_LEVELS = ["MustHave", "NiceToHave"] as const;
export type ImportanceLevel = (typeof IMPORTANCE_LEVELS)[number];

export const APPLICATION_STATUSES = [
  "Applied",
  "Screened",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
  "Withdrawn",
] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

// Statuses an employer may transition an application to (see UpdateApplicationStatusRequest).
export const EMPLOYER_SETTABLE_STATUSES = [
  "Screened",
  "Shortlisted",
  "Interview",
  "Rejected",
  "Hired",
] as const satisfies readonly ApplicationStatus[];

export const RESUME_FORMATS = ["PDF", "DOCX"] as const;
export type ResumeFormat = (typeof RESUME_FORMATS)[number];

export const PARSE_STATUSES = ["Pending", "Parsed", "Failed", "ManuallyEdited"] as const;
export type ParseStatus = (typeof PARSE_STATUSES)[number];

export const NOTIFICATION_TYPES = ["JobMatch", "ApplicationUpdate", "Feedback", "System"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const RELATED_ENTITY_TYPES = ["Job", "Application", "Feedback", "Resume"] as const;
export type RelatedEntityType = (typeof RELATED_ENTITY_TYPES)[number];

export const DELIVERY_CHANNELS = ["InApp", "Email", "Both"] as const;
export type DeliveryChannel = (typeof DELIVERY_CHANNELS)[number];

export const APPROVAL_STATUSES = ["PendingReview", "Approved", "Edited", "Rejected"] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export const DELIVERY_STATUSES = ["Queued", "Sent", "Failed"] as const;
export type DeliveryStatus = (typeof DELIVERY_STATUSES)[number];

export const CHAT_SENDERS = ["User", "Bot"] as const;
export type ChatSender = (typeof CHAT_SENDERS)[number];

export const KNOWLEDGE_CATEGORIES = ["FAQ", "PolicyGuideline", "SkillAdvice", "PlatformHowTo"] as const;
export type KnowledgeCategory = (typeof KNOWLEDGE_CATEGORIES)[number];

export const ALIAS_SOURCES = ["AdminAdded", "ResumeParsed"] as const;
export type AliasSource = (typeof ALIAS_SOURCES)[number];

// ---- Display metadata: label + badge tone per enum value ----

export type BadgeTone = "default" | "primary" | "success" | "warning" | "destructive" | "info" | "muted";

const applicationStatusTone: Record<ApplicationStatus, BadgeTone> = {
  Applied: "info",
  Screened: "muted",
  Shortlisted: "primary",
  Interview: "warning",
  Rejected: "destructive",
  Hired: "success",
  Withdrawn: "muted",
};

const jobStatusTone: Record<JobStatus, BadgeTone> = {
  Draft: "muted",
  Published: "success",
  Closed: "warning",
  Archived: "muted",
};

const parseStatusTone: Record<ParseStatus, BadgeTone> = {
  Pending: "info",
  Parsed: "success",
  Failed: "destructive",
  ManuallyEdited: "primary",
};

const approvalStatusTone: Record<ApprovalStatus, BadgeTone> = {
  PendingReview: "warning",
  Approved: "success",
  Edited: "primary",
  Rejected: "destructive",
};

const deliveryStatusTone: Record<DeliveryStatus, BadgeTone> = {
  Queued: "muted",
  Sent: "success",
  Failed: "destructive",
};

const importanceTone: Record<ImportanceLevel, BadgeTone> = {
  MustHave: "destructive",
  NiceToHave: "muted",
};

export const ENUM_TONE_MAPS = {
  ApplicationStatus: applicationStatusTone,
  JobStatus: jobStatusTone,
  ParseStatus: parseStatusTone,
  ApprovalStatus: approvalStatusTone,
  DeliveryStatus: deliveryStatusTone,
  ImportanceLevel: importanceTone,
} as const;
