import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Clock, Save, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const students = [
  { id: 1, name: "Aisha Patel", rollNo: "01", status: "present" },
  { id: 2, name: "Raj Kumar", rollNo: "02", status: "present" },
  { id: 3, name: "Priya Singh", rollNo: "03", status: "absent" },
  { id: 4, name: "Arjun Mehta", rollNo: "04", status: "present" },
  { id: 5, name: "Sneha Gupta", rollNo: "05", status: "late" },
  { id: 6, name: "Vikram Sharma", rollNo: "06", status: "present" },
  { id: 7, name: "Ananya Reddy", rollNo: "07", status: "present" },
  { id: 8, name: "Rohan Kapoor", rollNo: "08", status: "absent" },
  { id: 9, name: "Kavya Iyer", rollNo: "09", status: "present" },
  { id: 10, name: "Dhruv Nair", rollNo: "10", status: "present" },
];

type Status = "present" | "absent" | "late";

const Attendance = () => {
  const [attendanceData, setAttendanceData] = useState(students);
  const { toast } = useToast();

  const updateStatus = (id: number, status: Status) => {
    setAttendanceData(prev =>
      prev.map(student =>
        student.id === id ? { ...student, status } : student
      )
    );
  };

  const handleSave = () => {
    toast({
      title: "Attendance Saved",
      description: "Attendance has been recorded successfully.",
    });
  };

  const presentCount = attendanceData.filter(s => s.status === "present").length;
  const absentCount = attendanceData.filter(s => s.status === "absent").length;
  const lateCount = attendanceData.filter(s => s.status === "late").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Mark and manage student attendance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="10-A">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-A">Class 10-A</SelectItem>
              <SelectItem value="10-B">Class 10-B</SelectItem>
              <SelectItem value="9-A">Class 9-A</SelectItem>
              <SelectItem value="9-B">Class 9-B</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 animate-slide-up">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold">{presentCount}</p>
            <p className="text-sm text-muted-foreground">Present</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <XCircle className="w-5 h-5 text-destructive" />
          </div>
          <div>
            <p className="text-2xl font-bold">{absentCount}</p>
            <p className="text-sm text-muted-foreground">Absent</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold">{lateCount}</p>
            <p className="text-sm text-muted-foreground">Late</p>
          </div>
        </Card>
      </div>

      {/* Student List */}
      <Card className="overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
        <div className="p-4 border-b bg-secondary/30 flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">Class 10-A Students</span>
          <span className="text-sm text-muted-foreground ml-auto">{students.length} students</span>
        </div>
        <div className="divide-y">
          {attendanceData.map((student, index) => (
            <div 
              key={student.id}
              className="p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{student.name.split(' ').map(n => n[0]).join('')}</span>
                </div>
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["present", "absent", "late"] as Status[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(student.id, status)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                      student.status === status
                        ? status === "present"
                          ? "bg-success text-success-foreground"
                          : status === "absent"
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-warning text-warning-foreground"
                        : "bg-secondary hover:bg-secondary/80"
                    )}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Attendance;
