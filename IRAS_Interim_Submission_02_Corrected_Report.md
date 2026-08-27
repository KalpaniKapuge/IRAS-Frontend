# Intelligent Recruitment Automation System

## Interim Submission 02 Report

**Student ID:** 28870  
**Project Title:** Intelligent Recruitment Automation System  
**Submission Type:** Interim Submission 02  
**Date:** August 2026

---

## Abstract

The Intelligent Recruitment Automation System (IRAS) is an AI-assisted recruitment platform designed to improve the efficiency, accuracy, and transparency of the hiring process. The system supports three major user roles: Candidate, Employer, and Administrator. Interim Submission 01 mainly focused on identifying the recruitment problem, defining project objectives, reviewing related systems, and proposing the initial system design. Interim Submission 02 presents the implementation progress completed after that stage.

During this phase, a complete frontend application structure was developed using React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Axios, Radix UI, and Recharts. The system now includes role-based dashboards, protected routing, candidate profile management, resume upload, CV management, job browsing, job posting, application tracking, candidate ranking displays, interview scheduling, skill gap analysis, job matching views, notifications, admin user management, job moderation, skill taxonomy management, knowledge base management, audit logs, and system status monitoring.

The implementation has moved the project from a proposed design into a working frontend application that is prepared for integration with the ASP.NET Core IRAS API. The current progress demonstrates the core recruitment workflows required by candidates, employers, and administrators.

---

## Table of Contents

1. Introduction  
2. Problem Background  
3. Progress Since Interim Submission 01  
4. Updated Project Objectives  
5. Updated System Scope  
6. Newly Added Features  
7. Updated Technology Stack  
8. System Architecture  
9. Implementation Details  
10. User Role Based Modules  
11. Database and API Integration Overview  
12. User Interface and User Experience Improvements  
13. Testing and Validation  
14. Challenges Faced  
15. Remaining Work  
16. Conclusion  
17. References  

---

## 1. Introduction

Recruitment is a time-consuming process for both job seekers and employers. Candidates often struggle to identify suitable job opportunities, prepare strong resumes, and understand which skills they need to improve. Employers face challenges when creating job descriptions, reviewing large numbers of applications, shortlisting suitable candidates, scheduling interviews, and maintaining fair evaluation records.

The Intelligent Recruitment Automation System is developed to address these issues by providing a structured recruitment platform with AI-assisted capabilities such as resume parsing, candidate-job matching, skill gap analysis, candidate ranking, feedback generation, and a recruitment-specific chatbot. The project aims to reduce manual effort in recruitment while improving the quality of candidate selection and communication.

This Interim Submission 02 report explains the development work completed after Interim Submission 01. The main focus of this submission is the implemented frontend system, role-based workflows, newly added features, newly used technologies, system architecture improvements, and remaining development tasks.

---

## 2. Problem Background

Traditional recruitment systems often depend heavily on manual screening and communication. This causes several issues:

- Employers spend significant time reviewing resumes manually.
- Candidates may apply for jobs without understanding their suitability.
- Skills extracted from resumes may not be standardized.
- Job descriptions may be inconsistent or incomplete.
- Candidate feedback is often delayed or unavailable.
- Interview scheduling may happen outside the recruitment platform.
- Administrators may have limited visibility into system activity and platform health.

IRAS attempts to solve these problems by combining recruitment management features with intelligent automation. The system supports structured data entry, resume-based candidate profiling, job matching, skill gap identification, application tracking, and administrative monitoring.

---

## 3. Progress Since Interim Submission 01

Interim Submission 01 mainly described the project proposal, objectives, literature review, initial system design, and planned features. Since then, the project has progressed into an implemented frontend application with multiple functional modules.

The major progress completed after Interim Submission 01 includes:

- Created the full React and TypeScript frontend project.
- Implemented a feature-based folder architecture.
- Developed authentication screens for login and registration.
- Added role-based protected routing for Candidate, Employer, and Admin users.
- Implemented reusable layout components such as sidebar, topbar, mobile navigation, and app shell.
- Built a reusable UI component system using Radix UI primitives and Tailwind CSS.
- Added dashboard pages for Candidate, Employer, and Admin users.
- Implemented candidate job browsing and job detail pages.
- Implemented job application flow with resume selection.
- Added candidate application tracking with status and score displays.
- Added resume upload and resume parsing review interface.
- Added candidate profile management including education, experience, skills, and certifications.
- Added certificate upload support in the candidate profile UI.
- Added CV list and CV editor modules.
- Added custom CV section editing and ordering.
- Added job matching and skill gap analysis pages.
- Added employer job posting, editing, and applicant management.
- Added employer interview scheduling and interview management.
- Added admin user management, job moderation, skill taxonomy, knowledge base, audit log, and system status pages.
- Added notification support through a notification bell component.
- Added charts and analytics support for the admin dashboard.
- Added centralized API communication using Axios and JWT bearer token handling.
- Added improved loading, empty, error, confirmation, and toast notification states.

This means the project is no longer only at the planning stage. A major part of the frontend implementation has already been completed.

---

## 4. Updated Project Objectives

The project objectives remain aligned with Interim Submission 01, but they have become more implementation-focused during Interim Submission 02.

The updated objectives are:

- To develop a role-based recruitment platform for Candidates, Employers, and Administrators.
- To allow candidates to manage profiles, resumes, CVs, applications, job matches, skill gaps, and interviews.
- To allow employers to manage company profiles, job postings, applicants, candidate feedback, and interviews.
- To allow administrators to monitor users, job postings, skill taxonomy, knowledge base records, audit logs, and system status.
- To integrate the frontend with backend APIs using authenticated HTTP requests.
- To provide a responsive and user-friendly interface for recruitment workflows.
- To prepare the system for AI-assisted features such as resume parsing, job matching, skill gap analysis, candidate ranking, job description generation, feedback support, and chatbot assistance.

---

## 5. Updated System Scope

The scope of the current system covers the frontend implementation and API integration structure for a full recruitment automation platform.

### Included Scope

- Candidate registration and login
- Employer registration and login
- Admin access control
- Candidate profile management
- Employer profile management
- Resume upload and review
- CV management
- Job browsing
- Job posting management
- Job applications
- Applicant ranking display
- Skill gap analysis
- Job matching
- Interview scheduling
- Notifications
- Admin reporting
- User and job moderation
- Skill taxonomy management
- Knowledge base management
- Audit log viewing
- System status monitoring

### Current Limitations

- Final testing with live backend data must be completed.
- AI model accuracy evaluation must be documented after backend integration testing.
- More screenshots and user testing results should be added before the final submission.
- Deployment configuration and production hosting can be completed in the next stage.

---

## 6. Newly Added Features

## 6.1 Candidate Features

### Candidate Dashboard

A candidate dashboard has been implemented to provide candidates with a summary of their recruitment activities. This dashboard can be used to show application status, job recommendations, profile progress, and other candidate-related information.

### Job Browsing

Candidates can browse available job postings. The job browsing page provides access to job details and helps candidates identify suitable opportunities.

### Job Detail View

A dedicated job detail page has been added. This page displays job information in a structured format, including job description, required skills, employment type, and other relevant job details.

### Job Application Flow

Candidates can apply for jobs through the application flow. The application interface supports resume selection and sends application data through the API layer.

### My Applications

Candidates can track their submitted applications. The application tracking interface displays application statuses such as Applied, Screened, Shortlisted, Interview, Rejected, Hired, and Withdrawn.

### Resume Upload

A resume upload module has been implemented. Candidates can upload resumes in supported formats such as PDF and DOCX. The interface is designed to support resume parsing results returned by the backend.

### Resume Skill Confirmation

After resume parsing, candidates can review and confirm extracted skills. This improves data accuracy before skills are used for job matching or skill gap analysis.

### Candidate Profile Management

Candidates can manage their profile details including personal information, education history, work experience, skills, and certifications.

### Certificate Upload UI

The candidate profile module now includes certificate-related UI improvements. Candidates can add certification details and upload related certificate evidence.

### CV Management

A new CV module has been added. Candidates can view their CV list, create CVs, edit CV sections, and manage CV content.

### CV Section Ordering

The CV editor includes section ordering functionality. This allows candidates to customize the structure of their CV according to their needs.

### Job Matches

A job matching page has been implemented to display suitable jobs for a candidate. The page is prepared to show matching scores and skill-based recommendations from the backend.

### Skill Gap Analysis

A skill gap analysis page has been implemented to help candidates understand missing skills for target jobs. This supports career development by showing areas that need improvement.

### Candidate Interviews

Candidates can view scheduled interviews. Interview information includes mode and status values such as Onsite, Remote, Phone, Scheduled, Completed, NoShow, and Cancelled.

### Notifications

The frontend includes a notification bell component. Notifications can support job match alerts, application updates, feedback alerts, and system messages.

---

## 6.2 Employer Features

### Employer Dashboard

An employer dashboard has been implemented to provide a summary of hiring activities, job postings, applicants, and recruitment progress.

### Company Profile Management

Employers can manage company profile information such as company name, description, size, and other company-related details.

### Job Posting Management

Employers can create, view, edit, and manage job postings. Job statuses include Draft, Published, Closed, and Archived.

### Required Skills Editor

A required skills editor has been implemented for job postings. Employers can define skills as Must Have or Nice To Have, which supports candidate ranking and matching.

### Applicant Management

Employers can view applicants for each job posting. Applicant rows include candidate details, scores, application status, and actions.

### Candidate Score Breakdown

The application module includes score display components. These help employers understand candidate suitability based on matching or evaluation criteria.

### Application Status Management

Employers can update candidate application statuses. Supported statuses include Screened, Shortlisted, Interview, Rejected, and Hired.

### Candidate Feedback Review

The system includes feedback review UI components. Employers can review candidate feedback before it is finalized or delivered.

### Interview Scheduling

Employers can schedule interviews using the interview scheduling dialog. This supports interview mode, time, and status management.

### Employer Interviews

Employers can view and manage interview records related to their hiring workflow.

---

## 6.3 Admin Features

### Admin Dashboard

An admin dashboard has been implemented with reporting and analytics support. Recharts is used for chart visualizations.

### User Management

Administrators can manage platform users. This supports visibility over Candidate, Employer, and Admin accounts.

### Job Moderation

Administrators can review and moderate job postings. This helps maintain quality and prevent unsuitable job content.

### Skill Taxonomy Management

Administrators can manage the skill taxonomy used by the system. Skills can be categorized into groups such as programming languages, frameworks, databases, cloud platforms, tools, methodologies, soft skills, and other skills.

### Skill Alias Management

The system includes alias management for skills. This helps normalize different names for the same skill, such as JS and JavaScript.

### Knowledge Base Management

Administrators can manage knowledge base records. Categories include FAQ, Policy Guideline, Skill Advice, and Platform How To.

### System Status Monitoring

The system status page provides administrators with information about platform health and operational status.

### Audit Logs

Audit log pages have been implemented to allow administrators to monitor system activity and important platform events.

---

## 6.4 Common Features

The system also includes shared features used across multiple roles:

- Login page
- Register page
- Password strength indicator
- Field validation error display
- Protected routes
- Guest routes
- Role-based redirection
- Responsive sidebar
- Mobile navigation
- Topbar
- Theme support
- Reusable status badges
- Reusable stat cards
- Loading states
- Empty states
- Confirmation dialogs
- Toast notifications
- Centralized API error handling

---

## 7. Updated Technology Stack

The technology stack used during Interim Submission 02 is shown below.

| Layer | Technology | Purpose |
|---|---|---|
| Frontend Framework | React 18 | Building reusable UI components and pages |
| Language | TypeScript | Type-safe frontend development |
| Build Tool | Vite | Fast development server and production build |
| Styling | Tailwind CSS | Utility-first responsive styling |
| UI Primitives | Radix UI | Accessible dialogs, dropdowns, tabs, tooltips, select boxes, and other UI primitives |
| Component Pattern | shadcn-style components | Reusable design system components |
| Routing | React Router DOM | Page routing, nested routes, role-based navigation |
| State Management | Zustand | Auth, UI, theme, and feature-level state management |
| API Communication | Axios | HTTP communication with backend APIs |
| Validation | Zod | Form and request validation support |
| Charts | Recharts | Admin dashboard analytics and visual reports |
| Icons | Lucide React | Consistent icon system |
| Notifications | Sonner | Toast messages and user feedback |
| Date Handling | date-fns | Date formatting and display |
| Styling Utilities | clsx, tailwind-merge, class-variance-authority | Conditional class handling and component variants |
| Backend API Target | ASP.NET Core IRAS API | Backend service used by the frontend |
| Authentication Method | JWT Bearer Token | Secure authenticated API requests |

---

## 8. System Architecture

The frontend system uses a feature-based architecture. Each major business function is separated into its own module. This improves maintainability, readability, and scalability.

The main frontend structure is:

```text
src/
  app/
  components/
    layout/
    shared/
    ui/
  config/
  features/
    admin-jobs/
    admin-reports/
    admin-users/
    applications/
    audit-logs/
    auth/
    candidate-profile/
    chat/
    cv/
    dashboard/
    employer-profile/
    feedback/
    interviews/
    job-matches/
    jobs/
    knowledge-base/
    notifications/
    resumes/
    skill-gaps/
    skill-taxonomy/
    system-status/
  hooks/
  lib/
  stores/
  types/
```

Each feature folder generally contains:

- `api.ts` for backend API communication
- `types.ts` for TypeScript interfaces and DTOs
- `store.ts` when feature-level state is required
- `components/` for feature-specific UI components
- `pages/` for route-level pages

This structure separates responsibilities clearly and makes the system easier to extend in the final project stage.

---

## 9. Implementation Details

## 9.1 Routing and Access Control

The application uses React Router DOM for routing. Routes are protected according to user roles. The three main protected route groups are:

- Candidate routes under `/candidate`
- Employer routes under `/employer`
- Admin routes under `/admin`

Guest routes are provided for login and registration. Protected routes prevent unauthorized users from accessing role-specific pages.

## 9.2 API Client

The frontend uses a centralized Axios client. The API client reads the base URL from the environment variable `VITE_API_BASE_URL`. JWT bearer tokens are attached to requests when available.

The API client also includes centralized error handling for:

- Unauthorized requests
- Forbidden requests
- Not found responses
- Server connection issues
- General API errors

This reduces repeated error-handling code across feature modules.

## 9.3 State Management

Zustand is used for state management. It is used for:

- Authentication state
- UI state
- Theme state
- Feature-level state for applications, resumes, CVs, interviews, jobs, chat, notifications, and candidate profile

This approach keeps state management lightweight and avoids unnecessary complexity.

## 9.4 UI Component System

The project includes reusable UI components built using Radix UI primitives and Tailwind CSS. Examples include:

- Button
- Dialog
- Alert dialog
- Dropdown menu
- Input
- Textarea
- Select
- Checkbox
- Tabs
- Table
- Tooltip
- Avatar
- Progress
- Badge
- Card
- Skeleton

Shared application components were also created, including:

- Page header
- Status badge
- Score bar
- Stat card
- Loading state
- Empty state
- Confirm action dialog
- Theme toggle

## 9.5 Theming

The frontend uses Tailwind CSS with HSL-based design tokens. Theme values are defined in CSS variables and used through Tailwind configuration. Theme state is persisted using the theme store.

This creates a consistent design system and makes it easier to maintain the visual identity of the application.

---

## 10. User Role Based Modules

## 10.1 Candidate Module

The Candidate module focuses on job search, application management, profile building, resumes, CVs, skill gap analysis, and interviews.

Candidate routes include:

- `/candidate`
- `/candidate/jobs`
- `/candidate/jobs/:jobId`
- `/candidate/applications`
- `/candidate/matches`
- `/candidate/skill-gaps`
- `/candidate/profile`
- `/candidate/resumes`
- `/candidate/cvs`
- `/candidate/cvs/:cvId`
- `/candidate/interviews`

## 10.2 Employer Module

The Employer module focuses on company profile management, job posting, applicant review, application status updates, feedback, and interview scheduling.

Employer routes include:

- `/employer`
- `/employer/jobs`
- `/employer/jobs/new`
- `/employer/jobs/:jobId`
- `/employer/jobs/:jobId/applicants`
- `/employer/profile`
- `/employer/interviews`

## 10.3 Admin Module

The Admin module focuses on platform management, moderation, analytics, and operational monitoring.

Admin routes include:

- `/admin`
- `/admin/users`
- `/admin/jobs`
- `/admin/skills`
- `/admin/knowledge-base`
- `/admin/system`
- `/admin/audit-logs`

---

## 11. Database and API Integration Overview

The current frontend is designed to communicate with the IRAS backend API. The frontend mirrors backend enum values using TypeScript string unions. This helps keep frontend data consistent with backend domain values.

Important enum groups include:

- User roles
- Education levels
- Proficiency levels
- Skill categories
- Company sizes
- Employment types
- Job statuses
- Application statuses
- Resume formats
- Parse statuses
- Notification types
- Approval statuses
- Delivery statuses
- Chat sender types
- Knowledge categories
- Interview modes
- Interview statuses

The frontend modules are structured so that each feature has its own API file. This makes backend integration easier because each module communicates with the backend through a clear API boundary.

---

## 12. User Interface and User Experience Improvements

Several UI/UX improvements were completed after Interim Submission 01:

- Responsive layout for desktop and mobile screens
- Role-based sidebar navigation
- Mobile navigation support
- Consistent icon usage
- Improved form inputs and validation messages
- Password strength display
- Loading indicators during API requests
- Empty state messages when no data is available
- Confirmation dialogs for important actions
- Toast messages for success and error feedback
- Status badges for jobs, applications, resume parsing, feedback approval, and interviews
- Score bars for candidate ranking and job matching
- Dark and light theme support
- Consistent spacing, colors, and component styling

These changes make the application more practical and easier to use than the original design-stage version.

---

## 13. Testing and Validation

The current project includes TypeScript build validation through the following command:

```text
npm run build
```

This command runs TypeScript project checks and creates a production build using Vite.

Validation completed or planned includes:

- TypeScript type checking
- Route availability checks
- Role-based route behavior checks
- UI component rendering checks
- Form validation checks
- API request and error handling checks
- Responsive layout checks
- Manual testing of candidate, employer, and admin workflows

For the final submission, more formal testing should be added, including:

- Unit testing for reusable logic
- Integration testing for API-connected workflows
- User acceptance testing with sample Candidate, Employer, and Admin accounts
- AI result validation for resume parsing, job matching, skill gap analysis, and candidate ranking

---

## 14. Challenges Faced

During Interim Submission 02, the main challenges were:

- Designing a frontend structure that can support many recruitment modules without becoming difficult to maintain.
- Implementing separate workflows for three user roles.
- Keeping frontend enum values consistent with backend domain values.
- Handling API authentication and error states consistently.
- Designing reusable UI components while maintaining a professional interface.
- Supporting complex recruitment workflows such as applications, ranking, feedback, CV editing, resume parsing review, and interview scheduling.
- Preparing the frontend for AI-assisted backend features without hardcoding AI results in the interface.

These challenges were addressed by using a feature-based architecture, centralized API client, reusable UI components, and role-based route guards.

---

## 15. Remaining Work

The following work should be completed before the final submission:

- Complete full backend integration testing with live API data.
- Add final screenshots of all implemented interfaces.
- Test the system using realistic candidate, employer, and admin accounts.
- Evaluate AI features such as resume parsing, job matching, skill gap analysis, feedback generation, and chatbot responses.
- Add formal test cases and test result tables.
- Improve error recovery for failed uploads and failed API requests where needed.
- Complete final deployment configuration.
- Prepare final documentation, user manual, and final presentation materials.

---

## 16. Conclusion

Interim Submission 02 shows significant progress in the development of the Intelligent Recruitment Automation System. The project has moved from the proposal and design stage into a substantially implemented frontend application. The current system includes role-based modules for Candidates, Employers, and Administrators, along with important recruitment workflows such as resume upload, CV management, job posting, job application tracking, skill gap analysis, job matching, interview scheduling, feedback review, notifications, analytics, and administrative monitoring.

The updated technology stack improves the maintainability, scalability, and usability of the system. React, TypeScript, Vite, Tailwind CSS, Zustand, React Router, Axios, Radix UI, and Recharts provide a strong foundation for the frontend. The project is now ready for deeper backend integration testing, AI feature validation, final UI refinements, and deployment preparation.

Overall, the work completed after Interim Submission 01 demonstrates that the core system has been developed successfully and that the project is on track for final submission.

---

## 17. References

The final report can include the same academic references used in Interim Submission 01, especially sources related to recruitment automation, resume parsing, applicant tracking systems, artificial intelligence in hiring, natural language processing, and human resource management systems.

Additional technical references may include:

- React documentation
- TypeScript documentation
- Vite documentation
- Tailwind CSS documentation
- React Router documentation
- Zustand documentation
- Axios documentation
- Radix UI documentation
- Recharts documentation
- ASP.NET Core documentation

---

## Appendix A: Suggested Screenshots to Add

Add screenshots under the relevant chapters before converting the report to PDF:

1. Login page
2. Register page
3. Candidate dashboard
4. Candidate job browsing page
5. Job details page
6. Job application dialog
7. My applications page
8. Resume upload page
9. Resume skill confirmation dialog
10. Candidate profile page
11. Certification upload section
12. CV list page
13. CV editor page
14. Job matches page
15. Skill gap analysis page
16. Candidate interviews page
17. Employer dashboard
18. Employer job postings page
19. Job create/edit page
20. Applicant management page
21. Interview scheduling dialog
22. Admin dashboard
23. User management page
24. Job moderation page
25. Skill taxonomy page
26. Knowledge base page
27. System status page
28. Audit logs page

---

## Appendix B: Corrected Feature Summary for Interim 02

The most important correction for the Interim Submission 02 report is that the project should not be written as if it is still only proposed or partially planned. The current version has already implemented a large frontend system. Therefore, the report should clearly mention:

- Implemented role-based frontend
- Implemented Candidate, Employer, and Admin modules
- Implemented CV and interview features
- Implemented candidate profile and certificate upload UI
- Implemented resume upload and skill confirmation UI
- Implemented application tracking and applicant management
- Implemented admin monitoring and management pages
- Implemented reusable UI component system
- Implemented centralized API client and JWT handling
- Implemented responsive layout and theme system

