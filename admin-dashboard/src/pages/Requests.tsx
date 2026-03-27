import { useEffect, useMemo, useState } from "react";
import { Search, CheckCircle, XCircle, Clock, FileText, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { apiRequest } from "@/lib/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type RequestRow = {
  _id: string;
  userId: string;
  type: "LEAVE" | "DOCUMENT";
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt?: string;
};

const statusConfig = {
  PENDING: { label: "Pending", icon: Clock, className: "bg-warning/10 text-warning border-warning/20" },
  APPROVED: { label: "Approved", icon: CheckCircle, className: "bg-success/10 text-success border-success/20" },
  REJECTED: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive border-destructive/20" },
};

const Requests = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<RequestRow[]>([]);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      const res = await apiRequest<any>("/api/requests?limit=200");
      const rows: RequestRow[] = Array.isArray(res?.data) ? res.data : [];
      setItems(rows);
    } catch (e: any) {
      toast.error(e?.message || "Failed to load requests");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function notifyTeacher(request: RequestRow, nextStatus: "APPROVED" | "REJECTED") {
    const title = nextStatus === "APPROVED" ? "Leave Approved" : "Leave Rejected";
    const message = `${title}: ${request.reason}`;
    await apiRequest("/api/announcements", {
      method: "POST",
      body: {
        title,
        message,
        target: "teacher",
        targetUserId: request.userId,
        status: "PUBLISHED",
      },
    });
  }

  async function setStatus(request: RequestRow, next: "APPROVED" | "REJECTED") {
    try {
      setActionBusyId(request._id);
      if (next === "APPROVED") {
        await apiRequest(`/api/requests/${request._id}/approve`, { method: "PATCH" });
      } else {
        await apiRequest(`/api/requests/${request._id}/reject`, { method: "PATCH" });
      }
      await notifyTeacher(request, next);
      toast.success(`Request ${next === "APPROVED" ? "approved" : "rejected"}`);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Action failed");
    } finally {
      setActionBusyId(null);
    }
  }

  const filteredRequests = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((r) => {
      const matchesSearch =
        !q ||
        String(r.userId).toLowerCase().includes(q) ||
        String(r.reason).toLowerCase().includes(q) ||
        String(r.type).toLowerCase().includes(q);

      const matchesStatus = statusFilter === "all" || String(r.status).toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [items, searchQuery, statusFilter]);

  const pendingCount = useMemo(() => items.filter((r) => r.status === "PENDING").length, [items]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Requests</h1>
          <p className="text-muted-foreground">
            Manage leave and document requests
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount} pending</Badge>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl p-4 shadow-card">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg">All Requests</TabsTrigger>
          <TabsTrigger value="leave" className="rounded-lg">Leave</TabsTrigger>
          <TabsTrigger value="document" className="rounded-lg">Documents</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Requests List */}
          <div className="space-y-4">
            {loading ? (
              <div className="bg-card rounded-2xl p-5 shadow-card text-sm text-muted-foreground">Loading...</div>
            ) : filteredRequests.length === 0 ? (
              <div className="bg-card rounded-2xl p-5 shadow-card text-sm text-muted-foreground">No requests found.</div>
            ) : filteredRequests.map((request) => {
              const config = statusConfig[request.status as keyof typeof statusConfig];
              const StatusIcon = config.icon;
              return (
                <div
                  key={request._id}
                  className="bg-card rounded-2xl p-5 shadow-card hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={""} />
                      <AvatarFallback>{"U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="font-semibold">{request.userId}</h3>
                        <Badge variant="secondary" className="text-xs">{request.type}</Badge>
                        <Badge variant="outline" className={config.className}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{request.type === "LEAVE" ? "Leave Request" : "Document Request"}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{request.reason}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Submitted: {request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}
                        </span>
                      </div>
                    </div>
                    {request.status === "PENDING" && (
                      <div className="flex sm:flex-col gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="gap-1"
                          disabled={actionBusyId === request._id}
                          onClick={() => setStatus(request, "APPROVED")}
                        >
                          <CheckCircle className="w-4 h-4" />
                          {actionBusyId === request._id ? "Approving..." : "Approve"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1"
                          disabled={actionBusyId === request._id}
                          onClick={() => setStatus(request, "REJECTED")}
                        >
                          <XCircle className="w-4 h-4" />
                          {actionBusyId === request._id ? "Rejecting..." : "Reject"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="leave">
          <div className="space-y-4">
            {filteredRequests
              .filter((r) => r.type === "LEAVE")
              .map((request) => {
                const config = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={request._id}
                    className="bg-card rounded-2xl p-5 shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={""} />
                        <AvatarFallback>{"U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.userId}</h3>
                          <Badge variant="outline" className={config.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                        <p className="text-xs text-muted-foreground mt-2">{request.createdAt ? new Date(request.createdAt).toLocaleString() : "-"}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>

        <TabsContent value="document">
          <div className="space-y-4">
            {filteredRequests
              .filter((r) => r.type === "DOCUMENT")
              .map((request) => {
                const config = statusConfig[request.status as keyof typeof statusConfig];
                const StatusIcon = config.icon;
                return (
                  <div
                    key={request._id}
                    className="bg-card rounded-2xl p-5 shadow-card"
                  >
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={""} />
                        <AvatarFallback>{"U"}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{request.userId}</h3>
                          <Badge variant="outline" className={config.className}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{request.reason}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;
