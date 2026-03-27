import {
  Users,
  Calendar,
  CreditCard,
  BookOpen,
  FileText,
} from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';

type AttendanceRow = {
  _id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE';
};

type AttendanceRowWithId = AttendanceRow & { id: string };

type DiaryRow = {
  _id: string;
  className: string;
  subject: string;
  date: string;
  homework?: string;
  remarks?: string;
};

type HomeworkRow = {
  id: string;
  subject: string;
  date: string;
  homework: string;
};

type FeeRow = {
  _id: string;
  totalAmount?: number;
  amount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  status?: string;
};

export default function Dashboard() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [className, setClassName] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [diary, setDiary] = useState<DiaryRow[]>([]);
  const [fees, setFees] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setClassName('');
        setAttendance([]);
        setDiary([]);
        setFees([]);
        return;
      }

      const studentRes = await apiRequest<any>(`/api/students/${encodeURIComponent(studentId)}`);
      const cn = String(studentRes?.data?.className || '').trim();
      setClassName(cn);

      const [attRes, diaryRes, feesRes] = await Promise.all([
        apiRequest<any>(`/api/teacher/attendance?limit=50&studentId=${encodeURIComponent(studentId)}`),
        cn ? apiRequest<any>(`/api/teacher/diary?limit=50&className=${encodeURIComponent(cn)}`) : Promise.resolve({ data: [] }),
        apiRequest<any>(`/api/fees/student/${encodeURIComponent(studentId)}?limit=50`)
      ]);

      setAttendance(Array.isArray(attRes?.data) ? attRes.data : []);
      setDiary(Array.isArray(diaryRes?.data) ? diaryRes.data : []);
      setFees(Array.isArray(feesRes?.data) ? feesRes.data : []);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
        className,
      });
      setError(e?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const presentDays = attendance.filter(a => a.status === 'PRESENT').length;
  const attendancePercentage = attendance.length ? Math.round((presentDays / attendance.length) * 100) : 0;

  const homeworkRows = useMemo<HomeworkRow[]>(
    () => diary
      .filter((d) => String(d.homework || '').trim())
      .map((d) => ({
        id: d._id,
        subject: d.subject,
        date: d.date,
        homework: String(d.homework || '').trim(),
      })),
    [diary]
  );

  const pendingHomework = homeworkRows.length;

  const pendingFees = useMemo(() => {
    return fees.reduce((sum, f) => sum + Number(f.balanceAmount ?? 0), 0);
  }, [fees]);

  const recentAttendance = useMemo<AttendanceRowWithId[]>(
    () => attendance.slice(0, 5).map((a) => ({ ...a, id: a._id })),
    [attendance]
  );

  const recentHomework = useMemo<HomeworkRow[]>(
    () => homeworkRows.slice(0, 4),
    [homeworkRows]
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="page-header">Welcome back!</h1>
        <p className="text-muted-foreground -mt-4">Here's an overview of your academic progress</p>
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : null}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Attendance Rate"
          value={`${attendancePercentage}%`}
          icon={<Calendar className="w-6 h-6 text-primary" />}
          subtitle={`${presentDays} of ${attendance.length} days`}
        />
        <StatCard
          title="Pending Homework"
          value={pendingHomework}
          icon={<FileText className="w-6 h-6" />}
          variant="warning"
          subtitle="Tasks to complete"
        />
        <StatCard
          title="Pending Fees"
          value={`₹${pendingFees.toLocaleString()}`}
          icon={<CreditCard className="w-6 h-6 text-primary" />}
          subtitle="Total due amount"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Recent Attendance</h2>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <DataTable<AttendanceRowWithId>
            data={recentAttendance}
            columns={[
              {
                key: 'date',
                header: 'Date',
                render: (item) => new Date(item.date).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                }),
              },
              {
                key: 'status',
                header: 'Status',
                render: (item) => (
                  <StatusBadge
                    status={item.status}
                    variant={item.status === 'PRESENT' ? 'present' : 'absent'}
                  />
                ),
              },
            ]}
          />
        </div>

        {/* Recent Homework */}
        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Recent Homework</h2>
            <BookOpen className="w-5 h-5 text-muted-foreground" />
          </div>
          <DataTable<HomeworkRow>
            data={recentHomework}
            columns={[
              { key: 'subject', header: 'Subject' },
              {
                key: 'date',
                header: 'Date',
                render: (item) => new Date(item.date).toLocaleDateString('en-IN', {
                  month: 'short',
                  day: 'numeric',
                }),
              },
              { key: 'homework', header: 'Homework', render: (item) => <span className="line-clamp-2 max-w-xs">{item.homework}</span> },
            ]}
          />
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card stat-card-primary">
          <div className="flex items-center gap-4">
            <Users className="w-8 h-8" />
            <div>
              <p className="text-sm opacity-90">Current Class</p>
              <p className="text-xl font-bold">{className ? `Class ${className}` : '-'}</p>
            </div>
          </div>
        </div>
        <div className="form-section flex items-center gap-4">
          <div className="p-3 bg-accent rounded-lg">
            <BookOpen className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recent Homework</p>
            <p className="text-xl font-bold text-foreground">{recentHomework.length}</p>
          </div>
        </div>
        <div className="form-section flex items-center gap-4">
          <div className="p-3 bg-accent rounded-lg">
            <Calendar className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Recent Attendance Records</p>
            <p className="text-xl font-bold text-foreground">{recentAttendance.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
