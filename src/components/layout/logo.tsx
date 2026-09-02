import { cn } from "@/lib/utils";

// Merito mark: one continuous stroke that reads as a checkmark on the way in and an
// upward arrow on the way out — a validated match that leads to growth. Uses
// `currentColor` so it inherits whatever text colour the container sets (white on the
// gradient tile, or the foreground token elsewhere).
function MeritoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 11.5 8.5 18 19 4.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 4.5H19V11"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-soft">
        <MeritoMark className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-foreground">Merito</p>
          <p className="text-[11px] text-muted-foreground">Hiring on merit.</p>
        </div>
      )}
    </div>
  );
}
