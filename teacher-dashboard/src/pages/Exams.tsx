import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, FileText, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { apiRequest, getCurrentUser } from "@/lib/api";

type ScheduledExam = {
  _id: string;
  className: string;
  subject: string;
  examType: string;
  date: string;
  startTime: string;
  durationMinutes: number;
  totalMarks: number;
  syllabus?: string;
  createdAt?: string;
};

type AssignedClass = {
  className?: string;
  name?: string;
};

function toMinutesLabel(minutes: number) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return "-";
  if (m % 60 === 0) return `${m / 60} hour${m / 60 === 1 ? "" : "s"}`;
  if (m > 60) {
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return `${h}h ${rem}m`;
  }
  return `${m} minutes`;
}

const statusStyles = {
  upcoming: { bg: "bg-accent/10", text: "text-accent", label: "Upcoming" },
  scheduled: { bg: "bg-info/10", text: "text-info", label: "Scheduled" },
  completed: { bg: "bg-success/10", text: "text-success", label: "Completed" },
};

const Exams = () => {
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "").trim();

  const [items, setItems] = useState<ScheduledExam[]>([]);
  const [classes, setClasses] = useState<AssignedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [subject, setSubject] = useState("");
  const [className, setClassName] = useState("");
  const [examType, setExamType] = useState("Unit Test");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("09:00");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [totalMarks, setTotalMarks] = useState("50");
  const [syllabus, setSyllabus] = useState("");

  const classOptions = useMemo(() => {
    const opts = classes
      .map((c) => String(c.className || c.name || "").trim())
      .filter(Boolean);
    return Array.from(new Set(opts));
  }, [classes]);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [examsRes, classesRes] = await Promise.all([
        apiRequest<any>("/api/exams?limit=200"),
        teacherId
          ? apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`)
          : Promise.resolve({ data: [] }),
      ]);
      setItems(Array.isArray(examsRes?.data) ? examsRes.data : []);
      setClasses(Array.isArray(classesRes?.data) ? classesRes.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load scheduled exams");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const grouped = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const upcoming: ScheduledExam[] = [];
    const completed: ScheduledExam[] = [];
    for (const it of items) {
      if (String(it.date || "") >= today) upcoming.push(it);
      else completed.push(it);
    }
    upcoming.sort(
      (a, b) => String(a.date).localeCompare(String(b.date)) || String(a.startTime).localeCompare(String(b.startTime)),
    );
    completed.sort(
      (a, b) => String(b.date).localeCompare(String(a.date)) || String(b.startTime).localeCompare(String(a.startTime)),
    );
    return { upcoming, scheduled: upcoming, completed };
  }, [items]);

  const handleSchedule = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await apiRequest("/api/exams", {
        method: "POST",
        body: JSON.stringify({
          className,
          subject,
          examType,
          date,
          startTime,
          durationMinutes: Number(durationMinutes),
          totalMarks: Number(totalMarks),
          syllabus,
        }),
      });
      toast({ title: "Exam Scheduled", description: "The exam has been added to the schedule." });
      setIsScheduling(false);
      setSubject("");
      setSyllabus("");
      await load();
    } catch (e: any) {
      toast({
        title: "Failed to Schedule Exam",
        description: e?.message || "Please check the details and try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Scheduled Exams</h1>
          <p className="text-muted-foreground">Manage and track examination schedules</p>
        </div>
        <Button onClick={() => setIsScheduling(!isScheduling)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        {[
          { label: "This Week", value: String(grouped.upcoming.length), color: "text-accent" },
          { label: "This Month", value: String(items.length), color: "text-primary" },
          { label: "Pending Results", value: "0", color: "text-warning" },
          { label: "Completed", value: String(grouped.completed.length), color: "text-success" },
        ].map((stat, index) => (
          <Card key={index} className="p-4 text-center">
            <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Schedule Exam Form */}
      {isScheduling && (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Schedule New Exam</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsScheduling(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <form onSubmit={handleSchedule}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Mathematics" required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={className} onValueChange={setClassName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
                      <SelectItem key={c} value={c}>
                        Class {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Exam Type</label>
                <Select value={examType} onValueChange={setExamType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Class Test">Class Test</SelectItem>
                    <SelectItem value="Unit Test">Unit Test</SelectItem>
                    <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                    <SelectItem value="Final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Time</label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Duration</label>
                <Select value={durationMinutes} onValueChange={setDurationMinutes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="90">1.5 hours</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                    <SelectItem value="180">3 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Total Marks</label>
                <Input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  placeholder="e.g., 50"
                  min={0}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Syllabus</label>
                <Input value={syllabus} onChange={(e) => setSyllabus(e.target.value)} placeholder="e.g., Chapters 5-6" />
              </div>
            </div>
            <Button type="submit" className="gap-2" disabled={saving}>
              <Calendar className="w-4 h-4" />
              {saving ? "Scheduling..." : "Schedule Exam"}
            </Button>
          </form>
        </Card>
      )}

      {/* Exam List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Loading exams...</p>
          </Card>
        ) : error ? (
          <Card className="p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" onClick={load}>
                Retry
              </Button>
            </div>
          </Card>
        ) : items.length === 0 ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">No exams scheduled yet.</p>
          </Card>
        ) : (
          (["upcoming", "completed"] as const).map((status) => {
            const filteredExams = grouped[status];
            if (filteredExams.length === 0) return null;

            const style = statusStyles[status as keyof typeof statusStyles];

            return (
              <div key={status}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <span className={cn("w-2 h-2 rounded-full", style.bg.replace("/10", ""))} />
                  {style.label} Exams
                </h3>
                <div className="space-y-3">
                  {filteredExams.map((exam, index) => (
                    <Card
                      key={exam._id}
                      className="p-5 animate-slide-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-semibold">{exam.subject}</h4>
                              <span className="px-2 py-0.5 bg-secondary rounded text-xs">{exam.examType}</span>
                              <span className={cn("px-2 py-0.5 rounded text-xs", style.bg, style.text)}>
                                {style.label}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Class {exam.className}</p>
                          </div>
                        </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(exam.date).toLocaleDateString('en-US', { 
                            weekday: 'short', month: 'short', day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{toMinutesLabel(exam.durationMinutes)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{exam.totalMarks} marks</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Syllabus</p>
                      <p className="text-sm">{exam.syllabus}</p>
                    </div>
                  </Card>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Exams;
