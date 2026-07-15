import { useEffect } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/empty-state";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useNotificationStore } from "../store";

export function NotificationBell() {
  const { items, fetch, markAsRead, unreadCount } = useNotificationStore();
  const unread = unreadCount();

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Popover>
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
              {items.map((n) => (
                <li key={n.notificationId}>
                  <button
                    onClick={() => !n.isRead && markAsRead(n.notificationId)}
                    className={cn(
                      "flex w-full flex-col gap-1 border-b border-border px-4 py-3 text-left transition-colors last:border-0 hover:bg-muted/50",
                      !n.isRead && "bg-primary/5",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      {!n.isRead && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-[11px] text-muted-foreground/70">{formatRelative(n.createdAt)}</p>
                  </button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  );
}
