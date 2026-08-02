import { useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/features/auth/store";
import { useInterviewsStore } from "../store";
import { InterviewListItem } from "../components/interview-list-item";

export function EmployerInterviewsPage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const { employerInterviews, isLoading, loadForEmployer } = useInterviewsStore();

  useEffect(() => {
    loadForEmployer(employerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId]);

  return (
    <div className="space-y-6">
      <PageHeader title="Interviews" description="Every interview scheduled across all of your job postings." />

      {isLoading && employerInterviews.length === 0 ? (
        <RowSkeletonList count={3} />
      ) : employerInterviews.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No interviews scheduled yet" description="Schedule one from a job's applicant list." />
      ) : (
        <div className="space-y-3">
          {employerInterviews.map((interview) => (
            <InterviewListItem key={interview.interviewId} interview={interview} employerId={employerId} isEmployerView />
          ))}
        </div>
      )}
    </div>
  );
}
