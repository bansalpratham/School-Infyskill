import { Bell, MessageSquare, Calendar, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
  { 
    icon: MessageSquare, 
    title: "New feedback from parent", 
    description: "Mrs. Patel left feedback about homework",
    time: "5 min ago",
    type: "message"
  },
  { 
    icon: Calendar, 
    title: "Meeting scheduled", 
    description: "PTA meeting tomorrow at 3:00 PM",
    time: "1 hour ago",
    type: "calendar"
  },
  { 
    icon: Trophy, 
    title: "Student achievement", 
    description: "Raj Kumar won Math Olympiad",
    time: "2 hours ago",
    type: "achievement"
  },
  { 
    icon: Bell, 
    title: "Leave approved", 
    description: "Your leave request has been approved",
    time: "Yesterday",
    type: "notification"
  },
];

const iconStyles = {
  message: "bg-info/10 text-info",
  calendar: "bg-accent/10 text-accent",
  achievement: "bg-warning/10 text-warning",
  notification: "bg-success/10 text-success",
};

export function RecentNotifications() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Recent Notifications</h3>
        <button className="text-sm text-primary font-medium hover:underline">View all</button>
      </div>
      <div className="space-y-3">
        {notifications.map((item, index) => (
          <div 
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors cursor-pointer"
          >
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", iconStyles[item.type as keyof typeof iconStyles])}>
              <item.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{item.title}</p>
              <p className="text-sm text-muted-foreground truncate">{item.description}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
