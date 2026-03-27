import { BookOpen, Check, Clock } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';

type DiaryRow = {
  _id: string;
  className: string;
  subject: string;
  date: string;
  homework?: string;
  remarks?: string;
};

type ClassworkRow = {
  id: string;
  subject: string;
  date: string;
  description: string;
  status: 'Pending' | 'Completed';
};

export default function Classwork() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [className, setClassName] = useState<string>('');
  const [rows, setRows] = useState<DiaryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setRows([]);
        setClassName('');
        return;
      }

      const studentRes = await apiRequest<any>(`/api/students/${encodeURIComponent(studentId)}`);
      const cn = String(studentRes?.data?.className || '').trim();
      setClassName(cn);
      if (!cn) {
        setRows([]);
        return;
      }

      const res = await apiRequest<any>(`/api/teacher/diary?limit=200&className=${encodeURIComponent(cn)}`);
      const all: DiaryRow[] = Array.isArray(res?.data) ? res.data : [];
      setRows(all);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
        className,
      });
      setError(e?.message || 'Failed to load classwork');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const classworkData = useMemo<ClassworkRow[]>(
    () => rows
      .filter((r) => String(r.remarks || '').trim())
      .map((r) => ({
        id: r._id,
        subject: r.subject,
        date: r.date,
        description: String(r.remarks || '').trim(),
        status: 'Pending'
      })),
    [rows]
  );

  const completedCount = classworkData.filter(c => c.status === 'Completed').length;
  const pendingCount = classworkData.filter(c => c.status === 'Pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Classwork</h1>
        <p className="text-muted-foreground">View your daily classwork assignments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Classwork" value={classworkData.length} icon={<BookOpen className="w-6 h-6 text-primary" />} />
        <StatCard title="Completed" value={completedCount} icon={<Check className="w-6 h-6" />} variant="success" />
        <StatCard title="Pending" value={pendingCount} icon={<Clock className="w-6 h-6" />} variant="warning" />
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : classworkData.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No classwork found{className ? ` for Class ${className}` : ''}.</div>
      ) : null}

      <div className="form-section">
        <h2 className="section-header">All Classwork</h2>
        <DataTable<ClassworkRow>
          data={classworkData}
          columns={[
            { key: 'subject', header: 'Subject' },
            {
              key: 'date', header: 'Date',
              render: (item) => new Date(item.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }),
            },
            {
              key: 'description', header: 'Description',
              render: (item) => <span className="line-clamp-2 max-w-xs">{item.description}</span>,
            },
            {
              key: 'status', header: 'Status',
              render: (item) => <StatusBadge status={item.status} variant={item.status === 'Completed' ? 'completed' : 'pending'} />,
            },
          ]}
        />
      </div>
    </div>
  );
}
