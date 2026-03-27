import { DataTable } from '@/components/common/DataTable';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';

type ResultRow = {
  _id: string;
  studentId: string;
  examName: string;
  subject: string;
  marks: number;
  totalMarks?: number;
  grade?: string;
  status: 'PASS' | 'FAIL';
};

type ResultRowWithId = ResultRow & { id: string };

export default function MarksPerformance() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [marksData, setMarksData] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setMarksData([]);
        return;
      }
      const res = await apiRequest<any>(`/api/results/student/${encodeURIComponent(studentId)}?limit=200`);
      const rows: ResultRow[] = Array.isArray(res?.data) ? res.data : [];
      setMarksData(rows);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
      });
      setError(e?.message || 'Failed to load results');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const marksWithId = useMemo<ResultRowWithId[]>(
    () => marksData.map((m) => ({ ...m, id: m._id })),
    [marksData]
  );

  const marksLabel = (item: ResultRow) => {
    const total = Number(item.totalMarks ?? 0);
    const marks = Number(item.marks ?? 0);
    return total > 0 ? `${marks}/${total}` : String(marks);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Results</h1>
        <p className="text-muted-foreground">View your marks and pass/fail status</p>
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : marksData.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No results found.</div>
      ) : null}

      <div className="form-section">
        <h2 className="section-header">Results</h2>
        <DataTable<ResultRowWithId>
          data={marksWithId}
          columns={[
            { key: 'examName', header: 'Test' },
            { key: 'subject', header: 'Subject' },
            {
              key: 'marks',
              header: 'Marks',
              render: (item) => marksLabel(item),
            },
            { key: 'status', header: 'Status' },
          ]}
        />
      </div>
    </div>
  );
}
