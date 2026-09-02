import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/shared/loading-state";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ApiError } from "@/types/common";
import { cn, titleCase } from "@/lib/utils";
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
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 300);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);

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

  // The result set changes on every keystroke (new search, items filtered out as they're
  // added elsewhere) — reset the highlight each time so it never points past the end or
  // sits on a stale item.
  useEffect(() => {
    setHighlightedIndex(0);
  }, [visible.length, debouncedQuery]);

  const selectSkill = (skill: SkillDto) => {
    onSelect(skill);
    setQuery("");
    setResults([]);
  };

  // Genuinely no match anywhere in the taxonomy — not merely "already added" (that case
  // filters `visible` to empty while `results` still has the match), so this is the only
  // situation where offering to create a brand-new skill is correct.
  const canQuickAdd = !isLoading && results.length === 0 && debouncedQuery.trim().length >= 2;

  const handleQuickAdd = async () => {
    const name = debouncedQuery.trim();
    if (!name) return;
    setIsAdding(true);
    try {
      const skill = await skillTaxonomyApi.quickAdd(name);
      selectSkill(skill);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to add this skill.");
    } finally {
      setIsAdding(false);
    }
  };

  const moveHighlight = (delta: number) => {
    if (visible.length === 0) return;
    setHighlightedIndex((i) => {
      const next = (i + delta + visible.length) % visible.length;
      optionRefs.current[next]?.scrollIntoView({ block: "nearest" });
      return next;
    });
  };

  return (
    // data-enter-skip opts this whole widget out of the app-wide "Enter moves to the next
    // form field" behavior (useEnterKeyNav) — Enter here means "confirm the highlighted
    // skill", not "leave this field", so it needs to keep its own Enter/Arrow handling.
    <div className="relative" data-enter-skip>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          // Not role="combobox": that exact role string is special-cased by useEnterKeyNav
          // (src/hooks/use-enter-key-navigation.ts) to mean "a Radix Select trigger" and would
          // route Enter through its Select-specific open/confirm/advance logic instead of the
          // data-enter-skip escape hatch this widget relies on for its own Enter handling below.
          role="searchbox"
          aria-expanded={open}
          aria-controls="skill-picker-listbox"
          aria-activedescendant={visible[highlightedIndex] ? `skill-picker-option-${visible[highlightedIndex].skillId}` : undefined}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setOpen(true);
              moveHighlight(1);
              return;
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              moveHighlight(-1);
              return;
            }
            if (e.key === "Escape") {
              if (open) {
                e.preventDefault();
                e.stopPropagation();
                setOpen(false);
              }
              return;
            }
            if (e.key !== "Enter") return;
            if (visible.length > 0) {
              e.preventDefault();
              e.stopPropagation();
              selectSkill(visible[highlightedIndex] ?? visible[0]);
              return;
            }
            if (canQuickAdd) {
              e.preventDefault();
              e.stopPropagation();
              handleQuickAdd();
            }
          }}
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
        <div id="skill-picker-listbox" role="listbox" className="absolute z-20 mt-1.5 max-h-64 w-full overflow-y-auto scrollbar-thin rounded-lg border border-border bg-popover p-1 shadow-elevated">
          {isLoading && visible.length === 0 && (
            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
              <Spinner /> Searching…
            </div>
          )}
          {canQuickAdd && (
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleQuickAdd}
              disabled={isAdding}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-primary hover:bg-accent disabled:opacity-60"
            >
              {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add “{debouncedQuery.trim()}” as a new skill
            </button>
          )}
          {!isLoading && visible.length === 0 && !canQuickAdd && (
            <p className="px-3 py-3 text-sm text-muted-foreground">No matching skills found.</p>
          )}
          {visible.map((skill, index) => (
            <button
              key={skill.skillId}
              id={`skill-picker-option-${skill.skillId}`}
              ref={(el) => { optionRefs.current[index] = el; }}
              role="option"
              aria-selected={index === highlightedIndex}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectSkill(skill)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
                index === highlightedIndex ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
              )}
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
