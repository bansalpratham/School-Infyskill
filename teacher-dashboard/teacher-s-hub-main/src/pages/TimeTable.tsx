import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM"];

const schedule = {
  Monday: [
    { time: "09:00 AM", subject: "Mathematics", class: "10-A", room: "201" },
    { time: "11:00 AM", subject: "Algebra", class: "9-B", room: "203" },
    { time: "02:00 PM", subject: "Geometry", class: "11-A", room: "105" },
  ],
  Tuesday: [
    { time: "10:00 AM", subject: "Statistics", class: "12-C", room: "302" },
    { time: "12:00 PM", subject: "Mathematics", class: "10-B", room: "201" },
    { time: "03:00 PM", subject: "Calculus", class: "12-A", room: "301" },
  ],
  Wednesday: [
    { time: "09:00 AM", subject: "Algebra", class: "9-A", room: "203" },
    { time: "11:00 AM", subject: "Geometry", class: "10-A", room: "105" },
    { time: "02:00 PM", subject: "Mathematics", class: "11-B", room: "201" },
  ],
  Thursday: [
    { time: "10:00 AM", subject: "Calculus", class: "12-B", room: "301" },
    { time: "12:00 PM", subject: "Statistics", class: "11-A", room: "302" },
    { time: "03:00 PM", subject: "Algebra", class: "9-C", room: "203" },
  ],
  Friday: [
    { time: "09:00 AM", subject: "Mathematics", class: "10-C", room: "201" },
    { time: "11:00 AM", subject: "Geometry", class: "9-B", room: "105" },
    { time: "02:00 PM", subject: "Review Session", class: "All", room: "Auditorium" },
  ],
};

const getSubjectColor = (subject: string) => {
  const colors: Record<string, string> = {
    Mathematics: "bg-primary/10 border-primary/30 text-primary",
    Algebra: "bg-accent/10 border-accent/30 text-accent",
    Geometry: "bg-success/10 border-success/30 text-success",
    Statistics: "bg-warning/10 border-warning/30 text-warning",
    Calculus: "bg-info/10 border-info/30 text-info",
    "Review Session": "bg-secondary border-border",
  };
  return colors[subject] || "bg-secondary border-border";
};

const TimeTable = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Time Table</h1>
          <p className="text-muted-foreground">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="px-4 py-2 bg-secondary rounded-lg font-medium">Week 12, 2024</span>
          <Button variant="outline" size="icon">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Desktop View */}
      <Card className="hidden lg:block overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left font-semibold bg-secondary/50">Time</th>
                {days.map((day) => (
                  <th key={day} className="p-4 text-left font-semibold bg-secondary/50">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map((time) => (
                <tr key={time} className="border-b last:border-0">
                  <td className="p-4 font-medium text-muted-foreground">{time}</td>
                  {days.map((day) => {
                    const classInfo = schedule[day as keyof typeof schedule].find(c => c.time === time);
                    return (
                      <td key={day} className="p-2">
                        {classInfo ? (
                          <div className={`p-3 rounded-lg border ${getSubjectColor(classInfo.subject)}`}>
                            <p className="font-semibold text-sm">{classInfo.subject}</p>
                            <p className="text-xs mt-1 opacity-80">
                              Class {classInfo.class} • {classInfo.room}
                            </p>
                          </div>
                        ) : (
                          <div className="p-3 text-center text-muted-foreground text-sm">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Mobile View */}
      <div className="lg:hidden space-y-4">
        {days.map((day, dayIndex) => (
          <Card 
            key={day} 
            className="p-4 animate-slide-up"
            style={{ animationDelay: `${dayIndex * 50}ms` }}
          >
            <h3 className="font-semibold text-lg mb-3">{day}</h3>
            <div className="space-y-2">
              {schedule[day as keyof typeof schedule].map((classInfo, index) => (
                <div 
                  key={index}
                  className={`p-3 rounded-lg border ${getSubjectColor(classInfo.subject)}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{classInfo.subject}</p>
                      <p className="text-sm opacity-80">Class {classInfo.class}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{classInfo.time}</p>
                      <p className="opacity-80">{classInfo.room}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TimeTable;
