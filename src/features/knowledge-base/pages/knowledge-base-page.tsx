import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileStack, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/format";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { knowledgeBaseApi } from "../api";
import type { KnowledgeBaseDto } from "../types";
import { KbFormDialog } from "../components/kb-form-dialog";

export function KnowledgeBasePage() {
  const [entries, setEntries] = useState<KnowledgeBaseDto[] | null>(null);

  const load = () => knowledgeBaseApi.getAll().then(setEntries);

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (entry: KnowledgeBaseDto) => {
    try {
      await knowledgeBaseApi.remove(entry.kbId);
      toast.success("Entry deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete entry.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Chatbot Knowledge Base"
        description="Curated Q&A content the recruitment assistant draws on to answer platform questions."
        actions={<KbFormDialog onSaved={load} />}
      />

      {entries === null ? (
        <RowSkeletonList count={4} />
      ) : entries.length === 0 ? (
        <EmptyState icon={FileStack} title="No knowledge base entries yet" />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <Card key={entry.kbId}>
              <CardContent className="space-y-2 p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{entry.title}</p>
                    <Badge variant="secondary">{titleCase(entry.category)}</Badge>
                    <Badge variant={entry.isActive ? "success" : "muted"}>{entry.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="flex gap-1">
                    <KbFormDialog entry={entry} onSaved={load} />
                    <ConfirmAction
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title={`Delete "${entry.title}"?`}
                      variant="destructive"
                      confirmLabel="Delete"
                      onConfirm={() => handleDelete(entry)}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{entry.content}</p>
                <p className="text-xs text-muted-foreground/70">Updated {formatDate(entry.updatedAt)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
