import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Calendar, Clock, FileText, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const exams = [
  {
    id: 1,
    subject: "Mathematics",
    class: "10-A",
    type: "Unit Test",
    date: "2024-03-22",
    time: "09:00 AM - 10:30 AM",
    duration: "1.5 hours",
    totalMarks: 50,
    syllabus: "Chapter 5: Quadratic Equations, Chapter 6: Arithmetic Progressions",
    status: "upcoming",
  },
  {
    id: 2,
    subject: "Mathematics",
    class: "9-B",
    type: "Class Test",
    date: "2024-03-21",
    time: "11:00 AM - 11:45 AM",
    duration: "45 minutes",
    totalMarks: 25,
    syllabus: "Chapter 8: Linear Equations in Two Variables",
    status: "upcoming",
  },
  {
    id: 3,
    subject: "Algebra",
    class: "11-A",
    type: "Mid-Term",
    date: "2024-04-05",
    time: "09:00 AM - 12:00 PM",
    duration: "3 hours",
    totalMarks: 100,
    syllabus: "Chapters 1-6 (Full mid-term syllabus)",
    status: "scheduled",
  },
  {
    id: 4,
    subject: "Mathematics",
    class: "10-A",
    type: "Unit Test",
    date: "2024-03-01",
    time: "09:00 AM - 10:30 AM",
    duration: "1.5 hours",
    totalMarks: 50,
    syllabus: "Chapter 3: Pair of Linear Equations, Chapter 4: Quadratic Equations",
    status: "completed",
  },
];

const statusStyles = {
  upcoming: { bg: "bg-accent/10", text: "text-accent", label: "Upcoming" },
  scheduled: { bg: "bg-info/10", text: "text-info", label: "Scheduled" },
  completed: { bg: "bg-success/10", text: "text-success", label: "Completed" },
};

const Exams = () => {
  const [isScheduling, setIsScheduling] = useState(false);
  const { toast } = useToast();

  const handleSchedule = () => {
    toast({
      title: "Exam Scheduled",
      description: "The exam has been added to the schedule.",
    });
    setIsScheduling(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Scheduled Exams</h1>
          <p className="text-muted-foreground">Manage and track examination schedules</p>
        </div>
        <Button onClick={() => setIsScheduling(!isScheduling)} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule Exam
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        {[
          { label: "This Week", value: "2", color: "text-accent" },
          { label: "This Month", value: "5", color: "text-primary" },
          { label: "Pending Results", value: "1", color: "text-warning" },
          { label: "Completed", value: "12", color: "text-success" },
        ].map((stat, index) => (
          <Card key={index} className="p-4 text-center">
            <p className={cn("text-3xl font-bold", stat.color)}>{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Schedule Exam Form */}
      {isScheduling && (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Schedule New Exam</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsScheduling(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="algebra">Algebra</SelectItem>
                  <SelectItem value="geometry">Geometry</SelectItem>
                  <SelectItem value="statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10-A">Class 10-A</SelectItem>
                  <SelectItem value="10-B">Class 10-B</SelectItem>
                  <SelectItem value="9-A">Class 9-A</SelectItem>
                  <SelectItem value="9-B">Class 9-B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Exam Type</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="class">Class Test</SelectItem>
                  <SelectItem value="unit">Unit Test</SelectItem>
                  <SelectItem value="mid">Mid-Term</SelectItem>
                  <SelectItem value="final">Final</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time</label>
              <Input type="time" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="45">45 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                  <SelectItem value="180">3 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Total Marks</label>
              <Input type="number" placeholder="e.g., 50" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Syllabus</label>
              <Input placeholder="e.g., Chapters 5-6" />
            </div>
          </div>
          <Button onClick={handleSchedule} className="gap-2">
            <Calendar className="w-4 h-4" />
            Schedule Exam
          </Button>
        </Card>
      )}

      {/* Exam List */}
      <div className="space-y-4">
        {["upcoming", "scheduled", "completed"].map((status) => {
          const filteredExams = exams.filter(e => e.status === status);
          if (filteredExams.length === 0) return null;
          
          const style = statusStyles[status as keyof typeof statusStyles];
          
          return (
            <div key={status}>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <span className={cn("w-2 h-2 rounded-full", style.bg.replace('/10', ''))} />
                {style.label} Exams
              </h3>
              <div className="space-y-3">
                {filteredExams.map((exam, index) => (
                  <Card 
                    key={exam.id}
                    className="p-5 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold">{exam.subject}</h4>
                            <span className="px-2 py-0.5 bg-secondary rounded text-xs">{exam.type}</span>
                            <span className={cn("px-2 py-0.5 rounded text-xs", style.bg, style.text)}>
                              {style.label}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">Class {exam.class}</p>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(exam.date).toLocaleDateString('en-US', { 
                            weekday: 'short', month: 'short', day: 'numeric' 
                          })}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{exam.duration}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <FileText className="w-4 h-4" />
                          <span>{exam.totalMarks} marks</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 rounded-lg bg-secondary/50">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Syllabus</p>
                      <p className="text-sm">{exam.syllabus}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Exams;
