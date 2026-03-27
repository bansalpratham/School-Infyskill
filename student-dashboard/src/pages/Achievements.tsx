import { Trophy, Award, Medal, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';
import { StatCard } from '@/components/dashboard/StatCard';

type AchievementRow = {
  _id: string;
  studentId: string;
  className: string;
  category: string;
  title: string;
  level: string;
  date: string;
  description?: string;
};

export default function Achievements() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [items, setItems] = useState<AchievementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setItems([]);
        return;
      }

      const res = await apiRequest<any>(
        `/api/teacher/achievements/student/${encodeURIComponent(studentId)}?limit=200`
      );
      const rows: AchievementRow[] = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
    } catch (e: any) {
      console.error({ status: e?.status, payload: e?.payload, studentId });
      setError(e?.message || 'Failed to load achievements');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const stats = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const a of items) {
      const k = String(a.category || 'Other');
      byCategory.set(k, (byCategory.get(k) || 0) + 1);
    }

    const total = items.length;
    const academic = byCategory.get('Academic') || 0;
    const sports = byCategory.get('Sports') || 0;
    const other = total - academic - sports;

    return { total, academic, sports, other };
  }, [items]);


  const levelLabel = (level: string) => {
    const v = String(level || '').toUpperCase();
    if (v === 'SCHOOL') return 'School';
    if (v === 'DISTRICT') return 'District';
    if (v === 'STATE') return 'State';
    if (v === 'NATIONAL') return 'National';
    return level || '-';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Achievements</h1>
        <p className="text-muted-foreground">Achievements awarded to you by your teachers</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total" value={String(stats.total)} icon={<Trophy className="w-6 h-6 text-primary" />} />
        <StatCard title="Academic" value={String(stats.academic)} icon={<Award className="w-6 h-6" />} variant="success" />
        <StatCard title="Sports" value={String(stats.sports)} icon={<Medal className="w-6 h-6" />} variant="warning" />
        <StatCard title="Other" value={String(stats.other)} icon={<Star className="w-6 h-6" />} />
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No achievements found.</div>
      ) : null}

      {items.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {items.map((a) => {
            const dateLabel = a.date ? new Date(a.date).toLocaleDateString('en-IN') : '-';
            return (
              <div key={a._id} className="form-section">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-foreground break-words">{a.title || '-'}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {a.category || '-'}
                      {'  |  '}
                      {levelLabel(a.level)}
                      {'  |  '}
                      {dateLabel}
                    </div>
                  </div>
                  <div className="shrink-0 text-xs text-muted-foreground">{a.className || '-'}</div>
                </div>

                <div className="mt-3 text-sm text-foreground whitespace-pre-wrap break-words">
                  {String(a.description || '').trim() ? a.description : '-'}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
