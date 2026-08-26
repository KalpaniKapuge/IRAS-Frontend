import { useEffect, useState } from "react";
import { toast } from "sonner";
import { BookOpen, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { skillResourcesApi } from "../api";
import type { SkillResourceDto } from "../types";
import { ResourceFormDialog } from "../components/resource-form-dialog";

export function SkillResourcesPage() {
  const [resources, setResources] = useState<SkillResourceDto[] | null>(null);

  const load = () => skillResourcesApi.getAll().then(setResources);

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (resource: SkillResourceDto) => {
    try {
      await skillResourcesApi.remove(resource.resourceId);
      toast.success("Resource deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete resource.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Resources"
        description="Curated learning resources candidates see when a skill gap is detected — the concrete next step after feedback."
        actions={<ResourceFormDialog onSaved={load} />}
      />

      {resources === null ? (
        <RowSkeletonList count={4} />
      ) : resources.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No skill resources yet"
          description="Add resources so candidates have somewhere to go when they see a skill gap."
        />
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <Card key={resource.resourceId}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{resource.title}</p>
                    <Badge variant="secondary">{resource.skillName}</Badge>
                    <Badge variant="muted">{titleCase(resource.resourceType)}</Badge>
                    <Badge variant={resource.isActive ? "success" : "muted"}>{resource.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <ResourceFormDialog resource={resource} onSaved={load} />
                    <ConfirmAction
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title={`Delete "${resource.title}"?`}
                      variant="destructive"
                      confirmLabel="Delete"
                      onConfirm={() => handleDelete(resource)}
                    />
                  </div>
                </div>
                <a href={resource.url} target="_blank" rel="noreferrer" className="block truncate text-sm text-primary hover:underline">
                  {resource.url}
                </a>
                {resource.provider && <p className="text-xs text-muted-foreground">{resource.provider}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
