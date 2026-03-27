import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, Save, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, getCurrentUser } from "@/lib/api";

type Status = "PRESENT" | "ABSENT" | "LATE";

type StudentRow = {
  studentId: string;
  name: string;
  rollNo?: string;
  status: Status;
};

type AssignedClass = {
  _id: string;
  name: string;
  section: string;
};

function toClassName(c: Pick<AssignedClass, 'name' | 'section'>) {
  return `${c.name}-${c.section}`;
}

const Attendance = () => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [className, setClassName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [attendanceData, setAttendanceData] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = (studentId: string, status: Status) => {
    setAttendanceData((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, status } : student
      )
    );
  };

  async function loadAssignedClasses() {
    try {
      if (!teacherId) {
        setAssignedClasses([]);
        setClassName("");
        setError("Teacher id missing. Please log in again.");
        return;
      }

      const res = await apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`);
      const items: AssignedClass[] = Array.isArray(res?.data) ? res.data : [];
      setAssignedClasses(items);

      if (!className && items.length) {
        setClassName(toClassName(items[0]));
      }
    } catch (e: any) {
      console.error("[Teacher Attendance] Failed to load assigned classes", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setAssignedClasses([]);
    }
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);

      if (!teacherId) {
        setAttendanceData([]);
        setError("Teacher id missing. Please log in again.");
        return;
      }

      if (!className) {
        setAttendanceData([]);
        return;
      }

      const [studentsRes, attendanceRes] = await Promise.all([
        apiRequest<any>(`/api/students?limit=200&className=${encodeURIComponent(className)}`),
        apiRequest<any>(`/api/teacher/attendance/class/${encodeURIComponent(className)}?date=${encodeURIComponent(date)}&teacherId=${encodeURIComponent(teacherId)}`)
      ]);

      const students = Array.isArray(studentsRes?.data) ? studentsRes.data : [];
      const records = Array.isArray(attendanceRes?.data) ? attendanceRes.data : [];
      const statusByStudentId = new Map<string, Status>();

      for (const r of records) {
        if (r?.studentId && r?.status) {
          statusByStudentId.set(String(r.studentId), String(r.status).toUpperCase() as Status);
        }
      }

      const rows: StudentRow[] = students.map((s: any) => {
        const sid = String(s?._id || s?.id || "");
        const name = `${s?.firstName || ""} ${s?.lastName || ""}`.trim() || "-";
        const rollNo = s?.rollNumber || undefined;
        const status = statusByStudentId.get(sid) || "PRESENT";
        return { studentId: sid, name, rollNo, status };
      });

      setAttendanceData(rows);
    } catch (e: any) {
      console.error("[Teacher Attendance] Failed to load students/attendance", {
        teacherId,
        className,
        date,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setError(e?.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  useEffect(() => {
    if (!className) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, date]);

  const handleSave = async () => {
    if (!teacherId) {
      toast({
        title: "Error",
        description: "Teacher id missing. Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      const items = attendanceData.map((s) => ({
        teacherId,
        className,
        studentId: s.studentId,
        date,
        status: s.status,
      }));

      await apiRequest("/api/teacher/attendance", {
        method: "POST",
        body: { items },
      });

      toast({
        title: "Attendance Saved",
        description: "Attendance has been recorded successfully.",
      });
      await load();
    } catch (e: any) {
      console.error("[Teacher Attendance] Failed to save attendance", {
        teacherId,
        className,
        date,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      toast({
        title: "Error",
        description: e?.message || "Failed to save attendance",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const presentCount = useMemo(() => attendanceData.filter((s) => s.status === "PRESENT").length, [attendanceData]);
  const absentCount = useMemo(() => attendanceData.filter((s) => s.status === "ABSENT").length, [attendanceData]);
  const lateCount = useMemo(() => attendanceData.filter((s) => s.status === "LATE").length, [attendanceData]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Mark and manage student attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>

          <Select value={className} onValueChange={setClassName}>
            <SelectTrigger className="w-32">
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
          <Button onClick={handleSave} className="gap-2" disabled={saving || loading || !!error}>
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 animate-slide-up">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{presentCount}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{absentCount}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lateCount}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card className="overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-4 border-b bg-secondary/30 flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">Class {className} Students</span>
          <span className="text-sm text-muted-foreground ml-auto">{attendanceData.length} students</span>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-sm text-destructive">{error}</div>
          ) : attendanceData.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No students found for this class.</div>
          ) : attendanceData.map((student, index) => (
            <div 
              key={student.studentId}
              className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{student.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Roll No: {student.rollNo || '-'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["PRESENT", "ABSENT", "LATE"] as Status[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(student.studentId, status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      student.status === status
                        ? status === "PRESENT"
                          ? "bg-success text-success-foreground"
                          : status === "ABSENT"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-warning text-warning-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
