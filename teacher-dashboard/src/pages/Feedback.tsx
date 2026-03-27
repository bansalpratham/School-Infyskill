import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getCurrentUser } from "@/lib/api";

type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  className?: string;
};

type FeedbackItem = {
  _id: string;
  teacherId: string;
  studentId: string;
  parentName: string;
  category: string;
  message: string;
  reply?: string;
  status?: "OPEN" | "CLOSED";
  createdAt?: string;
};

const Feedback = () => {
  const { toast } = useToast();

  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [students, setStudents] = useState<Student[]>([]);
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("Academic");
  const [parentName, setParentName] = useState("");
  const [message, setMessage] = useState("");

  const studentById = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of students) m.set(String(s._id), s);
    return m;
  }, [students]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      if (!teacherId) {
        setStudents([]);
        setItems([]);
        setError("Teacher id missing. Please log in again.");
        return;
      }

      const [fbRes, stuRes] = await Promise.all([
        apiRequest<any>(`/api/teacher/feedback?limit=200&teacherId=${encodeURIComponent(teacherId)}`),
        apiRequest<any>("/api/students?limit=500"),
      ]);

      setItems(Array.isArray(fbRes?.data) ? fbRes.data : []);
      setStudents(Array.isArray(stuRes?.data) ? stuRes.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load feedback");
      setStudents([]);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const handleSendFeedback = async (e?: FormEvent) => {
    e?.preventDefault?.();

    if (!teacherId) {
      toast({ title: "Error", description: "Teacher id missing. Please log in again.", variant: "destructive" });
      return;
    }

    const sid = String(studentId || "").trim();
    const cat = String(category || "").trim();
    const pn = String(parentName || "").trim();
    const msg = String(message || "").trim();

    if (!sid || !pn || !cat || !msg) {
      toast({ title: "Error", description: "Student, parent name, category, and message are required.", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/api/teacher/feedback", {
        method: "POST",
        body: {
          teacherId,
          studentId: sid,
          parentName: pn,
          category: cat,
          message: msg,
        },
      });

      toast({ title: "Saved", description: "Feedback recorded." });
      setParentName("");
      setMessage("");
      await load();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to save feedback", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Feedback</h1>
        <p className="text-muted-foreground">Communicate with parents and guardians</p>
      </div>

      {/* Send New Feedback */}
      <Card className="p-6 animate-slide-up">
        <h3 className="font-semibold text-lg mb-4">Send Feedback</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Student</label>
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading students..." : "Select student"} />
              </SelectTrigger>
              <SelectContent>
                {students.map((s) => {
                  const fullName = [s.firstName, s.lastName].filter(Boolean).join(" ") || "Student";
                  const cls = s.className ? ` (${s.className})` : "";
                  return (
                    <SelectItem key={String(s._id)} value={String(s._id)}>
                      {fullName}{cls}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Academic">Academic Performance</SelectItem>
                <SelectItem value="Behavior">Behavior</SelectItem>
                <SelectItem value="Attendance">Attendance</SelectItem>
                <SelectItem value="Appreciation">Appreciation</SelectItem>
                <SelectItem value="General">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Parent Name</label>
          <Input value={parentName} onChange={(e) => setParentName(e.target.value)} placeholder="Parent/Guardian name" />
        </div>
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write your feedback message..." rows={4} />
        </div>
        <Button onClick={handleSendFeedback} className="gap-2" disabled={saving || loading || !!error}>
          <Send className="w-4 h-4" />
          {saving ? "Sending..." : "Send Feedback"}
        </Button>
      </Card>

      {/* Feedback List */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Recent Conversations</h3>
        <div className="space-y-4">
          {error && (
            <Card className="p-4 border-destructive/30">
              <p className="text-sm text-destructive">{error}</p>
            </Card>
          )}

          {loading && (
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">Loading feedback...</p>
            </Card>
          )}

          {!loading && !error && items.length === 0 && (
            <Card className="p-5">
              <p className="text-sm text-muted-foreground">No feedback yet.</p>
            </Card>
          )}

          {!loading &&
            items.map((feedback, index) => (
              <Card
                key={feedback._id}
                className="p-5 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-6 h-6 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold">{feedback.parentName || "Parent"}</h4>
                        <p className="text-sm text-muted-foreground">
                          Student: {studentById.get(String(feedback.studentId))
                            ? ([studentById.get(String(feedback.studentId))?.firstName, studentById.get(String(feedback.studentId))?.lastName]
                                .filter(Boolean)
                                .join(" ") || feedback.studentId)
                            : feedback.studentId}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {feedback.createdAt ? new Date(feedback.createdAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-secondary/50 mb-3">
                      <p>{feedback.message}</p>
                    </div>
                    {feedback.reply && (
                      <div className="ml-6 p-3 rounded-lg bg-primary/10 border-l-2 border-primary">
                        <p className="text-sm font-medium text-primary mb-1">Reply</p>
                        <p className="text-sm">{feedback.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Feedback;
