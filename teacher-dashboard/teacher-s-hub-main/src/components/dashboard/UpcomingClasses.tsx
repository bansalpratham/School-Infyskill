import { Clock } from "lucide-react";

const classes = [
  { subject: "Mathematics", class: "Class 10-A", time: "09:00 AM", room: "Room 201", color: "bg-primary" },
  { subject: "Algebra", class: "Class 9-B", time: "10:30 AM", room: "Room 203", color: "bg-accent" },
  { subject: "Geometry", class: "Class 11-A", time: "12:00 PM", room: "Room 105", color: "bg-success" },
  { subject: "Statistics", class: "Class 12-C", time: "02:30 PM", room: "Room 302", color: "bg-warning" },
];

export function UpcomingClasses() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card animate-slide-up">
      <h3 className="font-semibold text-lg mb-4">Today's Schedule</h3>
      <div className="space-y-3">
        {classes.map((item, index) => (
          <div 
            key={index}
            className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`w-1 h-12 rounded-full ${item.color}`} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{item.subject}</p>
              <p className="text-sm text-muted-foreground">{item.class} • {item.room}</p>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{item.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
