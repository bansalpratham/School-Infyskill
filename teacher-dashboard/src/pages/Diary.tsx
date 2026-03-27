import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Calendar, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { apiRequest, getCurrentUser } from "@/lib/api";

type DiaryEntry = {
  _id: string;
  teacherId: string;
  className: string;
  subject: string;
  date: string;
  homework?: string;
  remarks?: string;
};

type AssignedClass = {
  _id: string;
  name: string;
  section: string;
  subjects?: string[];
};

function toClassName(c: Pick<AssignedClass, 'name' | 'section'>) {
  return `${c.name}-${c.section}`;
}

const Diary = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [className, setClassName] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [homework, setHomework] = useState("");
  const [remarks, setRemarks] = useState("");

  async function loadAssignedClasses() {
    try {
      if (!teacherId) {
        setAssignedClasses([]);
        setClassName("");
        return;
      }

      const res = await apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`);
      const items: AssignedClass[] = Array.isArray(res?.data) ? res.data : [];
      setAssignedClasses(items);

      if (!className && items.length) {
        setClassName(toClassName(items[0]));
      }
    } catch (e: any) {
      console.error("[Teacher Diary] Failed to load assigned classes", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setAssignedClasses([]);
    }
  }

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [entries]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!teacherId) {
        setEntries([]);
        setError("Teacher id missing. Please log in again.");
        return;
      }
      const res = await apiRequest<any>(`/api/teacher/diary?limit=100&teacherId=${encodeURIComponent(teacherId)}`);
      const items: DiaryEntry[] = Array.isArray(res?.data) ? res.data : [];
      setEntries(items);
    } catch (e: any) {
      console.error("[Teacher Diary] Failed to load diary entries", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setError(e?.message || "Failed to load diary entries");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedClasses();
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher id missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      teacherId,
      className: className.trim(),
      subject: subject.trim(),
      date,
      homework: homework.trim() || undefined,
      remarks: remarks.trim() || undefined,
    };

    if (!payload.className || !payload.subject || !payload.date || (!payload.homework && !payload.remarks)) {
      toast({
        title: "Error",
        description: "class, subject, date, and at least homework or remarks are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      await apiRequest("/api/teacher/diary", {
        method: "POST",
        body: payload,
      });

      toast({
        title: "Diary Entry Added",
        description: "The diary entry has been recorded.",
      });

      setIsAddingNew(false);
      setHomework("");
      setRemarks("");
      await load();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create diary entry",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Diary</h1>
          <p className="text-muted-foreground">Record and share homework & remarks with parents</p>
        </div>
        <Button onClick={() => setIsAddingNew(!isAddingNew)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* New Entry Form */}
      {isAddingNew && (
        <Card className="p-6 animate-slide-up">
          <h3 className="font-semibold text-lg mb-4">Add New Diary Entry</h3>
          <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {assignedClasses.length === 0 ? (
                    <SelectItem value="__none__" disabled>
                      No assigned classes
                    </SelectItem>
                  ) : (
                    assignedClasses.map((c) => {
                      const v = toClassName(c);
                      return (
                        <SelectItem key={c._id} value={v}>
                          Class {v}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="Algebra">Algebra</SelectItem>
                  <SelectItem value="Geometry">Geometry</SelectItem>
                  <SelectItem value="Statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Homework</label>
              <Textarea placeholder="Enter homework details..." rows={3} value={homework} onChange={(e) => setHomework(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Remarks / Notes</label>
              <Textarea placeholder="Any additional remarks for parents..." rows={2} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button type="submit" className="gap-2" disabled={creating}>
              <Send className="w-4 h-4" />
              {creating ? "Sending..." : "Send to Parents"}
            </Button>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
          </div>
          </form>
        </Card>
      )}

      {/* Diary Entries */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
        ) : error ? (
          <Card className="p-4 text-sm text-destructive">{error}</Card>
        ) : sorted.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No diary entries yet.</Card>
        ) : sorted.map((entry, index) => (
          <Card 
            key={entry._id} 
            className="p-5 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{entry.subject}</h3>
                  <p className="text-sm text-muted-foreground">Class {entry.className}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm font-medium text-muted-foreground mb-1">Homework</p>
                <p>{entry.homework || '-'}</p>
              </div>
              {entry.remarks && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">Remarks</p>
                  <p className="text-sm">{entry.remarks}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Diary;
