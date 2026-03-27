import { CheckCircle, XCircle, Clock } from "lucide-react";

const attendanceData = [
  { label: "Present", value: 28, color: "bg-success", icon: CheckCircle },
  { label: "Absent", value: 2, color: "bg-destructive", icon: XCircle },
  { label: "Late", value: 3, color: "bg-warning", icon: Clock },
];

export function AttendanceOverview() {
  const total = attendanceData.reduce((acc, item) => acc + item.value, 0);

  return (
    <div className="bg-card rounded-xl p-5 shadow-card animate-slide-up">
      <h3 className="font-semibold text-lg mb-4">Today's Attendance</h3>
      
      {/* Progress bar */}
      <div className="h-3 rounded-full bg-secondary flex overflow-hidden mb-4">
        {attendanceData.map((item, index) => (
          <div
            key={index}
            className={`${item.color} transition-all duration-500`}
            style={{ width: `${(item.value / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-4">
        {attendanceData.map((item, index) => (
          <div key={index} className="text-center">
            <div className={`w-10 h-10 rounded-lg ${item.color}/10 flex items-center justify-center mx-auto mb-2`}>
              <item.icon className={`w-5 h-5 ${item.color === 'bg-success' ? 'text-success' : item.color === 'bg-destructive' ? 'text-destructive' : 'text-warning'}`} />
            </div>
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
