import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { apiRequest, getCurrentUser } from "@/lib/api";

type LeaveRequest = {
  _id: string;
  userId: string;
  type: "LEAVE" | "DOCUMENT";
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
};

const statusStyles = {
  APPROVED: { bg: "bg-success/10", text: "text-success", icon: CheckCircle },
  PENDING: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  REJECTED: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
};

const Leaves = () => {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const user = getCurrentUser();
  const teacherId = String(user?.userId || user?._id || user?.id || "");

  const [items, setItems] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [leaveType, setLeaveType] = useState("Casual Leave");
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [reason, setReason] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError(null);
      if (!teacherId) {
        setItems([]);
        setError("Teacher id missing. Please log in again.");
        return;
      }

      const res = await apiRequest<any>(
        `/api/requests?userId=${encodeURIComponent(teacherId)}&type=LEAVE&limit=200`
      );
      const rows: LeaveRequest[] = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
    } catch (e: any) {
      setError(e?.message || "Failed to load leave requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  const stats = useMemo(() => {
    const pending = items.filter((i) => i.status === "PENDING").length;
    const approved = items.filter((i) => i.status === "APPROVED").length;
    const rejected = items.filter((i) => i.status === "REJECTED").length;
    return { pending, approved, rejected, total: items.length };
  }, [items]);

  const handleApply = async (e: FormEvent) => {
    e.preventDefault();
    if (!teacherId) {
      toast({ title: "Error", description: "Teacher id missing. Please log in again.", variant: "destructive" });
      return;
    }
    if (!leaveType || !fromDate || !toDate || !reason.trim()) {
      toast({ title: "Error", description: "Leave type, dates, and reason are required.", variant: "destructive" });
      return;
    }
    try {
      setSaving(true);
      await apiRequest("/api/requests", {
        method: "POST",
        body: { userId: teacherId, type: "LEAVE", reason: `[${leaveType}] ${fromDate} to ${toDate} - ${reason.trim()}` },
      });
      toast({ title: "Leave Request Submitted", description: "Your leave request has been sent for approval." });
      setIsApplying(false);
      setReason("");
      await load();
    } catch (err: any) {
      toast({ title: "Error", description: err?.message || "Failed to submit leave request", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">Apply for leaves and track your requests</p>
        </div>
        <Button onClick={() => setIsApplying(!isApplying)} className="gap-2">
          <Plus className="w-4 h-4" />
          Apply Leave
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary">{stats.total}</p>
          <p className="text-sm text-muted-foreground">Total</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-warning">{stats.pending}</p>
          <p className="text-sm text-muted-foreground">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-success">{stats.approved}</p>
          <p className="text-sm text-muted-foreground">Approved</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-destructive">{stats.rejected}</p>
          <p className="text-sm text-muted-foreground">Rejected</p>
        </Card>
      </div>

      {/* Apply Leave Form */}
      {isApplying && (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Apply for Leave</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsApplying(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Leave Type</label>
              <Select value={leaveType} onValueChange={setLeaveType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Casual Leave">Casual Leave</SelectItem>
                  <SelectItem value="Sick Leave">Sick Leave</SelectItem>
                  <SelectItem value="Personal Leave">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Reason</label>
            <Textarea placeholder="Enter reason for leave..." rows={3} value={reason} onChange={(e) => setReason(e.target.value)} />
          </div>
          <Button onClick={handleApply} className="gap-2">
            <Calendar className="w-4 h-4" />
            Submit Request
          </Button>
        </Card>
      )}

      {/* Leave Requests */}
      <div>
        <h3 className="font-semibold text-lg mb-4">Leave History</h3>
        <div className="space-y-3">
          {loading ? (
            <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
          ) : error ? (
            <Card className="p-4 text-sm text-destructive">{error}</Card>
          ) : items.length === 0 ? (
            <Card className="p-4 text-sm text-muted-foreground">No leave requests.</Card>
          ) : (
            items.map((request, index) => {
              const style = statusStyles[request.status as keyof typeof statusStyles];
              const StatusIcon = style.icon;
              return (
                <Card
                  key={request._id}
                  className="p-4 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-4">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style.bg)}>
                        <StatusIcon className={cn("w-5 h-5", style.text)} />
                      </div>
                      <div>
                        <h4 className="font-semibold">Leave Request</h4>
                        <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">{request.createdAt ? new Date(request.createdAt).toLocaleString() : ""}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-medium capitalize",
                        style.bg,
                        style.text
                      )}>
                        {request.status}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaves;
