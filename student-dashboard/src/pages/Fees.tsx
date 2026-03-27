import { CreditCard, IndianRupee, Check, Clock, AlertCircle } from 'lucide-react';
import { DataTable } from '@/components/common/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { StatCard } from '@/components/dashboard/StatCard';
import { useEffect, useMemo, useState } from 'react';
import { apiRequest, getCurrentUser } from '@/lib/api';

type FeeRow = {
  _id: string;
  feeType?: string;
  amount?: number;
  totalAmount?: number;
  paidAmount?: number;
  balanceAmount?: number;
  dueDate?: string;
  status: string;
};

type FeeRowWithId = FeeRow & { id: string };

export default function Fees() {
  const user = getCurrentUser();
  const studentId = String(user?.userId || user?._id || user?.id || '');

  const [feesData, setFeesData] = useState<FeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!studentId) {
        setFeesData([]);
        return;
      }
      const res = await apiRequest<any>(`/api/fees/student/${encodeURIComponent(studentId)}?limit=200`);
      const rows: FeeRow[] = Array.isArray(res?.data) ? res.data : [];
      setFeesData(rows);
    } catch (e: any) {
      console.error({
        status: e?.status,
        payload: e?.payload,
        studentId,
      });
      setError(e?.message || 'Failed to load fees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const { totalFees, paidFees, pendingFees } = useMemo(() => {
    const totals = feesData.reduce(
      (acc, f) => {
        const total = Number(f.totalAmount ?? f.amount ?? 0);
        const paid = Number(f.paidAmount ?? (String(f.status).toUpperCase() === 'PAID' ? total : 0));
        const balance = Number(f.balanceAmount ?? Math.max(total - paid, 0));
        acc.total += total;
        acc.paid += paid;
        acc.pending += balance;
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
    return { totalFees: totals.total, paidFees: totals.paid, pendingFees: totals.pending };
  }, [feesData]);

  const feesWithId = useMemo<FeeRowWithId[]>(
    () => feesData.map((f) => ({ ...f, id: f._id })),
    [feesData]
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-header mb-1">School Fees</h1>
        <p className="text-muted-foreground">View your fee details and payment status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Total Fees" value={`₹${totalFees.toLocaleString()}`} icon={<IndianRupee className="w-6 h-6 text-primary" />} />
        <StatCard title="Paid Amount" value={`₹${paidFees.toLocaleString()}`} icon={<Check className="w-6 h-6" />} variant="success" />
        <StatCard title="Pending Amount" value={`₹${pendingFees.toLocaleString()}`} icon={<Clock className="w-6 h-6" />} variant="warning" />
        <StatCard
          title="Payment Status" value={pendingFees === 0 ? 'All Paid' : 'Pending'}
          icon={pendingFees === 0 ? <Check className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
          variant={pendingFees === 0 ? 'success' : 'warning'}
        />
      </div>

      {loading ? (
        <div className="form-section text-sm text-muted-foreground">Loading...</div>
      ) : error ? (
        <div className="form-section text-sm text-destructive">{error}</div>
      ) : feesData.length === 0 ? (
        <div className="form-section text-sm text-muted-foreground">No fee records found.</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {feesData.map(fee => (
          <div key={fee._id} className={`form-section border-l-4 ${String(fee.status).toUpperCase() === 'PAID' ? 'border-l-success' : 'border-l-warning'}`}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">{fee.feeType || 'Fee'}</h3>
                {fee.dueDate ? (
                  <p className="text-sm text-muted-foreground">
                    Due: {new Date(fee.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                ) : null}
              </div>
              <StatusBadge status={fee.status} variant={String(fee.status).toUpperCase() === 'PAID' ? 'paid' : 'pending'} />
            </div>
            <p className="text-2xl font-bold text-foreground">₹{Number(fee.totalAmount ?? fee.amount ?? 0).toLocaleString()}</p>
          </div>
        ))}
      </div>
      )}

      <div className="form-section">
        <h2 className="section-header">Fee Details</h2>
        <DataTable<FeeRowWithId>
          data={feesWithId}
          columns={[
            { key: 'feeType', header: 'Fee Type', render: (item) => item.feeType || 'Fee' },
            { key: 'totalAmount', header: 'Amount', render: (item) => `₹${Number(item.totalAmount ?? item.amount ?? 0).toLocaleString()}` },
            {
              key: 'dueDate', header: 'Due Date',
              render: (item) => item.dueDate ? new Date(item.dueDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : '-',
            },
            {
              key: 'status', header: 'Status',
              render: (item) => <StatusBadge status={item.status} variant={String(item.status).toUpperCase() === 'PAID' ? 'paid' : 'pending'} />,
            },
          ]}
        />
      </div>

      <div className="form-section bg-accent/50">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent rounded-lg"><AlertCircle className="w-6 h-6 text-accent-foreground" /></div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Payment Information</h3>
            <p className="text-sm text-muted-foreground">
              For online payments, please visit the school office or use the official school payment portal.
              Keep the payment receipt for your records. Contact the accounts department for any fee-related queries.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
