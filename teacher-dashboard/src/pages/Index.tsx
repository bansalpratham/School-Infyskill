import { useEffect, useMemo, useState } from "react";
import { Calendar, ClipboardCheck, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatCard } from "@/components/dashboard/StatCard";
import { apiRequest, getCurrentUser } from "@/lib/api";

type AssignedClass = {
  _id: string;
  name: string;
  section: string;
};

type TimetableEntry = {
  _id: string;
  teacherId: string;
  className: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
};

type AttendanceRecord = {
  _id: string;
  studentId: string;
  status: "PRESENT" | "ABSENT" | "LATE";
};

function toClassName(c: Pick<AssignedClass, "name" | "section">) {
  return `${c.name}-${c.section}`;
}

function todayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

const Index = () => {
  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");
  const teacherName = String(user?.name || "").trim() || "Teacher";

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const today = todayName();
  const todayDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  async function loadAssignedAndTimetable() {
    try {
      if (!teacherId) {
        setAssignedClasses([]);
        setSelectedClassName("");
        setTimetable([]);
        return;
      }

      const [classesRes, ttRes] = await Promise.all([
        apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`),
        apiRequest<any>(`/api/teacher/timetable/${encodeURIComponent(teacherId)}?limit=200`)
      ]);

      const classes: AssignedClass[] = Array.isArray(classesRes?.data) ? classesRes.data : [];
      const tt: TimetableEntry[] = Array.isArray(ttRes?.data) ? ttRes.data : [];

      setAssignedClasses(classes);
      setTimetable(tt);

      if (!selectedClassName && classes.length) {
        setSelectedClassName(toClassName(classes[0]));
      }
    } catch (e: any) {
      console.error("[Teacher Dashboard] Failed to load assigned classes/timetable", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setAssignedClasses([]);
      setTimetable([]);
      throw e;
    }
  }

  async function loadAttendanceSummary() {
    try {
      if (!teacherId || !selectedClassName) {
        setAttendanceRecords([]);
        return;
      }
      const res = await apiRequest<any>(
        `/api/teacher/attendance/class/${encodeURIComponent(selectedClassName)}?date=${encodeURIComponent(todayDate)}&teacherId=${encodeURIComponent(teacherId)}`
      );
      const rows: AttendanceRecord[] = Array.isArray(res?.data) ? res.data : [];
      setAttendanceRecords(rows);
    } catch (e: any) {
      console.error("[Teacher Dashboard] Failed to load attendance summary", {
        teacherId,
        className: selectedClassName,
        date: todayDate,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setAttendanceRecords([]);
      throw e;
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        await loadAssignedAndTimetable();
      } catch (e: any) {
        setError(e?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  useEffect(() => {
    (async () => {
      try {
        setError(null);
        await loadAttendanceSummary();
      } catch (e: any) {
        setError(e?.message || "Failed to load attendance summary");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, selectedClassName, todayDate]);

  const todaysSchedule = useMemo(() => {
    return timetable
      .filter((t) => String(t.day) === today)
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  }, [timetable, today]);

  const attendanceCounts = useMemo(() => {
    const present = attendanceRecords.filter((r) => r.status === "PRESENT").length;
    const absent = attendanceRecords.filter((r) => r.status === "ABSENT").length;
    const late = attendanceRecords.filter((r) => r.status === "LATE").length;
    return { present, absent, late, total: attendanceRecords.length };
  }, [attendanceRecords]);

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {teacherName}</h1>
        <p className="text-muted-foreground mt-1">Here is your dashboard summary for today.</p>
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Assigned Classes"
          value={assignedClasses.length}
          icon={<BookOpen className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="Today's Schedule"
          value={todaysSchedule.length}
          icon={<Calendar className="w-6 h-6" />}
          variant="accent"
        />
        <StatCard
          title="Attendance (Selected Class)"
          value={attendanceCounts.total}
          icon={<ClipboardCheck className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {!loading && !error && assignedClasses.length === 0 ? (
        <Card className="p-5">
          <div className="text-sm text-muted-foreground">No classes assigned yet.</div>
        </Card>
      ) : null}

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>

        {todaysSchedule.length === 0 ? (
          <div className="text-sm text-muted-foreground">No timetable entries for today.</div>
        ) : (
          <div className="divide-y">
            {todaysSchedule.map((t) => (
              <div key={t._id} className="py-3 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-medium truncate">{t.subject}</div>
                  <div className="text-sm text-muted-foreground truncate">Class {t.className}{t.roomNumber ? ` • Room ${t.roomNumber}` : ""}</div>
                </div>
                <div className="text-sm text-muted-foreground whitespace-nowrap">{t.startTime} - {t.endTime}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-semibold">Attendance Summary</h2>
            <p className="text-sm text-muted-foreground">{todayDate}</p>
          </div>
          <div className="w-full sm:w-56">
            <Select value={selectedClassName} onValueChange={setSelectedClassName}>
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
        </div>

        {!selectedClassName ? (
          <div className="text-sm text-muted-foreground">Select a class to view attendance summary.</div>
        ) : attendanceCounts.total === 0 ? (
          <div className="text-sm text-muted-foreground">No attendance records found for Class {selectedClassName}.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-sm text-muted-foreground">Present</div>
              <div className="text-2xl font-bold">{attendanceCounts.present}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-sm text-muted-foreground">Absent</div>
              <div className="text-2xl font-bold">{attendanceCounts.absent}</div>
            </div>
            <div className="p-4 rounded-lg bg-secondary/50">
              <div className="text-sm text-muted-foreground">Late</div>
              <div className="text-2xl font-bold">{attendanceCounts.late}</div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Index;
