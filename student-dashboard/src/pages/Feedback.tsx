import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { apiRequest, getCurrentUser } from "@/lib/api";

type FeedbackItem = { _id: string; message: string; createdAt?: string };

export default function Feedback() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || "").trim();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        if (!studentId) {
          setItems([]);
          setError("Student id missing. Please log in again.");
          return;
        }
        const res = await apiRequest<any>(`/api/teacher/feedback/student/${encodeURIComponent(studentId)}`);
        setItems(Array.isArray(res?.data) ? res.data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load feedback");
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Feedback</h1>
        <p className="text-muted-foreground">Messages shared by your teachers</p>
      </div>

      {loading ? (
        <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
      ) : error ? (
        <Card className="p-4 text-sm text-destructive">{error}</Card>
      ) : items.length === 0 ? (
        <Card className="p-4 text-sm text-muted-foreground">No feedback yet.</Card>
      ) : (
        <div className="space-y-3">
          {items.map((it) => (
            <Card key={it._id} className="p-4">
              <p className="text-sm text-foreground">{it.message}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {it.createdAt ? new Date(it.createdAt).toLocaleString() : ""}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
