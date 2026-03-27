import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, X, TrendingUp } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/dashboard/StatCard';
import { apiRequest, getCurrentUser } from '@/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AttendanceRow = {
  _id: string;
  studentId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
};

type AttendanceRowWithId = AttendanceRow & { id: string };

export default function Attendance() {
  const [selectedMonth, setSelectedMonth] = useState(() =>
    new Date().toLocaleDateString('en-US', { month: 'long' })
  );
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setAttendanceData([]);
        return;
      }
      const res = await apiRequest<any>(`/api/teacher/attendance?limit=200&studentId=${encodeURIComponent(studentId)}`);
      const rows: AttendanceRow[] = Array.isArray(res?.data) ? res.data : [];
      setAttendanceData(rows);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
      });
      setError(e?.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const attendanceWithId = useMemo<AttendanceRowWithId[]>(
    () => attendanceData.map((a) => ({ ...a, id: a._id })),
    [attendanceData]
  );

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const selectedMonthIndex = useMemo(() => {
    const idx = months.findIndex((m) => m === selectedMonth);
    return idx >= 0 ? idx : 0;
  }, [months, selectedMonth]);

  const filteredAttendance = useMemo(() => {
    return attendanceData.filter((r) => {
      const d = new Date(r.date);
      if (Number.isNaN(d.getTime())) return false;
      return d.getMonth() === selectedMonthIndex;
    });
  }, [attendanceData, selectedMonthIndex]);

  const filteredAttendanceWithId = useMemo<AttendanceRowWithId[]>(
    () => filteredAttendance.map((a) => ({ ...a, id: a._id })),
    [filteredAttendance]
  );

  const daysInSelectedMonth = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    return new Date(year, selectedMonthIndex + 1, 0).getDate();
  }, [selectedMonthIndex]);

  const normalizedForCalendar = useMemo(() => {
    const map = new Map<number, AttendanceRow>();
    for (const r of filteredAttendance) {
      const d = new Date(r.date);
      if (!Number.isNaN(d.getTime())) {
        map.set(d.getDate(), r);
      }
    }
    return map;
  }, [filteredAttendance]);

  const presentDays = filteredAttendance.filter(a => a.status === 'PRESENT').length;
  const absentDays = filteredAttendance.filter(a => a.status === 'ABSENT').length;
  const lateDays = filteredAttendance.filter(a => a.status === 'LATE').length;
  const totalDays = filteredAttendance.length;
  const attendancePercentage = totalDays ? Math.round((presentDays / totalDays) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Attendance</h1>
        <p className="text-muted-foreground">View your daily attendance and monthly summary</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Attendance Rate" value={`${attendancePercentage}%`} icon={<TrendingUp className="w-6 h-6 text-primary" />} variant="primary" />
        <StatCard title="Present Days" value={presentDays} icon={<Check className="w-6 h-6" />} variant="success" />
        <StatCard title="Absent Days" value={absentDays} icon={<X className="w-6 h-6" />} variant="warning" />
        <StatCard title="Total Days" value={totalDays} icon={<Calendar className="w-6 h-6 text-primary" />} />
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : filteredAttendance.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No attendance records found.</div>
      ) : null}

      <div className="form-section">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-header mb-0">Monthly Summary</h2>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>{month}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-6">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">{day}</div>
          ))}
          {Array.from({ length: daysInSelectedMonth }, (_, i) => {
            const dayNum = i + 1;
            const record = normalizedForCalendar.get(dayNum);
            return (
              <div
                key={i}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  record?.status === 'PRESENT' ? 'bg-success/10 text-success' :
                  record?.status === 'ABSENT' ? 'bg-destructive/10 text-destructive' :
                  record?.status === 'LATE' ? 'bg-warning/10 text-warning' :
                  'bg-muted text-muted-foreground'
                }`}
              >{dayNum}</div>
            );
          })}
        </div>

        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-success/10"></div><span className="text-muted-foreground">Present</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-destructive/10"></div><span className="text-muted-foreground">Absent</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-muted"></div><span className="text-muted-foreground">No Record</span></div>
        </div>
      </div>

      <div className="form-section">
        <h2 className="section-header">Daily Attendance Record</h2>
        <DataTable<AttendanceRowWithId>
          data={filteredAttendanceWithId}
          columns={[
            {
              key: 'date', header: 'Date',
              render: (item) => new Date(item.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
            },
            {
              key: 'status', header: 'Status',
              render: (item) => <StatusBadge status={item.status} variant={item.status === 'PRESENT' ? 'present' : 'absent'} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
