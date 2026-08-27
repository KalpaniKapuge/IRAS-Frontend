import { useEffect, useState } from "react";
import { CalendarClock, ExternalLink } from "lucide-react";
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
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useInterviewsStore } from "../store";
import type { InterviewDto } from "../types";

const MEETING_PROVIDERS = [
  { key: "zoom", label: "Zoom", createUrl: "https://zoom.us/meeting/schedule" },
  { key: "meet", label: "Google Meet", createUrl: "https://meet.google.com/new" },
  { key: "teams", label: "Microsoft Teams", createUrl: "https://teams.microsoft.com/l/meeting/new" },
] as const;
type MeetingProviderKey = (typeof MEETING_PROVIDERS)[number]["key"];

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
  const [meetingProvider, setMeetingProvider] = useState<MeetingProviderKey>("zoom");
  const [meetingLink, setMeetingLink] = useState("");
  const [interviewerNames, setInterviewerNames] = useState("");
  const [notes, setNotes] = useState("");
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  useEffect(() => {
    if (!open) return;
    setScheduledAt(toLocalInputValue(existing?.scheduledAt));
    setDurationMinutes(String(existing?.durationMinutes ?? 60));
    setMode(existing?.mode ?? "Remote");
    setLocation(existing?.location ?? "");
    setMeetingProvider("zoom");
    setMeetingLink(existing?.meetingLink ?? "");
    setInterviewerNames(existing?.interviewerNames ?? "");
    setNotes(existing?.notes ?? "");
  }, [open, existing]);

  const createMeeting = () => {
    const provider = MEETING_PROVIDERS.find((p) => p.key === meetingProvider);
    if (provider) window.open(provider.createUrl, "_blank", "noopener,noreferrer");
  };

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

        <form
          ref={ref}
          onKeyDownCapture={onKeyDown} onFocus={onFocus}
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          noValidate
          className="space-y-4"
        >
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
            <div className="space-y-3 rounded-lg border border-dashed border-border p-3">
              <div className="space-y-2">
                <Label>Meeting provider</Label>
                <Select value={meetingProvider} onValueChange={(v) => setMeetingProvider(v as MeetingProviderKey)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {MEETING_PROVIDERS.map((p) => (
                      <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meeting link</Label>
                <div className="flex gap-2">
                  <Input
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                    placeholder="https://…"
                    className="flex-1"
                  />
                  <Button type="button" variant="secondary" className="gap-1.5 shrink-0" onClick={createMeeting}>
                    <ExternalLink className="h-3.5 w-3.5" /> Create meeting
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Opens {MEETING_PROVIDERS.find((p) => p.key === meetingProvider)?.label} to create a real meeting — paste the link it gives you back here.
                </p>
              </div>
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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={isMutating} disabled={!canSubmit}>
              {existing ? "Save changes" : "Schedule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
