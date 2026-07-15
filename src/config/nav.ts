import {
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  FileStack,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Radar,
  ScrollText,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import type { UserRole } from "@/types/enums";

export interface NavItem {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  end?: boolean;
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}

export const NAV_BY_ROLE: Record<UserRole, NavSection[]> = {
  Candidate: [
    {
      items: [{ label: "Dashboard", to: "/candidate", icon: LayoutDashboard, end: true }],
    },
    {
      title: "Career",
      items: [
        { label: "Browse Jobs", to: "/candidate/jobs", icon: Briefcase },
        { label: "My Applications", to: "/candidate/applications", icon: ListChecks },
        { label: "Job Matches", to: "/candidate/matches", icon: Radar },
        { label: "Skill Gaps", to: "/candidate/skill-gaps", icon: Target },
      ],
    },
    {
      title: "Profile",
      items: [
        { label: "My Profile", to: "/candidate/profile", icon: Users },
        { label: "Resumes", to: "/candidate/resumes", icon: FileText },
      ],
    },
  ],
  Employer: [
    {
      items: [{ label: "Dashboard", to: "/employer", icon: LayoutDashboard, end: true }],
    },
    {
      title: "Hiring",
      items: [{ label: "Job Postings", to: "/employer/jobs", icon: Briefcase }],
    },
    {
      title: "Company",
      items: [{ label: "Company Profile", to: "/employer/profile", icon: Building2 }],
    },
  ],
  Admin: [
    {
      items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard, end: true }],
    },
    {
      title: "Platform",
      items: [
        { label: "Users", to: "/admin/users", icon: Users },
        { label: "Job Postings", to: "/admin/jobs", icon: Briefcase },
        { label: "Skill Taxonomy", to: "/admin/skills", icon: Sparkles },
        { label: "Knowledge Base", to: "/admin/knowledge-base", icon: FileStack },
      ],
    },
    {
      title: "Operations",
      items: [
        { label: "System Status", to: "/admin/system", icon: Gauge },
        { label: "Audit Logs", to: "/admin/audit-logs", icon: ScrollText },
      ],
    },
  ],
};

export const ROLE_LABEL: Record<UserRole, string> = {
  Candidate: "Candidate",
  Employer: "Employer",
  Admin: "Administrator",
};

export const ROLE_HOME: Record<UserRole, string> = {
  Candidate: "/candidate",
  Employer: "/employer",
  Admin: "/admin",
};

export const ROLE_ICON: Record<UserRole, typeof ShieldCheck> = {
  Candidate: Users,
  Employer: Building2,
  Admin: ShieldCheck,
};

// re-exported for pages that need a generic "reports/analytics" glyph
export const REPORTS_ICON = BarChart3;
export const CHATBOT_ICON = Bot;
export const SETTINGS_ICON = Settings;
