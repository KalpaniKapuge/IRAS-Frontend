import { useEffect, useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { INTERVIEW_MODES, type InterviewMode } from "@/types/enums";
import { useInterviewsStore } from "../store";
import type { InterviewDto } from "../types";

interface ScheduleInterviewDialogProps {
  employerId: number;
  jobId: number;
  applicationId: number;
  candidateName: string;
  existing?: InterviewDto; // when set, dialog reschedules instead of creating
  trigger: React.ReactNode;
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 16);
}

export function ScheduleInterviewDialog({
  employerId,
  jobId,
  applicationId,
  candidateName,
  existing,
  trigger,
}: ScheduleInterviewDialogProps) {
  const schedule = useInterviewsStore((s) => s.schedule);
  const reschedule = useInterviewsStore((s) => s.reschedule);
  const isMutating = useInterviewsStore((s) => s.isMutating);

  const [open, setOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [mode, setMode] = useState<InterviewMode>("Remote");
  const [location, setLocation] = useState("");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewerNames, setInterviewerNames] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!open) return;
    setScheduledAt(toLocalInputValue(existing?.scheduledAt));
    setDurationMinutes(String(existing?.durationMinutes ?? 60));
    setMode(existing?.mode ?? "Remote");
    setLocation(existing?.location ?? "");
    setMeetingLink(existing?.meetingLink ?? "");
    setInterviewerNames(existing?.interviewerNames ?? "");
    setNotes(existing?.notes ?? "");
  }, [open, existing]);

  const canSubmit =
    scheduledAt.length > 0 &&
    Number(durationMinutes) >= 15 &&
    (mode !== "Onsite" || location.trim().length > 0) &&
    (mode !== "Remote" || meetingLink.trim().length > 0);

  const handleSubmit = async () => {
    const payload = {
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: Number(durationMinutes),
      mode,
      location: location || undefined,
      meetingLink: meetingLink || undefined,
      interviewerNames: interviewerNames || undefined,
      notes: notes || undefined,
    };

    const ok = existing
      ? await reschedule(employerId, jobId, applicationId, existing.interviewId, payload)
      : await schedule(employerId, jobId, applicationId, payload);
    if (ok) setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CalendarClock className="h-4 w-4" /> {existing ? "Reschedule" : "Schedule"} interview</DialogTitle>
          <DialogDescription>With {candidateName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Date & time</Label>
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Duration (minutes)</Label>
              <Input type="number" min={15} max={480} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Mode</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as InterviewMode)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {INTERVIEW_MODES.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mode === "Onsite" && (
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Office address" />
            </div>
          )}
          {mode === "Remote" && (
            <div className="space-y-2">
              <Label>Meeting link</Label>
              <Input value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://…" />
            </div>
          )}

          <div className="space-y-2">
            <Label>Interviewer(s)</Label>
            <Input value={interviewerNames} onChange={(e) => setInterviewerNames(e.target.value)} placeholder="e.g. Jane Doe, Engineering Manager" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything the candidate should prepare…" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isMutating} disabled={!canSubmit}>
            {existing ? "Save changes" : "Schedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
