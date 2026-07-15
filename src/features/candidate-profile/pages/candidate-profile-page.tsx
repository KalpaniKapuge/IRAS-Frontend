import { useEffect } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { PageSpinner } from "@/components/shared/loading-state";
import { useAuthStore } from "@/features/auth/store";
import { useCandidateProfileStore } from "../store";
import { ProfileHeaderCard } from "../components/profile-header-card";
import { EducationSection } from "../components/education-section";
import { ExperienceSection } from "../components/experience-section";
import { CertificationsSection } from "../components/certifications-section";
import { SkillsSection } from "../components/skills-section";

export function CandidateProfilePage() {
  const candidateId = useAuthStore((s) => s.user!.userId);
  const { profile, isLoading, load } = useCandidateProfileStore();

  useEffect(() => {
    load(candidateId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  if (isLoading && !profile) return <PageSpinner label="Loading your profile…" />;
  if (!profile) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="My Profile" description="Keep this up to date — it powers matching, ranking, and skill gap analysis." />
      <ProfileHeaderCard profile={profile} candidateId={candidateId} />
      <div className="grid gap-6 lg:grid-cols-2">
        <EducationSection candidateId={candidateId} educations={profile.educations} />
        <ExperienceSection candidateId={candidateId} experiences={profile.workExperiences} />
        <CertificationsSection candidateId={candidateId} certifications={profile.certifications} />
        <SkillsSection candidateId={candidateId} skills={profile.skills} />
      </div>
    </div>
  );
}
