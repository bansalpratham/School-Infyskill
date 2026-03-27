import { Clock, Calendar } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';
import { cn } from '@/lib/utils';

type TimetableRow = {
  _id: string;
  teacherId?: string;
  className: string;
  subject: string;
  day: string;
  startTime: string;
  endTime: string;
  roomNumber?: string;
};

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

function toPeriodKey(i: Pick<TimetableRow, 'startTime' | 'endTime'>) {
  return `${String(i.startTime)}-${String(i.endTime)}`;
}

function toPeriodLabel(startTime: string, endTime: string) {
  const start = String(startTime || '').slice(0, 5);
  const end = String(endTime || '').slice(0, 5);
  if (!start || !end) return `${startTime} - ${endTime}`.trim() || '-';
  return `${start} - ${end}`;
}

export default function TeacherSchedule() {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');
  const [mobileDay, setMobileDay] = useState(() => (days.includes(today) ? today : 'Monday'));

  function normalizeDay(d: string) {
    const v = String(d || '').trim();
    if (!v) return v;
    const lower = v.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function normalizeRow(row: any): TimetableRow {
    return {
      _id: String(row?._id || ''),
      teacherId: String(row?.teacherId || '').trim() || undefined,
      className: String(row?.className || '').trim(),
      subject: String(row?.subject || '').trim(),
      day: normalizeDay(String(row?.day || '')),
      startTime: String(row?.startTime || ''),
      endTime: String(row?.endTime || ''),
      roomNumber: String(row?.roomNumber || '').trim() || undefined,
    };
  }

  const [className, setClassName] = useState('');
  const [items, setItems] = useState<TimetableRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setItems([]);
        setClassName('');
        return;
      }

      const studentRes = await apiRequest<any>(`/api/students/${encodeURIComponent(studentId)}`);
      const cnValue = String(studentRes?.data?.className || '').trim();
      setClassName(cnValue);
      if (!cnValue) {
        setItems([]);
        return;
      }

      const res = await apiRequest<any>(`/api/teacher/timetable/class/${encodeURIComponent(cnValue)}`);
      const rows: TimetableRow[] = Array.isArray(res?.data) ? res.data.map(normalizeRow) : [];
      setItems(rows);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
        className,
      });
      setError(e?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  useEffect(() => {
    if (days.includes(today)) {
      setMobileDay(today);
    }
  }, [today]);

  const scheduleByDay = useMemo(() => {
    const map: Record<string, TimetableRow[]> = {};
    for (const d of days) map[d] = [];
    for (const row of items) {
      const d = String(row.day);
      if (!map[d]) map[d] = [];
      map[d].push(row);
    }
    for (const d of Object.keys(map)) {
      map[d].sort((a, b) => String(a.startTime).localeCompare(String(b.startTime)));
    }
    return map;
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

  const todaySchedule = scheduleByDay[today] || null;

  const totalPeriods = items.length;
  const freePeriods = useMemo(() => {
    if (items.length === 0) return 0;
    // periods is the list of unique time slots; any missing (day, slot) is a free period.
    const totalSlots = periods.length * days.length;
    return Math.max(totalSlots - items.length, 0);
  }, [items.length, periods.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Timetable</h1>
        <p className="text-muted-foreground">Your weekly class timetable</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Teaching Periods"
          value={totalPeriods}
          subtitle="Per week"
          icon={<Clock className="w-6 h-6" />}
          variant="primary"
        />
        <StatCard
          title="Free Periods"
          value={freePeriods}
          subtitle="Per week"
          icon={<Clock className="w-6 h-6 text-primary" />}
        />
        <StatCard
          title="Today"
          value={today}
          subtitle={todaySchedule ? `${todaySchedule.length} classes` : 'Weekend'}
          icon={<Calendar className="w-6 h-6" />}
          variant="success"
        />
      </div>

      {/* Today's Schedule */}
      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : items.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No timetable found{className ? ` for Class ${className}` : ''}.</div>
      ) : todaySchedule && (
        <div className="form-section">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-header mb-0">Today's Schedule - {today}</h2>
            <Calendar className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {todaySchedule.map((period, index) => (
              <div
                key={index}
                className={cn(
                  'p-4 rounded-lg border transition-colors',
                  'bg-accent border-accent hover:border-primary'
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{period.startTime} - {period.endTime}</span>
                </div>
                <h4 className={cn(
                  'font-semibold',
                  'text-foreground'
                )}>
                  {period.subject}
                </h4>
                <p className="text-sm text-muted-foreground">Room: {period.roomNumber || '-'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Timetable */}
      <div className="form-section">
        <h2 className="section-header">Weekly Timetable</h2>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : error ? (
          <div className="text-sm text-destructive">{error}</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">No timetable found{className ? ` for Class ${className}` : ''}.</div>
        ) : (
          <>
            <div className="md:hidden mb-4">
              <div className="flex gap-2 overflow-x-auto">
                {days.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={cn(
                      'px-3 py-2 rounded-md border text-sm whitespace-nowrap',
                      mobileDay === d ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-border'
                    )}
                    onClick={() => setMobileDay(d)}
                  >
                    {d}
                  </button>
                ))}
              </div>

              <div className="mt-4 space-y-3">
                {(scheduleByDay[mobileDay] || []).length ? (
                  (scheduleByDay[mobileDay] || []).map((entry) => (
                    <div key={entry._id} className="p-4 rounded-lg border border-border bg-accent">
                      <div className="text-sm text-muted-foreground mb-1">{toPeriodLabel(entry.startTime, entry.endTime)}</div>
                      <div className="font-semibold text-foreground">{entry.subject || '-'}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.roomNumber ? `Room ${entry.roomNumber}` : 'Room -'}
                        {entry.teacherId ? ` • Teacher ${entry.teacherId.slice(-6)}` : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground">No periods for {mobileDay}.</div>
                )}
              </div>
            </div>

            <div className="hidden md:block">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1000px]">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="border border-border p-3 text-left font-semibold text-foreground">Time</th>
                        {days.map((d) => (
                          <th
                            key={d}
                            className={cn(
                              'border border-border p-3 text-center font-semibold',
                              d === today ? 'bg-primary text-primary-foreground' : 'text-foreground'
                            )}
                          >
                            {d}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((p) => (
                        <tr key={p.key}>
                          <td className="border border-border p-3 text-sm font-medium text-muted-foreground">
                            {toPeriodLabel(p.startTime, p.endTime)}
                          </td>
                          {days.map((d) => {
                            const entry = scheduleByDay[d]?.find((x) => toPeriodKey(x) === p.key) || null;
                            return (
                              <td key={d} className="border border-border p-2 align-top">
                                {entry ? (
                                  <div className="p-3 rounded-lg bg-accent">
                                    <div className="font-semibold text-foreground">{entry.subject}</div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {entry.startTime} - {entry.endTime}
                                      {entry.roomNumber ? ` • Room ${entry.roomNumber}` : ''}
                                      {entry.teacherId ? ` • Teacher ${entry.teacherId.slice(-6)}` : ''}
                                    </div>
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
              </div>
            </div>
          </>
        )}
      </div>

      {/* Schedule Legend */}
      <div className="form-section">
        <h3 className="section-header">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary"></div>
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent"></div>
            <span className="text-sm text-muted-foreground">Today's Classes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted/30"></div>
            <span className="text-sm text-muted-foreground">Free Period</span>
          </div>
        </div>
      </div>
    </div>
  );
}
