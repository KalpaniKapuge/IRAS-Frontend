import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { useAuthStore } from "@/features/auth/store";
import { ROLE_HOME } from "@/config/nav";
import { useUiStore } from "@/stores/ui-store";
import { getInitials } from "@/lib/utils";
import type { UserRole } from "@/types/enums";

const PROFILE_ROUTE: Partial<Record<UserRole, string>> = {
  Candidate: "/candidate/profile",
  Employer: "/employer/profile",
};

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const setMobileNavOpen = useUiStore((s) => s.setMobileNavOpen);
  const navigate = useNavigate();

  if (!user) return null;
  const [firstName, lastName] = user.email.split("@")[0].split(".");

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-1.5">
        <ThemeToggle />
        <NotificationBell />
        <button
          className="ml-1 flex items-center gap-2 rounded-full pr-1 transition-colors hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => navigate(PROFILE_ROUTE[user.role] ?? ROLE_HOME[user.role])}
          aria-label="Go to profile"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials(firstName, lastName)}</AvatarFallback>
          </Avatar>
        </button>
      </div>
    </header>
  );
}
