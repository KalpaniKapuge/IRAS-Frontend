import { useEffect, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/loading-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { titleCase } from "@/lib/utils";
import { skillTaxonomyApi } from "../api";
import type { SkillDto } from "../types";

interface SkillPickerProps {
  onSelect: (skill: SkillDto) => void;
  excludeIds?: number[];
  placeholder?: string;
}

/** Search-as-you-type skill selector backed by GET /api/skills. */
export function SkillPicker({ onSelect, excludeIds = [], placeholder = "Search skills (e.g. React, SQL Server)…" }: SkillPickerProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SkillDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setIsLoading(true);
    skillTaxonomyApi
      .search(debouncedQuery, undefined, 1, 15)
      .then((res) => {
        if (!cancelled) setResults(res.items);
      })
      .finally(() => !cancelled && setIsLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const visible = results.filter((s) => !excludeIds.includes(s.skillId));

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={placeholder}
          className="pl-9 pr-9"
        />
        {isLoading && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />}
        {!isLoading && query && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => setQuery("")}
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && debouncedQuery.trim().length >= 2 && (
        <div className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto scrollbar-thin rounded-lg border border-border bg-popover p-1 shadow-elevated">
          {isLoading && visible.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Spinner /> Searching…
            </div>
          )}
          {!isLoading && visible.length === 0 && (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matching skills found.</p>
          )}
          {visible.map((skill) => (
            <button
              key={skill.skillId}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onSelect(skill);
                setQuery("");
                setResults([]);
              }}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span className="font-medium">{skill.skillName}</span>
              <span className="text-xs text-muted-foreground">{titleCase(skill.category)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
