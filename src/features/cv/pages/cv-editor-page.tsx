import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Download, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { PageSpinner } from "@/components/shared/loading-state";
import { useCvStore } from "../store";
import { SectionOrderEditor } from "../components/section-order-editor";
import { SectionItemsEditor } from "../components/section-items-editor";
import type { CvReferenceType, CvSectionType } from "../types";

export function CvEditorPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const { currentCv, templates, isLoadingDetail, isSaving, isDownloading, loadDetail, loadTemplates, update, updateItems, remove, download, clearCurrent } =
    useCvStore();

  const [title, setTitle] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [summary, setSummary] = useState("");
  const [sectionOrder, setSectionOrder] = useState<CvSectionType[]>([]);

  useEffect(() => {
    if (cvId) loadDetail(Number(cvId));
    loadTemplates();
    return () => clearCurrent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvId]);

  useEffect(() => {
    if (!currentCv) return;
    setTitle(currentCv.title);
    setTemplateName(currentCv.templateName);
    setSummary(currentCv.summary ?? "");
    setSectionOrder(currentCv.sectionOrder);
  }, [currentCv]);

  if (isLoadingDetail || !currentCv) return <PageSpinner label="Loading CV…" />;

  const handleSaveDetails = () => {
    update(currentCv.cvId, { title: title.trim(), templateName, summary: summary || undefined, sectionOrder });
  };

  const handleSaveItems = (referenceType: CvReferenceType, orderedIncludedIds: number[]) => {
    updateItems(currentCv.cvId, { referenceType, referenceIds: orderedIncludedIds });
  };

  const handleDelete = async () => {
    const ok = await remove(currentCv.cvId);
    if (ok) navigate("/candidate/cvs");
  };

  const detailsDirty =
    title !== currentCv.title ||
    templateName !== currentCv.templateName ||
    (summary || "") !== (currentCv.summary ?? "") ||
    JSON.stringify(sectionOrder) !== JSON.stringify(currentCv.sectionOrder);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2 gap-1.5" onClick={() => navigate("/candidate/cvs")}>
        <ArrowLeft className="h-4 w-4" /> All CVs
      </Button>

      <PageHeader
        title={currentCv.title}
        description="Customize which sections and profile items appear, then download as a polished PDF."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => download(currentCv.cvId, `${currentCv.title.replace(/\s+/g, "-").toLowerCase()}.pdf`)}
              loading={isDownloading}
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <ConfirmAction
              trigger={
                <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              }
              title="Delete this CV?"
              description="This cannot be undone."
              variant="destructive"
              confirmLabel="Delete"
              onConfirm={handleDelete}
            />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Template</Label>
                  <Select value={templateName} onValueChange={setTemplateName}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {templates.map((t) => (
                        <SelectItem key={t.name} value={t.name}>{t.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Professional summary</Label>
                <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A short summary of your background and goals…" />
              </div>
              {detailsDirty && (
                <div className="flex justify-end">
                  <Button onClick={handleSaveDetails} loading={isSaving}>Save details</Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content</CardTitle>
              <CardDescription>Pick which items from your profile to include, and their order, per section.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="Experience">
                <TabsList>
                  <TabsTrigger value="Experience">Experience</TabsTrigger>
                  <TabsTrigger value="Education">Education</TabsTrigger>
                  <TabsTrigger value="Certifications">Certifications</TabsTrigger>
                  <TabsTrigger value="Skills">Skills</TabsTrigger>
                </TabsList>
                <TabsContent value="Experience">
                  <SectionItemsEditor referenceType="Experience" items={currentCv.experience} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
                <TabsContent value="Education">
                  <SectionItemsEditor referenceType="Education" items={currentCv.education} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
                <TabsContent value="Certifications">
                  <SectionItemsEditor referenceType="Certification" items={currentCv.certifications} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
                <TabsContent value="Skills">
                  <SectionItemsEditor referenceType="Skill" items={currentCv.skills} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Section order</CardTitle>
            <CardDescription>Sections not listed here are left off the CV entirely.</CardDescription>
          </CardHeader>
          <CardContent>
            <SectionOrderEditor value={sectionOrder} onChange={setSectionOrder} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
