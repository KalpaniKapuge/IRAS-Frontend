import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Building2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageSpinner } from "@/components/shared/loading-state";
import { ApiError } from "@/types/common";
import { COMPANY_SIZES, type CompanySize } from "@/types/enums";
import { useAuthStore } from "@/features/auth/store";
import { employerProfileApi } from "../api";
import type { EmployerProfileDto } from "../types";

export function EmployerProfilePage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const [profile, setProfile] = useState<EmployerProfileDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize>("Small");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const load = () =>
    employerProfileApi.get(employerId).then((p) => {
      setProfile(p);
      setCompanyName(p.companyName);
      setIndustry(p.industry ?? "");
      setCompanySize(p.companySize);
      setWebsite(p.website ?? "");
      setLocation(p.location ?? "");
      setDescription(p.description ?? "");
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerId]);

  if (!profile) return <PageSpinner label="Loading company profile…" />;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await employerProfileApi.update(employerId, {
        companyName,
        industry: industry || undefined,
        companySize,
        website: website || undefined,
        location: location || undefined,
        description: description || undefined,
      });
      await load();
      toast.success("Company profile updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to update company profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Company Profile" description="This information appears on your job postings and helps candidates learn about you." />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold">{profile.companyName}</p>
              <p className="text-sm text-muted-foreground">Employer account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Software & IT Services" />
            </div>
            <div className="space-y-2">
              <Label>Company size</Label>
              <Select value={companySize} onValueChange={(v) => setCompanySize(v as CompanySize)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Website</Label>
              <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>About the company</Label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={isSaving}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
