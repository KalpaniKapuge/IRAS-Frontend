import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Camera, Download, Trash2, User } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { PageSpinner } from "@/components/shared/loading-state";
import { useEnterKeyNav } from "@/hooks/use-enter-key-navigation";
import { useCvStore } from "../store";
import { SectionOrderEditor } from "../components/section-order-editor";
import { SectionItemsEditor } from "../components/section-items-editor";
import { CvTemplatePicker } from "../components/cv-template-picker";
import { resolveCvTemplate } from "../components/templates";
import type { CvDetailDto, CvReferenceType, CvSectionType } from "../types";

const CV_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CV_PHOTO_MAX_BYTES = 2 * 1024 * 1024;

export function CvEditorPage() {
  const { cvId } = useParams();
  const navigate = useNavigate();
  const {
    currentCv, templates, isLoadingDetail, isSaving, isDownloading, isUploadingPhoto,
    loadDetail, loadTemplates, update, updateItems, uploadPhoto, remove, download, clearCurrent,
  } = useCvStore();

  const [title, setTitle] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [summary, setSummary] = useState("");
  const [sectionOrder, setSectionOrder] = useState<CvSectionType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { ref, onKeyDown, onFocus } = useEnterKeyNav<HTMLFormElement>();

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

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!CV_PHOTO_TYPES.includes(file.type)) {
      toast.error("Upload a JPG, PNG, or WebP photo.");
      return;
    }
    if (file.size > CV_PHOTO_MAX_BYTES) {
      toast.error("CV photo must be 2 MB or smaller.");
      return;
    }
    await uploadPhoto(currentCv.cvId, file);
  };

  const detailsDirty =
    title !== currentCv.title ||
    templateName !== currentCv.templateName ||
    (summary || "") !== (currentCv.summary ?? "") ||
    JSON.stringify(sectionOrder) !== JSON.stringify(currentCv.sectionOrder);

  // Reflects unsaved template/summary edits immediately in the preview, without
  // waiting for a save round trip — everything else (experience, education, skills,
  // photo) already lives on currentCv since those save independently per-section.
  const previewCv: CvDetailDto = { ...currentCv, templateName: templateName || currentCv.templateName, summary: summary || null };
  const PreviewTemplate = resolveCvTemplate(previewCv.templateName);

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

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form
                ref={ref}
                onKeyDownCapture={onKeyDown} onFocus={onFocus}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveDetails();
                }}
                noValidate
                className="space-y-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
                      {currentCv.photoUrl ? (
                        <img src={currentCv.photoUrl} alt="CV photo" className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept={CV_PHOTO_TYPES.join(",")} className="hidden" onChange={handlePhotoChange} />
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      loading={isUploadingPhoto}
                      disabled={isUploadingPhoto}
                      className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border border-background shadow-soft"
                      aria-label="Change CV photo"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {!isUploadingPhoto && <Camera className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="space-y-2 flex-1">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Template</Label>
                  <CvTemplatePicker templates={templates} value={templateName} onChange={setTemplateName} />
                </div>

                <div className="space-y-2">
                  <Label>Professional summary</Label>
                  <Textarea rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="A short summary of your background and goals…" />
                </div>
              </form>
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
                  <TabsTrigger value="Languages">Languages</TabsTrigger>
                  <TabsTrigger value="Projects">Projects</TabsTrigger>
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
                <TabsContent value="Languages">
                  <SectionItemsEditor referenceType="Language" items={currentCv.languages} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
                <TabsContent value="Projects">
                  <SectionItemsEditor referenceType="Project" items={currentCv.projects} onSave={handleSaveItems} isSaving={isSaving} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Section order</CardTitle>
              <CardDescription>Sections not listed here are left off the CV entirely.</CardDescription>
            </CardHeader>
            <CardContent>
              <SectionOrderEditor value={sectionOrder} onChange={setSectionOrder} />
            </CardContent>
          </Card>

          {detailsDirty && (
            <div className="flex justify-end">
              <Button type="button" onClick={handleSaveDetails} loading={isSaving}>Save details</Button>
            </div>
          )}
        </div>

        <div className="min-w-0 lg:sticky lg:top-20 lg:self-start">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Live preview</p>
          {/* The template has a fixed minimum width (like a real document page) rather than
              reflowing at arbitrary widths — this panel is often narrower than that, so it
              scrolls both ways instead of squeezing the template's columns and clipping text. */}
          <div className="max-h-[85vh] overflow-auto scrollbar-thin rounded-xl border border-border bg-muted/20 p-4">
            <PreviewTemplate cv={previewCv} />
          </div>
        </div>
      </div>
    </div>
  );
}
