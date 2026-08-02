import { useEffect } from "react";
import { CalendarClock } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useInterviewsStore } from "../store";
import { InterviewListItem } from "../components/interview-list-item";

export function CandidateInterviewsPage() {
  const { myInterviews, isLoading, loadMine } = useInterviewsStore();

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader title="Interviews" description="All interviews scheduled across your applications." />

      {isLoading && myInterviews.length === 0 ? (
        <RowSkeletonList count={3} />
      ) : myInterviews.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No interviews yet" description="Scheduled interviews will show up here." />
      ) : (
        <div className="space-y-3">
          {myInterviews.map((interview) => (
            <InterviewListItem key={interview.interviewId} interview={interview} isEmployerView={false} />
          ))}
        </div>
      )}
    </div>
  );
}
