import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { useAuthStore } from "@/features/auth/store";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../store";
import { notificationLink } from "../notification-link";
import type { NotificationDto } from "../types";

export function NotificationBell() {
  const { items, fetch, markAsRead, remove, unreadCount } = useNotificationStore();
  const role = useAuthStore((s) => s.user?.role) ?? "Candidate";
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const unread = unreadCount();

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenNotification = (n: NotificationDto) => {
    if (!n.isRead) markAsRead(n.notificationId);
    const link = notificationLink(n, role);
    if (link) {
      setOpen(false);
      navigate(link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-[1.1rem] w-[1.1rem]" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs"
              onClick={() => items.filter((n) => !n.isRead).forEach((n) => markAsRead(n.notificationId))}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
        <Separator />
        {items.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="You're all caught up"
            description="New job matches, application updates, and feedback will show up here."
            className="border-none py-10"
          />
        ) : (
          <ScrollArea className="h-96">
            <ul>
              {items.map((n) => {
                const link = notificationLink(n, role);
                return (
                  <li key={n.notificationId} className="group relative border-b border-border last:border-0">
                    <button
                      onClick={() => handleOpenNotification(n)}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3 pr-10 text-left transition-colors hover:bg-muted/50",
                        !n.isRead && "bg-primary/5",
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                        <p className="text-sm font-medium text-foreground">{n.title}</p>
                      </div>
                      <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{n.message}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground/70">
                        <span>{formatRelative(n.createdAt)}</span>
                        {link && (
                          <span className="flex items-center font-medium text-primary">
                            View details
                            <ChevronRight className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </button>
                    <button
                      onClick={() => remove(n.notificationId)}
                      aria-label="Delete notification"
                      className="absolute right-2 top-2.5 rounded-md p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
