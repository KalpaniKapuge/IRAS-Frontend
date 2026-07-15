import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ collapsed = false, className }: { collapsed?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-sky-400 text-primary-foreground shadow-soft">
        <Sparkles className="h-5 w-5" />
      </div>
      {!collapsed && (
        <div className="leading-tight">
          <p className="text-sm font-bold tracking-tight text-foreground">IRAS</p>
          <p className="text-[11px] text-muted-foreground">Recruitment, automated</p>
        </div>
      )}
    </div>
  );
}
