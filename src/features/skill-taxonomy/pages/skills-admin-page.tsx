import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Search, Sparkles, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmAction } from "@/components/shared/confirm-action";
import { RowSkeletonList } from "@/components/shared/loading-state";
import { EmptyState } from "@/components/shared/empty-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { titleCase } from "@/lib/utils";
import { ApiError } from "@/types/common";
import { skillTaxonomyApi } from "../api";
import type { SkillDto } from "../types";
import { SkillFormDialog } from "../components/skill-form-dialog";
import { AliasManagerDialog } from "../components/alias-manager-dialog";

export function SkillsAdminPage() {
  const [skills, setSkills] = useState<SkillDto[] | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 300);

  const load = () =>
    skillTaxonomyApi.search(debouncedQuery || undefined, undefined, 1, 50).then((res) => {
      setSkills(res.items);
      setTotalCount(res.totalCount);
    });

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  const handleDelete = async (skill: SkillDto) => {
    try {
      await skillTaxonomyApi.remove(skill.skillId);
      toast.success(`"${skill.skillName}" deleted.`);
      load();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to delete skill.");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Skill Taxonomy"
        description={`${totalCount} skills powering resume parsing, ranking, and matching.`}
        actions={<SkillFormDialog onSaved={load} />}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search skills or aliases…" className="pl-9" />
      </div>

      {skills === null ? (
        <RowSkeletonList count={6} />
      ) : skills.length === 0 ? (
        <EmptyState icon={Sparkles} title="No skills found" />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Skill</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.skillId}>
                <TableCell className="font-medium">{skill.skillName}</TableCell>
                <TableCell><Badge variant="secondary">{titleCase(skill.category)}</Badge></TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">{skill.description ?? "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <AliasManagerDialog skill={skill} onChanged={load} />
                    <SkillFormDialog
                      skill={skill}
                      onSaved={load}
                      trigger={<Button variant="ghost" size="sm">Edit</Button>}
                    />
                    <ConfirmAction
                      trigger={
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      }
                      title={`Delete "${skill.skillName}"?`}
                      description="This fails safely if the skill is still used by any candidate or job."
                      variant="destructive"
                      confirmLabel="Delete"
                      onConfirm={() => handleDelete(skill)}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
