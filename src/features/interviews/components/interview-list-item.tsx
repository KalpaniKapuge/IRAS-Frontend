import { useState } from "react";
import { CalendarClock, MapPin, Users, Video } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { formatDateTime } from "@/lib/format";
import { useInterviewsStore } from "../store";
import { ScheduleInterviewDialog } from "./schedule-interview-dialog";
import type { InterviewDto } from "../types";

const modeIcon = { Onsite: MapPin, Remote: Video, Phone: Users } as const;

export function InterviewListItem({
  interview,
  employerId,
  isEmployerView,
}: {
  interview: InterviewDto;
  employerId?: number;
  isEmployerView: boolean;
}) {
  const cancel = useInterviewsStore((s) => s.cancel);
  const updateOutcome = useInterviewsStore((s) => s.updateOutcome);
  const [outcome, setOutcome] = useState("");

  const ModeIcon = modeIcon[interview.mode];
  const isScheduled = interview.status === "Scheduled";
  const isPast = new Date(interview.scheduledAt) < new Date();

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-medium">
              {isEmployerView ? interview.candidateName : `${interview.jobTitle}${interview.companyName ? ` at ${interview.companyName}` : ""}`}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <CalendarClock className="h-3.5 w-3.5" /> {formatDateTime(interview.scheduledAt)} · {interview.durationMinutes} min
            </p>
          </div>
          <StatusBadge enumName="InterviewStatus" value={interview.status} />
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ModeIcon className="h-3.5 w-3.5" /> {interview.mode}
          </span>
          {interview.location && <span>{interview.location}</span>}
          {interview.meetingLink && (
            <a href={interview.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              Join link
            </a>
          )}
          {interview.interviewerNames && <span>With {interview.interviewerNames}</span>}
        </div>

        {interview.notes && <p className="text-sm text-foreground/80">{interview.notes}</p>}
        {interview.status === "Cancelled" && interview.cancellationReason && (
          <p className="text-sm text-muted-foreground">Reason: {interview.cancellationReason}</p>
        )}

        {isEmployerView && isScheduled && employerId !== undefined && (
          <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <ScheduleInterviewDialog
              employerId={employerId}
              jobId={interview.jobId}
              applicationId={interview.applicationId}
              candidateName={interview.candidateName}
              existing={interview}
              trigger={<Button variant="outline" size="sm">Reschedule</Button>}
            />
            <ConfirmAction
              trigger={<Button variant="outline" size="sm">Cancel</Button>}
              title="Cancel this interview?"
              description="The candidate will be notified."
              variant="destructive"
              confirmLabel="Cancel interview"
              onConfirm={() => cancel(employerId, interview.jobId, interview.applicationId, interview.interviewId, {})}
            />
            {isPast && (
              <div className="flex items-center gap-2">
                <Select value={outcome} onValueChange={setOutcome}>
                  <SelectTrigger className="h-8 w-36"><SelectValue placeholder="Set outcome" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="NoShow">No-show</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={!outcome}
                  onClick={() => {
                    updateOutcome(employerId, interview.jobId, interview.applicationId, interview.interviewId, {
                      status: outcome as "Completed" | "NoShow",
                    });
                    setOutcome("");
                  }}
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
