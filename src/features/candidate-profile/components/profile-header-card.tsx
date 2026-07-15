import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EDUCATION_LEVELS } from "@/types/enums";
import { getInitials, titleCase } from "@/lib/utils";
import { useCandidateProfileStore } from "../store";
import type { CandidateProfileDto } from "../types";

export function ProfileHeaderCard({ profile, candidateId }: { profile: CandidateProfileDto; candidateId: number }) {
  const updateProfile = useCandidateProfileStore((s) => s.updateProfile);
  const isSaving = useCandidateProfileStore((s) => s.isSaving);
  const [editing, setEditing] = useState(false);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [headline, setHeadline] = useState(profile.headline ?? "");
  const [citizenship, setCitizenship] = useState(profile.citizenship ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [educationLevel, setEducationLevel] = useState(profile.educationLevel);
  const [optInMatching, setOptInMatching] = useState(profile.optInMatching);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setHeadline(profile.headline ?? "");
    setCitizenship(profile.citizenship ?? "");
    setPhone(profile.phone ?? "");
    setEducationLevel(profile.educationLevel);
    setOptInMatching(profile.optInMatching);
  }, [profile]);

  const handleSave = async () => {
    await updateProfile(candidateId, {
      firstName,
      lastName,
      headline: headline || undefined,
      citizenship: citizenship || undefined,
      phone: phone || undefined,
      educationLevel,
      optInMatching,
    });
    setEditing(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 text-lg">
            <AvatarFallback>{getInitials(profile.firstName, profile.lastName)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">
              {profile.firstName} {profile.lastName}
            </CardTitle>
            <CardDescription>{profile.headline || "Add a headline to stand out to employers"}</CardDescription>
          </div>
        </div>
        <Button variant={editing ? "outline" : "secondary"} size="sm" onClick={() => setEditing((v) => !v)}>
          {editing ? "Cancel" : "Edit profile"}
        </Button>
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <p className="text-muted-foreground">Citizenship</p>
              <p className="font-medium">{profile.citizenship || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{profile.phone || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Education level</p>
              <p className="font-medium">{titleCase(profile.educationLevel)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total experience</p>
              <p className="font-medium">{profile.totalExpYears} yrs</p>
            </div>
            <div className="col-span-2 sm:col-span-4">
              <p className="text-muted-foreground">Automated job matching</p>
              <p className="font-medium">{profile.optInMatching ? "Enabled — you'll be notified of strong matches" : "Disabled"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Headline</Label>
              <Input
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="e.g. Backend Engineer specializing in .NET & distributed systems"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Citizenship</Label>
                <Input value={citizenship} onChange={(e) => setCitizenship(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Education level</Label>
                <Select value={educationLevel} onValueChange={(v) => setEducationLevel(v as typeof educationLevel)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {titleCase(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Enable automated job matching</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when a newly posted job strongly matches your profile.
                </p>
              </div>
              <Switch checked={optInMatching} onCheckedChange={setOptInMatching} />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleSave} loading={isSaving}>
                Save changes
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
