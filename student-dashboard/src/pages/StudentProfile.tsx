import { useEffect, useMemo, useState } from 'react';
import { User, Mail, GraduationCap, Phone, Hash, IdCard, BadgeCheck } from 'lucide-react';
import { apiRequest, getCurrentUser } from '@/lib/api';

type StudentProfileData = {
  id: string;
  name: string;
  className: string;
  email: string;
  phone?: string;
  rollNumber?: string;
  admissionId?: string;
  status?: string;
  customFields?: Record<string, any>;
};

type CustomField = {
  _id: string;
  label: string;
  enabled: boolean;
  order?: number;
};

function toDisplayValue(v: any) {
  if (v === undefined || v === null) return '-';
  if (typeof v === 'string') return v.trim() || '-';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export default function StudentProfile() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [student, setStudent] = useState<StudentProfileData | null>(null);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        if (!studentId) {
          setStudent(null);
          return;
        }
        const [res, cfRes] = await Promise.all([
          apiRequest<any>(`/api/students/${encodeURIComponent(studentId)}`),
          apiRequest<any>(`/api/custom-fields?visibility=student`),
        ]);

        const s = res?.data;
        const cf: CustomField[] = Array.isArray(cfRes?.data) ? cfRes.data : [];
        setCustomFields(cf.filter((f) => f && f.enabled).sort((a, b) => (a.order || 0) - (b.order || 0)));
        if (!s) {
          setStudent(null);
          return;
        }

        setStudent({
          id: String(s._id || s.id || studentId),
          name: `${s.firstName || ''} ${s.lastName || ''}`.trim() || s.name || '-',
          className: String(s.className || '-'),
          email: String(s.email || user?.email || ''),
          phone: String(s.phone || '').trim() || undefined,
          rollNumber: String(s.rollNumber || '').trim() || undefined,
          admissionId: String(s.admissionId || '').trim() || undefined,
          status: String(s.status || '').trim() || undefined,
          customFields: (s && typeof s.customFields === 'object' && s.customFields) ? (s.customFields as Record<string, any>) : {},
        });
      } catch (e: any) {
        console.error({
          status: e?.status,
          payload: e?.payload,
          studentId,
        });
        setError(e?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [studentId]);

  const customFieldRows = useMemo(() => {
    if (!student?.customFields) return [];
    const cf = student.customFields;

    const known = customFields.map((f) => ({
      key: String(f._id),
      label: String(f.label || 'Custom Field'),
      value: (cf as any)?.[String(f._id)],
    }));

    const knownKeys = new Set(customFields.map((f) => String(f._id)));
    const unknown = Object.keys(cf)
      .filter((k) => !knownKeys.has(String(k)))
      .sort((a, b) => a.localeCompare(b))
      .map((k) => ({ key: String(k), label: `Custom (${String(k).slice(-6)})`, value: (cf as any)?.[k] }));

    return [...known, ...unknown].filter((x) => x.value !== undefined);
  }, [student?.customFields, customFields]);

  if (loading) {
    return <div className="form-section text-sm text-muted-foreground">Loading...</div>;
  }

  if (error) {
    return <div className="form-section text-sm text-destructive">{error}</div>;
  }

  if (!student) {
    return <div className="form-section text-sm text-muted-foreground">No profile found.</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">Student Profile</h1>
        <p className="text-muted-foreground">Your student information</p>
      </div>

      <div className="form-section">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-xl font-bold truncate">{student.name}</div>
            <div className="text-sm text-muted-foreground truncate">{student.email || '-'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="form-section flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Class</div>
            <div className="font-semibold">{student.className || '-'}</div>
          </div>
        </div>
        <div className="form-section flex items-center gap-3">
          <Mail className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-semibold break-all">{student.email || '-'}</div>
          </div>
        </div>
        <div className="form-section flex items-center gap-3">
          <Phone className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Phone</div>
            <div className="font-semibold">{student.phone || '-'}</div>
          </div>
        </div>
        <div className="form-section flex items-center gap-3">
          <Hash className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Roll Number</div>
            <div className="font-semibold">{student.rollNumber || '-'}</div>
          </div>
        </div>
        <div className="form-section flex items-center gap-3">
          <IdCard className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Admission ID</div>
            <div className="font-semibold break-all">{student.admissionId || '-'}</div>
          </div>
        </div>
        <div className="form-section flex items-center gap-3">
          <BadgeCheck className="w-5 h-5 text-muted-foreground" />
          <div>
            <div className="text-sm text-muted-foreground">Status</div>
            <div className="font-semibold">{student.status || '-'}</div>
          </div>
        </div>
      </div>

      {customFieldRows.length ? (
        <div className="form-section">
          <div className="text-base font-semibold mb-3">Custom Details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {customFieldRows.map((r) => (
              <div key={r.key} className="rounded-lg border border-border p-3">
                <div className="text-sm text-muted-foreground">{r.label}</div>
                <div className="font-semibold break-words">{toDisplayValue(r.value)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
