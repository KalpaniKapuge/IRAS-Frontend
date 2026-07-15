import { useState } from "react";
import { Award, Plus, Trash2 } from "lucide-react";
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

const emptyForm: CertificationFormValues = { name: "", issuingOrg: "", issueDate: null, expiryDate: null };

export function CertificationsSection({
  candidateId,
  certifications,
}: {
  candidateId: number;
  certifications: CertificationDto[];
}) {
  const addCertification = useCandidateProfileStore((s) => s.addCertification);
  const deleteCertification = useCandidateProfileStore((s) => s.deleteCertification);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<CertificationFormValues>(emptyForm);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addCertification(candidateId, form);
      setForm(emptyForm);
      setOpen(false);
    } finally {
      setSaving(false);
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
                    onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry date</Label>
                  <Input
                    type="date"
                    value={form.expiryDate?.slice(0, 10) ?? ""}
                    onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} loading={saving} disabled={!form.name}>
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
                <div>
                  <p className="font-medium">{cert.name}</p>
                  {cert.issuingOrg && <p className="text-sm text-muted-foreground">{cert.issuingOrg}</p>}
                  {(cert.issueDate || cert.expiryDate) && (
                    <p className="text-xs text-muted-foreground">
                      {cert.issueDate ? formatDate(cert.issueDate, "MMM yyyy") : "—"}
                      {cert.expiryDate ? ` – ${formatDate(cert.expiryDate, "MMM yyyy")}` : ""}
                    </p>
                  )}
                </div>
                <ConfirmAction
                  trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  }
                  title="Remove this certification?"
                  variant="destructive"
                  confirmLabel="Remove"
                  onConfirm={() => deleteCertification(candidateId, cert.certificationId)}
                />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
