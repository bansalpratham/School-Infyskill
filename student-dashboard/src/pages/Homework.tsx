import { FileText } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
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

type HomeworkRow = {
  id: string;
  subject: string;
  date: string;
  description: string;
  remarks?: string;
};

export default function Homework() {
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
      setError(e?.message || 'Failed to load homework');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const homeworkData = useMemo<HomeworkRow[]>(
    () => rows
      .filter((r) => String(r.homework || '').trim())
      .map((r) => ({
        id: r._id,
        subject: r.subject,
        date: r.date,
        description: String(r.homework || '').trim(),
        remarks: String(r.remarks || '').trim() || undefined,
      })),
    [rows]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Homework</h1>
        <p className="text-muted-foreground">View your assigned homework</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Homework" value={homeworkData.length} icon={<FileText className="w-6 h-6 text-primary" />} />
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : homeworkData.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No homework found{className ? ` for Class ${className}` : ''}.</div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {homeworkData.map(homework => (
          <div key={homework.id} className="form-section hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-foreground">{homework.subject}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(homework.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{homework.description}</p>
            {homework.remarks ? (
              <p className="text-sm text-muted-foreground mt-2">Remarks: {homework.remarks}</p>
            ) : null}
          </div>
        ))}
      </div>

      <div className="form-section">
        <h2 className="section-header">Homework List</h2>
        <DataTable<HomeworkRow>
          data={homeworkData}
          columns={[
            { key: 'subject', header: 'Subject' },
            {
              key: 'date', header: 'Due Date',
              render: (item) => new Date(item.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
            },
            { key: 'description', header: 'Description' },
            { key: 'remarks', header: 'Remarks', render: (item) => item.remarks || '-' },
          ]}
        />
      </div>
    </div>
  );
}
