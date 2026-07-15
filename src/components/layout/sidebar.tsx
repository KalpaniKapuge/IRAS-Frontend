import { NavLink } from "react-router-dom";
import { ChevronsLeft, ChevronsRight, LogOut } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NAV_BY_ROLE, ROLE_LABEL } from "@/config/nav";
import { useAuthStore } from "@/features/auth/store";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  if (!user) return null;
  const sections = NAV_BY_ROLE[user.role];

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className={cn("flex items-center px-4 py-5", collapsed ? "justify-center px-2" : "justify-between")}>
        <Logo collapsed={collapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-7 w-7 shrink-0 text-sidebar-foreground/70 hover:text-sidebar-foreground lg:inline-flex"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        </Button>
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
        {sections.map((section, i) => (
          <div key={i} className={cn(i > 0 && "mt-6")}>
            {section.title && !collapsed && (
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
                {section.title}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                        collapsed && "justify-center",
                      )
                    }
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <Separator className="bg-sidebar-border" />

      <div className={cn("p-3", collapsed && "flex justify-center")}>
        {!collapsed && (
          <div className="mb-2 rounded-lg bg-sidebar-accent/40 px-3 py-2">
            <p className="truncate text-xs font-medium text-sidebar-foreground">{user.email}</p>
            <p className="text-[11px] text-sidebar-foreground/60">{ROLE_LABEL[user.role]}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className="w-full justify-start gap-2 text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sign out"}
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);

  return (
    <aside
      className={cn(
        "hidden shrink-0 border-r border-sidebar-border transition-all duration-200 lg:block",
        collapsed ? "w-[76px]" : "w-64",
      )}
    >
      <div className="fixed h-screen" style={{ width: collapsed ? 76 : 256 }}>
        <SidebarContent />
      </div>
    </aside>
  );
}
