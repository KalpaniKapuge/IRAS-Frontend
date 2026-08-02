import { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { CardSkeletonGrid } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { useCvStore } from "../store";
import { CvFormDialog } from "../components/cv-form-dialog";

export function CvListPage() {
  const { cvs, isLoadingList, loadMine, remove } = useCvStore();

  useEffect(() => {
    loadMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My CVs"
        description="Build multiple tailored CVs from your profile data, choose a template, and download as PDF."
        actions={<CvFormDialog />}
      />

      {isLoadingList && cvs.length === 0 ? (
        <CardSkeletonGrid count={3} />
      ) : cvs.length === 0 ? (
        <EmptyState icon={FileText} title="No CVs yet" description="Create your first CV to get started." action={<CvFormDialog />} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cvs.map((cv) => (
            <Card key={cv.cvId} className="transition-shadow hover:shadow-elevated">
              <CardContent className="flex h-full flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link to={`/candidate/cvs/${cv.cvId}`} className="font-semibold hover:underline">
                      {cv.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">Updated {formatDate(cv.updatedAt)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{cv.templateName}</Badge>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                  <Button variant="secondary" size="sm" asChild>
                    <Link to={`/candidate/cvs/${cv.cvId}`}>Edit</Link>
                  </Button>
                  <ConfirmAction
                    trigger={
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    }
                    title={`Delete "${cv.title}"?`}
                    description="This cannot be undone."
                    variant="destructive"
                    confirmLabel="Delete"
                    onConfirm={() => remove(cv.cvId).then((ok) => { if (ok) loadMine(); })}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
