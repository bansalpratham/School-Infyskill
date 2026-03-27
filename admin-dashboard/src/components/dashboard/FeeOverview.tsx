import { useEffect, useMemo, useState } from "react";
import { DollarSign, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/api";

const FeeOverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<any>(null);
  const [recentFees, setRecentFees] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [summaryRes, feesRes] = await Promise.all([
          apiRequest<any>("/api/fees/summary"),
          apiRequest<any>("/api/fees?limit=3"),
        ]);

        if (!mounted) return;
        setSummary(summaryRes?.data || null);
        setRecentFees(Array.isArray(feesRes?.data) ? feesRes.data : []);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load fees");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const totals = summary?.totals || {};
  const totalFees = Number(totals?.totalAmount) || 0;
  const collected = Number(totals?.paidAmount) || 0;
  const pending = Number(totals?.balanceAmount) || 0;
  const collectionRate = totalFees > 0 ? (collected / totalFees) * 100 : 0;

  const recentPayments = useMemo(() => {
    return recentFees.map((f) => ({
      name: String(f?.studentId || "-"),
      amount: Number(f?.paidAmount) || 0,
      date: f?.createdAt ? new Date(f.createdAt).toLocaleDateString() : "-",
    }));
  }, [recentFees]);

  return (
    <div className="bg-card rounded-2xl p-5 lg:p-6 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-success/10">
            <DollarSign className="w-5 h-5 text-success" />
          </div>
          <h3 className="text-lg font-display font-semibold">Fee Overview</h3>
        </div>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading fee overview...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : (

      <div className="space-y-6">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Collection Progress</span>
            <span className="font-medium">{collectionRate.toFixed(1)}%</span>
          </div>
          <Progress value={collectionRate} className="h-3" />
        </div>

        {/* Stats - Updated grid columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-success/10">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Collected</span>
            </div>
            <p className="text-xl font-display font-bold">₹{collected.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-xl bg-warning/10">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-warning" />
              <span className="text-sm font-medium text-warning">Pending</span>
            </div>
            <p className="text-xl font-display font-bold">₹{pending.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent payments */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Recent Payments</h4>
          {recentPayments.length === 0 ? (
            <div className="text-sm text-muted-foreground">No payments found.</div>
          ) : (
            recentPayments.map((payment, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                <div>
                  <p className="text-sm font-medium">{payment.name}</p>
                  <p className="text-xs text-muted-foreground">{payment.date}</p>
                </div>
                <span className="text-sm font-semibold text-success">+₹{payment.amount.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </div>
      )}
    </div>
  );
};

export default FeeOverview;