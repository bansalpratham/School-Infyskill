import { useEffect, useState } from "react";
import { Users, GraduationCap, DollarSign, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import RecentAnnouncements from "@/components/dashboard/RecentAnnouncements";
import RecentStudents from "@/components/dashboard/RecentStudents";
import FeeOverview from "@/components/dashboard/FeeOverview";
import { apiRequest } from "@/lib/api";

type FeesSummary = {
  totals?: {
    paidAmount?: number;
    balanceAmount?: number;
    count?: number;
    totalAmount?: number;
  };
};

const Dashboard = () => {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [teacherCount, setTeacherCount] = useState<number | null>(null);
  const [feesCollected, setFeesCollected] = useState<number | null>(null);
  const [feesPending, setFeesPending] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [studentsRes, teachersRes, feesSummaryRes] = await Promise.all([
          apiRequest<any>("/api/students?limit=1"),
          apiRequest<any>("/api/teachers?limit=1"),
          apiRequest<any>("/api/fees/summary"),
        ]);

        const sTotal =
          typeof studentsRes?.meta?.total === "number"
            ? studentsRes.meta.total
            : typeof studentsRes?.total === "number"
              ? studentsRes.total
            : Array.isArray(studentsRes?.data)
              ? studentsRes.data.length
              : null;

        const tTotal =
          typeof teachersRes?.meta?.total === "number"
            ? teachersRes.meta.total
            : typeof teachersRes?.total === "number"
              ? teachersRes.total
            : Array.isArray(teachersRes?.data)
              ? teachersRes.data.length
              : null;

        const feesSummary: FeesSummary | null = feesSummaryRes?.data || null;
        const paid = typeof feesSummary?.totals?.paidAmount === "number" ? feesSummary.totals.paidAmount : null;
        const bal = typeof feesSummary?.totals?.balanceAmount === "number" ? feesSummary.totals.balanceAmount : null;

        if (!mounted) return;
        setStudentCount(sTotal);
        setTeacherCount(tTotal);
        setFeesCollected(paid);
        setFeesPending(bal);
      } catch {
        if (!mounted) return;
        setStudentCount(null);
        setTeacherCount(null);
        setFeesCollected(null);
        setFeesPending(null);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Grid - Updated for better mobile view */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={typeof studentCount === "number" ? studentCount.toLocaleString() : "-"}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="primary"
        />
        <StatCard
          title="Total Teachers"
          value={typeof teacherCount === "number" ? teacherCount.toLocaleString() : "-"}
          icon={GraduationCap}
          trend={{ value: 5, isPositive: true }}
          variant="accent"
        />
        <StatCard
          title="Fees Collected"
          value={typeof feesCollected === "number" ? `₹${feesCollected.toLocaleString()}` : "-"}
          icon={DollarSign}
          trend={{ value: 18, isPositive: true }}
          variant="success"
        />
        <StatCard
          title="Pending Fees"
          value={typeof feesPending === "number" ? `₹${feesPending.toLocaleString()}` : "-"}
          icon={TrendingUp}
          trend={{ value: 8, isPositive: false }}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <RecentStudents />
          <RecentAnnouncements />
        </div>
        <div className="space-y-6">
          <FeeOverview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;