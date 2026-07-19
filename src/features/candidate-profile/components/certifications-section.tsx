import { ChangeEvent, useRef, useState } from "react";
import { Award, ExternalLink, FileUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { useCandidateProfileStore } from "../store";
import type { CertificationDto, CertificationFormValues } from "../types";

const CERTIFICATE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const CERTIFICATE_MAX_BYTES = 10 * 1024 * 1024;

const emptyForm: CertificationFormValues = {
  name: "",
  issuingOrg: "",
  issueDate: null,
  expiryDate: null,
  certificateFile: null,
};

function validateCertificateFile(file: File) {
  if (!CERTIFICATE_TYPES.includes(file.type)) {
    toast.error("Upload a PDF, image, DOC, or DOCX certificate file.");
    return false;
  }

  if (file.size > CERTIFICATE_MAX_BYTES) {
    toast.error("Certificate file must be 10 MB or smaller.");
    return false;
  }

  return true;
}

export function CertificationsSection({
  candidateId,
  certifications,
}: {
  candidateId: number;
  certifications: CertificationDto[];
}) {
  const addCertification = useCandidateProfileStore((s) => s.addCertification);
  const uploadCertificationFile = useCandidateProfileStore((s) => s.uploadCertificationFile);
  const deleteCertification = useCandidateProfileStore((s) => s.deleteCertification);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CertificationFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const existingFileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addCertification(candidateId, form);
      setForm(emptyForm);
      setOpen(false);
    } catch {
      // The store shows the error toast. Keep the dialog open so the user can retry.
    } finally {
      setSaving(false);
    }
  };

  const handleFormFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = "";
    if (!file) return;
    if (!validateCertificateFile(file)) return;
    setForm({ ...form, certificateFile: file });
  };

  const handleExistingFileChange = async (certificationId: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!validateCertificateFile(file)) return;

    setUploadingId(certificationId);
    try {
      await uploadCertificationFile(candidateId, certificationId, file);
    } catch {
      // The store shows the error toast.
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Certifications</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add certification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Issuing organization</Label>
                <Input value={form.issuingOrg ?? ""} onChange={(e) => setForm({ ...form, issuingOrg: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Issue date</Label>
                  <Input
                    type="date"
                    value={form.issueDate?.slice(0, 10) ?? ""}
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value || null })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry date</Label>
                  <Input
                    type="date"
                    value={form.expiryDate?.slice(0, 10) ?? ""}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value || null })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Certificate file</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                  className="hidden"
                  onChange={handleFormFileChange}
                />
                <div className="flex flex-col gap-2 rounded-lg border border-dashed border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{form.certificateFile?.name ?? "No file selected"}</p>
                    <p className="text-xs text-muted-foreground">PDF, image, DOC, or DOCX up to 10 MB</p>
                  </div>
                  <Button type="button" variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <FileUp className="h-4 w-4" /> Choose file
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={saving} disabled={!form.name.trim()}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {certifications.length === 0 ? (
          <EmptyState icon={Award} title="No certifications added yet" className="py-8" />
        ) : (
          <ul className="space-y-3">
            {certifications.map((cert) => (
              <li key={cert.certificationId} className="flex items-start justify-between gap-3 rounded-lg border border-border p-4">
                <div className="min-w-0">
                  <p className="font-medium">{cert.name}</p>
                  {cert.issuingOrg && <p className="text-sm text-muted-foreground">{cert.issuingOrg}</p>}
                  {(cert.issueDate || cert.expiryDate) && (
                    <p className="text-xs text-muted-foreground">
                      {cert.issueDate ? formatDate(cert.issueDate, "MMM yyyy") : "-"}
                      {cert.expiryDate ? ` - ${formatDate(cert.expiryDate, "MMM yyyy")}` : ""}
                    </p>
                  )}
                  {cert.certificateUrl ? (
                    <a
                      href={cert.certificateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex max-w-full items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{cert.certificateFileName || "View certificate"}</span>
                    </a>
                  ) : (
                    <p className="mt-2 text-xs text-muted-foreground">No certificate file uploaded</p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <input
                    ref={(node) => {
                      existingFileInputRefs.current[cert.certificationId] = node;
                    }}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                    className="hidden"
                    onChange={(event) => handleExistingFileChange(cert.certificationId, event)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    loading={uploadingId === cert.certificationId}
                    aria-label={cert.certificateUrl ? "Replace certificate file" : "Upload certificate file"}
                    onClick={() => existingFileInputRefs.current[cert.certificationId]?.click()}
                  >
                    {uploadingId !== cert.certificationId && <FileUp className="h-3.5 w-3.5" />}
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title="Remove this certification?"
                    variant="destructive"
                    confirmLabel="Remove"
                    onConfirm={() => deleteCertification(candidateId, cert.certificationId)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
