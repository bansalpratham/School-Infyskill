import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { apiRequest, getCurrentUser } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

type AssignedClass = {
  _id: string;
  name: string;
  section: string;
};

function toClassName(c: Pick<AssignedClass, "name" | "section">) {
  return `${c.name}-${c.section}`;
}

type TimetableEntry = {
  _id: string;
  teacherId: string;
  className?: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
  room?: string;
};

const getSubjectColor = (subject: string) => {
  const colors: Record<string, string> = {
    Mathematics: "bg-primary/10 border-primary/30 text-primary",
    Algebra: "bg-accent/10 border-accent/30 text-accent",
    Geometry: "bg-success/10 border-success/30 text-success",
    Statistics: "bg-warning/10 border-warning/30 text-warning",
    Calculus: "bg-info/10 border-info/30 text-info",
    "Review Session": "bg-secondary border-border",
  };
  return colors[subject] || "bg-secondary border-border";
};

function toPeriodKey(i: Pick<TimetableEntry, "startTime" | "endTime">) {
  return `${String(i.startTime)}-${String(i.endTime)}`;
}

function toPeriodLabel(startTime: string, endTime: string) {
  const start = String(startTime || "").slice(0, 5);
  const end = String(endTime || "").slice(0, 5);
  if (!start || !end) return `${startTime} - ${endTime}`.trim() || "-";
  return `${start} - ${end}`;
}

const TimeTable = () => {
  const { toast } = useToast();
  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);
  const [selectedClassName, setSelectedClassName] = useState<string>("");
  const [items, setItems] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function normalizeDay(d: string) {
    const v = String(d || "").trim();
    if (!v) return v;
    const lower = v.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function normalizeRow(row: any): TimetableEntry {
    const roomNumber = String(row?.roomNumber || row?.room || "").trim() || undefined;
    return {
      _id: String(row?._id || ""),
      teacherId: String(row?.teacherId || ""),
      className: String(row?.className || row?.classId || "").trim() || undefined,
      subject: String(row?.subject || "").trim(),
      day: normalizeDay(String(row?.day || "")),
      startTime: String(row?.startTime || ""),
      endTime: String(row?.endTime || ""),
      roomNumber,
      room: String(row?.room || "").trim() || undefined,
    };
  }

  async function loadAssignedClasses() {
    if (!teacherId) {
      setAssignedClasses([]);
      setSelectedClassName("");
      return;
    }

    try {
      const res = await apiRequest<any>(`/api/classes/assigned?teacherId=${encodeURIComponent(teacherId)}`);
      const rows: AssignedClass[] = Array.isArray(res?.data) ? res.data : [];
      setAssignedClasses(rows);

      if (!selectedClassName && rows.length) {
        setSelectedClassName(toClassName(rows[0]));
      }
    } catch (e: any) {
      console.error("[Teacher Timetable] Failed to load assigned classes", {
        teacherId,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      toast({
        title: "Error",
        description: e?.message || "Failed to load assigned classes",
        variant: "destructive",
      });
      setAssignedClasses([]);
    }
  }

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!teacherId) {
        setItems([]);
        setError("Teacher id missing. Please log in again.");
        return;
      }

      const cn = String(selectedClassName || "").trim();
      if (!cn) {
        setItems([]);
        return;
      }

      const res = await apiRequest<any>(`/api/timetable/class/${encodeURIComponent(cn)}`);
      const rows: TimetableEntry[] = Array.isArray(res?.data) ? res.data.map(normalizeRow) : [];
      setItems(rows);
    } catch (e: any) {
      console.error("[Teacher Timetable] Failed to load timetable", {
        teacherId,
        className: selectedClassName,
        status: e?.status,
        payload: e?.payload,
        message: e?.message,
      });
      setError(e?.message || "Failed to load timetable");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAssignedClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId, selectedClassName]);

  const scheduleByDay = useMemo(() => {
    const grouped: Record<string, TimetableEntry[]> = {};
    for (const d of days) grouped[d] = [];
    for (const i of items) {
      const d = String(i.day);
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(i);
    }
    for (const d of Object.keys(grouped)) {
      grouped[d].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
    }
    return grouped;
  }, [items]);

  const periods = useMemo(() => {
    const map = new Map<string, { startTime: string; endTime: string }>();
    for (const i of items) {
      const key = toPeriodKey(i);
      if (!map.has(key)) {
        map.set(key, { startTime: String(i.startTime), endTime: String(i.endTime) });
      }
    }
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Time Table</h1>
          <p className="text-muted-foreground">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 bg-secondary rounded-lg font-medium">Week 12, 2024</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
          <div className="w-48 ml-2">
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
      </div>

      {/* Desktop View */}
      <Card className="hidden lg:block overflow-hidden animate-slide-up">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="p-4 text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">No timetable assigned.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold bg-secondary/50">Time</th>
                {days.map((day) => (
                  <th key={day} className="p-4 text-left font-semibold bg-secondary/50">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((p) => (
                <tr key={p.key} className="border-b last:border-0">
                  <td className="p-4 font-medium text-muted-foreground">{toPeriodLabel(p.startTime, p.endTime)}</td>
                  {days.map((day) => {
                    const classInfo = scheduleByDay[day]?.find((c) => toPeriodKey(c) === p.key) || null;
                    const isMine = !!classInfo && String(classInfo.teacherId) === String(teacherId);
                    return (
                      <td key={day} className="p-2">
                        {classInfo ? (
                          <div
                            className={`p-3 rounded-lg border ${getSubjectColor(classInfo.subject)} ${
                              isMine ? "ring-2 ring-primary/60 border-primary/50" : ""
                            }`}
                          >
                            <p className="font-semibold text-sm">{classInfo.subject}</p>
                            <p className="text-xs mt-1 opacity-80">
                              Class {classInfo.className} • {classInfo.roomNumber || '-'}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-muted-foreground text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
        ) : error ? (
          <Card className="p-4 text-sm text-destructive">{error}</Card>
        ) : items.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No timetable assigned.</Card>
        ) : days.map((day, dayIndex) => (
          <Card 
            key={day} 
            className="p-4 animate-slide-up"
            style={{ animationDelay: `${dayIndex * 50}ms` }}
          >
            <h3 className="font-semibold text-lg mb-3">{day}</h3>
            <div className="space-y-2">
              {scheduleByDay[day]?.length ? scheduleByDay[day].map((classInfo, index) => (
                <div 
                  key={classInfo._id || index}
                  className={`p-3 rounded-lg border ${getSubjectColor(classInfo.subject)} ${
                    String(classInfo.teacherId) === String(teacherId) ? "ring-2 ring-primary/60 border-primary/50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{classInfo.subject}</p>
                      <p className="text-sm opacity-80">Class {classInfo.className}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{classInfo.startTime}</p>
                      <p className="opacity-80">{classInfo.roomNumber || '-'}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-3 text-center text-muted-foreground text-sm">-</div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimeTable;
