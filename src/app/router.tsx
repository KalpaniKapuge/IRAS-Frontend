import { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { PageSpinner } from "@/components/shared/loading-state";
import { AppShell } from "@/components/layout/app-shell";
import { ProtectedRoute, GuestRoute } from "@/app/protected-route";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouteErrorPage } from "@/pages/route-error-page";
import { RootRedirect } from "@/pages/root-redirect";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";

function lazyPage(loader: () => Promise<{ default: React.ComponentType }>) {
  const Component = lazy(loader);
  return (
    <Suspense fallback={<PageSpinner />}>
      <Component />
    </Suspense>
  );
}

// Candidate
const CandidateDashboardPage = () =>
  lazyPage(() => import("@/features/dashboard/pages/candidate-dashboard-page").then((m) => ({ default: m.CandidateDashboardPage })));
const JobsBrowsePage = () =>
  lazyPage(() => import("@/features/jobs/pages/jobs-browse-page").then((m) => ({ default: m.JobsBrowsePage })));
const JobDetailPage = () =>
  lazyPage(() => import("@/features/jobs/pages/job-detail-page").then((m) => ({ default: m.JobDetailPage })));
const MyApplicationsPage = () =>
  lazyPage(() => import("@/features/applications/pages/my-applications-page").then((m) => ({ default: m.MyApplicationsPage })));
const JobMatchesPage = () =>
  lazyPage(() => import("@/features/job-matches/pages/job-matches-page").then((m) => ({ default: m.JobMatchesPage })));
const SkillGapsPage = () =>
  lazyPage(() => import("@/features/skill-gaps/pages/skill-gaps-page").then((m) => ({ default: m.SkillGapsPage })));
const CandidateProfilePage = () =>
  lazyPage(() => import("@/features/candidate-profile/pages/candidate-profile-page").then((m) => ({ default: m.CandidateProfilePage })));
const ResumesPage = () =>
  lazyPage(() => import("@/features/resumes/pages/resumes-page").then((m) => ({ default: m.ResumesPage })));

// Employer
const EmployerDashboardPage = () =>
  lazyPage(() => import("@/features/dashboard/pages/employer-dashboard-page").then((m) => ({ default: m.EmployerDashboardPage })));
const EmployerJobsPage = () =>
  lazyPage(() => import("@/features/jobs/pages/employer/employer-jobs-page").then((m) => ({ default: m.EmployerJobsPage })));
const JobCreatePage = () =>
  lazyPage(() => import("@/features/jobs/pages/employer/job-create-page").then((m) => ({ default: m.JobCreatePage })));
const JobEditPage = () =>
  lazyPage(() => import("@/features/jobs/pages/employer/job-edit-page").then((m) => ({ default: m.JobEditPage })));
const JobApplicantsPage = () =>
  lazyPage(() => import("@/features/applications/pages/employer/job-applicants-page").then((m) => ({ default: m.JobApplicantsPage })));
const EmployerProfilePage = () =>
  lazyPage(() => import("@/features/employer-profile/pages/employer-profile-page").then((m) => ({ default: m.EmployerProfilePage })));

// Admin
const AdminDashboardPage = () =>
  lazyPage(() => import("@/features/admin-reports/pages/admin-dashboard-page").then((m) => ({ default: m.AdminDashboardPage })));
const UsersAdminPage = () =>
  lazyPage(() => import("@/features/admin-users/pages/users-admin-page").then((m) => ({ default: m.UsersAdminPage })));
const JobsModerationPage = () =>
  lazyPage(() => import("@/features/admin-jobs/pages/jobs-moderation-page").then((m) => ({ default: m.JobsModerationPage })));
const SkillsAdminPage = () =>
  lazyPage(() => import("@/features/skill-taxonomy/pages/skills-admin-page").then((m) => ({ default: m.SkillsAdminPage })));
const KnowledgeBasePage = () =>
  lazyPage(() => import("@/features/knowledge-base/pages/knowledge-base-page").then((m) => ({ default: m.KnowledgeBasePage })));
const SystemStatusPage = () =>
  lazyPage(() => import("@/features/system-status/pages/system-status-page").then((m) => ({ default: m.SystemStatusPage })));
const AuditLogsPage = () =>
  lazyPage(() => import("@/features/audit-logs/pages/audit-logs-page").then((m) => ({ default: m.AuditLogsPage })));

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootRedirect />,
    errorElement: <RouteErrorPage />,
  },
  {
    element: <GuestRoute />,
    errorElement: <RouteErrorPage />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute allow={["Candidate"]} />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "/candidate",
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <CandidateDashboardPage /> },
          { path: "jobs", element: <JobsBrowsePage /> },
          { path: "jobs/:jobId", element: <JobDetailPage /> },
          { path: "applications", element: <MyApplicationsPage /> },
          { path: "matches", element: <JobMatchesPage /> },
          { path: "skill-gaps", element: <SkillGapsPage /> },
          { path: "profile", element: <CandidateProfilePage /> },
          { path: "resumes", element: <ResumesPage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allow={["Employer"]} />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "/employer",
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <EmployerDashboardPage /> },
          { path: "jobs", element: <EmployerJobsPage /> },
          { path: "jobs/new", element: <JobCreatePage /> },
          { path: "jobs/:jobId", element: <JobEditPage /> },
          { path: "jobs/:jobId/applicants", element: <JobApplicantsPage /> },
          { path: "profile", element: <EmployerProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allow={["Admin"]} />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: "/admin",
        element: <AppShell />,
        errorElement: <RouteErrorPage />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: "users", element: <UsersAdminPage /> },
          { path: "jobs", element: <JobsModerationPage /> },
          { path: "skills", element: <SkillsAdminPage /> },
          { path: "knowledge-base", element: <KnowledgeBasePage /> },
          { path: "system", element: <SystemStatusPage /> },
          { path: "audit-logs", element: <AuditLogsPage /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFoundPage />, errorElement: <RouteErrorPage /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} future={{ v7_startTransition: true }} />;
}
