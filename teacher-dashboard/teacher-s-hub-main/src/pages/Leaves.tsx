import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, CheckCircle, XCircle, Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const leaveRequests = [
  {
    id: 1,
    type: "Sick Leave",
    fromDate: "2024-03-25",
    toDate: "2024-03-26",
    reason: "Medical appointment and recovery",
    status: "approved",
    appliedOn: "2024-03-18",
  },
  {
    id: 2,
    type: "Personal Leave",
    fromDate: "2024-04-01",
    toDate: "2024-04-01",
    reason: "Family function",
    status: "pending",
    appliedOn: "2024-03-17",
  },
  {
    id: 3,
    type: "Casual Leave",
    fromDate: "2024-02-14",
    toDate: "2024-02-14",
    reason: "Personal work",
    status: "approved",
    appliedOn: "2024-02-10",
  },
  {
    id: 4,
    type: "Sick Leave",
    fromDate: "2024-01-20",
    toDate: "2024-01-21",
    reason: "Fever and cold",
    status: "rejected",
    appliedOn: "2024-01-19",
    remarks: "Substitute teacher not available for those dates",
  },
];

const leaveBalance = [
  { type: "Casual Leave", total: 12, used: 3, remaining: 9 },
  { type: "Sick Leave", total: 10, used: 4, remaining: 6 },
  { type: "Personal Leave", total: 5, used: 1, remaining: 4 },
];

const statusStyles = {
  approved: { bg: "bg-success/10", text: "text-success", icon: CheckCircle },
  pending: { bg: "bg-warning/10", text: "text-warning", icon: Clock },
  rejected: { bg: "bg-destructive/10", text: "text-destructive", icon: XCircle },
};

const Leaves = () => {
  const [isApplying, setIsApplying] = useState(false);
  const { toast } = useToast();

  const handleApply = () => {
    toast({
      title: "Leave Request Submitted",
      description: "Your leave request has been sent for approval.",
    });
    setIsApplying(false);
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

      {/* Leave Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up">
        {leaveBalance.map((leave, index) => (
          <Card key={index} className="p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">{leave.type}</h4>
            <div className="flex items-end justify-between">
              <div>
                <span className="text-3xl font-bold text-primary">{leave.remaining}</span>
                <span className="text-muted-foreground ml-1">/ {leave.total}</span>
              </div>
              <div className="text-right text-sm">
                <p className="text-muted-foreground">Used: {leave.used}</p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${(leave.remaining / leave.total) * 100}%` }}
              />
            </div>
          </Card>
        ))}
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="casual">Casual Leave</SelectItem>
                  <SelectItem value="sick">Sick Leave</SelectItem>
                  <SelectItem value="personal">Personal Leave</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">From Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">To Date</label>
              <Input type="date" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Reason</label>
            <Textarea placeholder="Enter reason for leave..." rows={3} />
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
          {leaveRequests.map((request, index) => {
            const style = statusStyles[request.status as keyof typeof statusStyles];
            const StatusIcon = style.icon;
            
            return (
              <Card 
                key={request.id}
                className="p-4 animate-slide-up"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", style.bg)}>
                      <StatusIcon className={cn("w-5 h-5", style.text)} />
                    </div>
                    <div>
                      <h4 className="font-semibold">{request.type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.fromDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {request.fromDate !== request.toDate && 
                          ` - ${new Date(request.toDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                        }
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">{request.reason}</p>
                      {request.remarks && (
                        <p className="text-sm text-destructive mt-1">Remarks: {request.remarks}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium capitalize",
                      style.bg, style.text
                    )}>
                      {request.status}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Applied: {new Date(request.appliedOn).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Leaves;
