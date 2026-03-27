import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, MessageSquare, Calendar, Trophy, AlertCircle, Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "message",
    title: "New feedback received",
    description: "Mrs. Patel sent feedback about Aisha's progress in Mathematics",
    time: "5 minutes ago",
    read: false,
    icon: MessageSquare,
  },
  {
    id: 2,
    type: "calendar",
    title: "PTA Meeting Tomorrow",
    description: "Parent-Teacher meeting scheduled for 3:00 PM in the auditorium",
    time: "1 hour ago",
    read: false,
    icon: Calendar,
  },
  {
    id: 3,
    type: "achievement",
    title: "Student Achievement",
    description: "Raj Kumar won first place in the Inter-school Math Olympiad",
    time: "2 hours ago",
    read: true,
    icon: Trophy,
  },
  {
    id: 4,
    type: "alert",
    title: "Leave Approved",
    description: "Your leave request for March 25-26 has been approved by the Principal",
    time: "Yesterday",
    read: true,
    icon: AlertCircle,
  },
  {
    id: 5,
    type: "message",
    title: "Staff Meeting Reminder",
    description: "Weekly staff meeting at 4:00 PM today in the conference room",
    time: "Yesterday",
    read: true,
    icon: Bell,
  },
  {
    id: 6,
    type: "calendar",
    title: "Exam Schedule Published",
    description: "Final exam schedule for Class 10 has been published",
    time: "2 days ago",
    read: true,
    icon: Calendar,
  },
];

const typeStyles = {
  message: { bg: "bg-info/10", icon: "text-info" },
  calendar: { bg: "bg-accent/10", icon: "text-accent" },
  achievement: { bg: "bg-warning/10", icon: "text-warning" },
  alert: { bg: "bg-success/10", icon: "text-success" },
};

const Notifications = () => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <CheckCheck className="w-4 h-4" />
          Mark all as read
        </Button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification, index) => {
          const styles = typeStyles[notification.type as keyof typeof typeStyles];
          const Icon = notification.icon;
          
          return (
            <Card
              key={notification.id}
              className={cn(
                "p-4 flex items-start gap-4 transition-all duration-200 hover:shadow-card-hover cursor-pointer animate-slide-up",
                !notification.read && "border-l-4 border-l-primary bg-primary/5"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", styles.bg)}>
                <Icon className={cn("w-6 h-6", styles.icon)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className={cn("font-semibold", !notification.read && "text-primary")}>
                    {notification.title}
                  </h4>
                  {!notification.read && (
                    <span className="w-2.5 h-2.5 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{notification.description}</p>
                <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Notifications;
