
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getCurrentUser } from "@/lib/api";

type AssignedClass = { _id: string; name: string; section: string };
type Student = { _id: string; firstName?: string; lastName?: string; rollNumber?: string };

function toClassName(c: Pick<AssignedClass, "name" | "section">) {
  return `${c.name}-${c.section}`;
}

function toNumber(v: string) {
  const raw = String(v || "").trim();
  if (raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export default function MarksEntry() {
  const { toast } = useToast();
  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [classes, setClasses] = useState<AssignedClass[]>([]);
  const [className, setClassName] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [marksByStudentId, setMarksByStudentId] = useState<Record<string, string>>({});

  const [examName, setExamName] = useState("Unit Test");
  const [subject, setSubject] = useState("Mathematics");
  const [totalMarks, setTotalMarks] = useState("100");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadAssignedClasses() {
    try {
      setLoading(true);
      setError(null);

      if (!teacherId) {
        setClasses([]);
        setClassName("");
        setError("Teacher id missing. Please log in again.");
        return;
      }

      const res = await apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`);
      const items: AssignedClass[] = Array.isArray(res?.data) ? res.data : [];
      setClasses(items);

      if (!className && items.length) {
        setClassName(toClassName(items[0]));
      }
    } catch (e: any) {
      console.error("[Teacher MarksEntry] Failed to load assigned classes", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setClasses([]);
      setError(e?.message || "Failed to load assigned classes");
    } finally {
      setLoading(false);
    }
  }

  async function loadStudents() {
    try {
      setLoading(true);
      setError(null);

      if (!teacherId) {
        setStudents([]);
        setMarksByStudentId({});
        setError("Teacher id missing. Please log in again.");
        return;
      }

      if (!className) {
        setStudents([]);
        setMarksByStudentId({});
        return;
      }

      const res = await apiRequest<any>(`/api/students?limit=500&className=${encodeURIComponent(className)}`);
      const items: Student[] = Array.isArray(res?.data) ? res.data : [];
      setStudents(items);

      const next: Record<string, string> = {};
      for (const s of items) {
        const sid = String(s._id);
        next[sid] = marksByStudentId[sid] ?? "";
      }
      setMarksByStudentId(next);
    } catch (e: any) {
      console.error("[Teacher MarksEntry] Failed to load students", {
        teacherId,
        className,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setStudents([]);
      setMarksByStudentId({});
      setError(e?.message || "Failed to load students");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  useEffect(() => {
    loadStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className]);

  const rows = useMemo(() => {
    return students.map((s) => {
      const sid = String(s._id);
      const name = `${String(s.firstName || "")} ${String(s.lastName || "")}`.trim() || "-";
      const rollNo = String(s.rollNumber || "-");
      return { sid, name, rollNo, marks: marksByStudentId[sid] ?? "" };
    });
  }, [students, marksByStudentId]);

  async function submit() {
    const exam = String(examName || "").trim();
    const subj = String(subject || "").trim();
    const total = toNumber(totalMarks);

    if (!teacherId) {
      toast({ title: "Error", description: "Teacher id missing. Please log in again.", variant: "destructive" });
      return;
    }
    if (!className) {
      toast({ title: "Error", description: "Select a class.", variant: "destructive" });
      return;
    }
    if (!exam || !subj) {
      toast({ title: "Error", description: "examName and subject are required.", variant: "destructive" });
      return;
    }
    if (total === null || total <= 0) {
      toast({ title: "Error", description: "totalMarks must be a positive number.", variant: "destructive" });
      return;
    }

    if (total > 100) {
      toast({ title: "Error", description: "totalMarks must be 100 or less.", variant: "destructive" });
      return;
    }

    const items = rows
      .map((r) => {
        const m = toNumber(r.marks);
        if (m === null) return null;
        const status = m >= total / 2 ? "PASS" : "FAIL";
        return { studentId: r.sid, examName: exam, subject: subj, marks: m, totalMarks: total, status };
      })
      .filter(Boolean) as Array<{
        studentId: string;
        examName: string;
        subject: string;
        marks: number;
        totalMarks: number;
        status: "PASS" | "FAIL";
      }>;

    if (!items.length) {
      toast({ title: "Error", description: "Enter marks for at least one student.", variant: "destructive" });
      return;
    }

    if (items.some((it) => it.marks < 0 || it.marks > total)) {
      toast({ title: "Error", description: `Marks must be between 0 and ${total}.`, variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/api/results/bulk", {
        method: "POST",
        body: { items }
      });
      toast({ title: "Saved", description: "Marks submitted." });
    } catch (e: any) {
      console.error("[Teacher MarksEntry] Failed to submit marks", {
        teacherId,
        className,
        examName: exam,
        subject: subj,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      toast({ title: "Error", description: e?.message || "Failed to submit marks", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Marks Entry</h1>
        <p className="text-muted-foreground">Enter marks for students and publish results</p>
      </div>

      <Card className="p-5 animate-slide-up">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Class</label>
            <Select value={className} onValueChange={setClassName}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.length === 0 ? (
                  <SelectItem value="__none__" disabled>
                    No assigned classes
                  </SelectItem>
                ) : (
                  classes.map((c) => {
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
            <label className="text-sm font-medium mb-2 block">Exam Name</label>
            <Input value={examName} onChange={(e) => setExamName(e.target.value)} placeholder="e.g., Unit Test" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Subject</label>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Mathematics" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Total Marks</label>
            <Input value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} inputMode="numeric" placeholder="e.g., 100" />
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : error ? error : className ? `Class ${className}` : "Select a class"}
          </div>
          <Button onClick={submit} disabled={saving || loading || !!error}>
            {saving ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-4 border-b bg-secondary/30 flex items-center justify-between">
          <div className="font-semibold">Students</div>
          <div className="text-sm text-muted-foreground">{rows.length} students</div>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No students found.</div>
          ) : (
            rows.map((r) => (
              <div key={r.sid} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.name}</div>
                  <div className="text-sm text-muted-foreground">Roll No: {r.rollNo}</div>
                </div>
                <div className="w-full sm:w-40">
                  <Input
                    value={r.marks}
                    onChange={(e) =>
                      setMarksByStudentId((prev) => ({
                        ...prev,
                        [r.sid]: e.target.value
                      }))
                    }
                    inputMode="numeric"
                    placeholder="Marks"
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
