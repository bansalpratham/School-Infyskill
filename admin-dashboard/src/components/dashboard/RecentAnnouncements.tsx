import { useEffect, useState } from "react";
import { Megaphone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { apiRequest } from "@/lib/api";

type Announcement = {
  _id: string;
  title: string;
  message: string;
  target?: "teacher" | "student" | "both";
  status?: "PUBLISHED" | "DRAFT";
  createdAt?: string;
};

function formatDate(value?: string) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function normalizeTarget(target?: string) {
  if (!target) return "All";
  if (target === "both") return "All";
  if (target === "teacher") return "Teachers";
  if (target === "student") return "Students";
  return target;
}

const priorityColors = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
};

const RecentAnnouncements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<any>("/api/announcements?limit=3&status=PUBLISHED");
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load announcements");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-card rounded-2xl p-5 lg:p-6 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-warning/10">
            <Megaphone className="w-5 h-5 text-warning" />
          </div>
          <h3 className="text-lg font-display font-semibold">Recent Announcements</h3>
        </div>
        <Button variant="ghost" size="sm">
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading announcements...</p>
        ) : error ? (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={load}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No announcements found.</p>
        ) : (
          items.map((announcement) => (
            <div
              key={announcement._id}
              className="p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium truncate">{announcement.title}</h4>
                    <Badge variant="outline" className={priorityColors.medium}>
                      medium
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{announcement.message}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {formatDate(announcement.createdAt)}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {normalizeTarget(announcement.target)}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentAnnouncements;
