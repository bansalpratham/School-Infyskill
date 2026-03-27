import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, Trophy, AlertCircle, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

import { apiRequest } from "@/lib/api";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  target?: "teacher" | "student" | "both";
  status?: "PUBLISHED" | "DRAFT";
  isRead?: boolean;
  createdAt?: string;
};

const typeStyles = {
  message: { bg: "bg-info/10", icon: "text-info" },
  calendar: { bg: "bg-accent/10", icon: "text-accent" },
  achievement: { bg: "bg-warning/10", icon: "text-warning" },
  alert: { bg: "bg-success/10", icon: "text-success" },
};

const Notifications = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<any>(`/api/announcements?limit=100&status=PUBLISHED`);
      const rows: Announcement[] = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
    } catch (e: any) {
      setError(e?.message || "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = useMemo(() => items.filter((n) => !n.isRead).length, [items]);

  async function markRead(id: string) {
    try {
      await apiRequest(`/api/announcements/${id}/read`, { method: "PATCH" });
      setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch {
      // ignore
    }
  }

  async function markAllAsRead() {
    const unread = items.filter((n) => !n.isRead);
    if (unread.length === 0) return;
    try {
      setMarkingAll(true);
      await apiRequest(`/api/announcements/read/all?status=PUBLISHED`, { method: "PATCH" });
      await load();
    } finally {
      setMarkingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={markAllAsRead} disabled={markingAll || loading || !!error || unreadCount === 0}>
          <CheckCheck className="w-4 h-4" />
          {markingAll ? "Marking..." : "Mark all as read"}
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
        ) : error ? (
          <Card className="p-4 text-sm text-destructive">{error}</Card>
        ) : items.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No notifications.</Card>
        ) : items.map((notification, index) => {
          const styles = typeStyles.message;
          const Icon = Bell;
          
          return (
            <Card
              key={notification._id}
              className={cn(
                "p-4 flex items-start gap-4 transition-all duration-200 hover:shadow-card-hover cursor-pointer animate-slide-up",
                !notification.isRead && "border-l-4 border-l-primary bg-primary/5"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              onClick={() => {
                if (!notification.isRead) markRead(notification._id);
              }}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", styles.bg)}>
                <Icon className={cn("w-6 h-6", styles.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-semibold", !notification.isRead && "text-primary")}>
                    {notification.title}
                  </h4>
                  {!notification.isRead && (
                    <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ""}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
