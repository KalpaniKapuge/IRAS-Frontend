import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Building2, Camera } from "lucide-react";
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
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { FieldError } from "@/components/shared/field-error";
import { isValidUrl } from "@/lib/validation";
import { employerProfileApi } from "../api";
import type { EmployerProfileDto } from "../types";

const LOGO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const LOGO_MAX_BYTES = 2 * 1024 * 1024;

export function EmployerProfilePage() {
  const employerId = useAuthStore((s) => s.user!.userId);
  const [profile, setProfile] = useState<EmployerProfileDto | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState<CompanySize>("Small");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [websiteError, setWebsiteError] = useState<string | undefined>();

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

  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

  if (!profile) return <PageSpinner label="Loading company profile…" />;

  const handleSave = async () => {
    if (!isValidUrl(website)) {
      setWebsiteError("Enter a valid URL (e.g. https://yourcompany.com).");
      return;
    }
    setWebsiteError(undefined);

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

  const handleLogoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!LOGO_TYPES.includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP logo.");
      return;
    }

    if (file.size > LOGO_MAX_BYTES) {
      toast.error("Company logo must be 2 MB or smaller.");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const updated = await employerProfileApi.uploadLogo(employerId, file);
      setProfile(updated);
      toast.success("Company logo updated.");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to upload company logo.");
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <form
      ref={ref}
      onKeyDownCapture={onKeyDown} onFocus={onFocus}
      onSubmit={(e) => {
        e.preventDefault();
        handleSave();
      }}
      noValidate
      className="space-y-6"
    >
      <PageHeader title="Company Profile" description="This information appears on your job postings and helps candidates learn about you." />

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-border bg-primary/10 text-primary">
                {profile.logoUrl ? (
                  <img src={profile.logoUrl} alt={`${profile.companyName} logo`} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={LOGO_TYPES.join(",")}
                className="hidden"
                onChange={handleLogoChange}
              />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                loading={isUploadingLogo}
                disabled={isUploadingLogo}
                className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full border border-background shadow-soft"
                aria-label="Upload company logo"
                onClick={() => fileInputRef.current?.click()}
              >
                {!isUploadingLogo && <Camera className="h-3 w-3" />}
              </Button>
            </div>
            <div>
              <p className="font-semibold">{profile.companyName}</p>
              <p className="text-sm text-muted-foreground">Employer account</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Company name</Label>
              <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} maxLength={150} />
            </div>
            <div className="space-y-2">
              <Label>Industry</Label>
              <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Software & IT Services" maxLength={100} />
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
              <Input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://…"
                aria-invalid={!!websiteError}
                className={websiteError ? "border-destructive focus-visible:ring-destructive" : undefined}
              />
              <FieldError message={websiteError} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} maxLength={150} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>About the company</Label>
              <Textarea rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" loading={isSaving}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
