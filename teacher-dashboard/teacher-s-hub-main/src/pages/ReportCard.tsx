import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FileText, Download, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const students = [
  { 
    id: 1, 
    name: "Aisha Patel", 
    rollNo: "01",
    subjects: {
      Mathematics: { marks: 92, grade: "A+", trend: "up" },
      Science: { marks: 88, grade: "A", trend: "up" },
      English: { marks: 85, grade: "A", trend: "stable" },
      History: { marks: 78, grade: "B+", trend: "up" },
      Hindi: { marks: 90, grade: "A+", trend: "stable" },
    },
    total: 433,
    percentage: 86.6,
    rank: 3,
  },
  { 
    id: 2, 
    name: "Raj Kumar", 
    rollNo: "02",
    subjects: {
      Mathematics: { marks: 95, grade: "A+", trend: "up" },
      Science: { marks: 91, grade: "A+", trend: "stable" },
      English: { marks: 82, grade: "A", trend: "down" },
      History: { marks: 88, grade: "A", trend: "up" },
      Hindi: { marks: 85, grade: "A", trend: "stable" },
    },
    total: 441,
    percentage: 88.2,
    rank: 1,
  },
  { 
    id: 3, 
    name: "Priya Singh", 
    rollNo: "03",
    subjects: {
      Mathematics: { marks: 78, grade: "B+", trend: "up" },
      Science: { marks: 82, grade: "A", trend: "stable" },
      English: { marks: 90, grade: "A+", trend: "up" },
      History: { marks: 85, grade: "A", trend: "stable" },
      Hindi: { marks: 88, grade: "A", trend: "up" },
    },
    total: 423,
    percentage: 84.6,
    rank: 5,
  },
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case "up": return <TrendingUp className="w-4 h-4 text-success" />;
    case "down": return <TrendingDown className="w-4 h-4 text-destructive" />;
    default: return <Minus className="w-4 h-4 text-muted-foreground" />;
  }
};

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-success/10 text-success";
  if (grade.startsWith("B")) return "bg-info/10 text-info";
  if (grade.startsWith("C")) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
};

const ReportCard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Report Cards</h1>
          <p className="text-muted-foreground">View and manage student report cards</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="10-A">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-A">Class 10-A</SelectItem>
              <SelectItem value="10-B">Class 10-B</SelectItem>
              <SelectItem value="9-A">Class 9-A</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="term1">
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="term1">Term 1</SelectItem>
              <SelectItem value="term2">Term 2</SelectItem>
              <SelectItem value="final">Final</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search students..." className="pl-10" />
        </div>
      </div>

      {/* Student Report Cards */}
      <div className="space-y-4">
        {students.map((student, index) => (
          <Card 
            key={student.id}
            className="overflow-hidden animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Student Header */}
            <div className="p-4 bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">
                    {student.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">Roll No: {student.rollNo}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{student.percentage}%</p>
                  <p className="text-xs text-muted-foreground">Overall</p>
                </div>
                <div className="text-center px-4 border-l">
                  <p className="text-2xl font-bold">#{student.rank}</p>
                  <p className="text-xs text-muted-foreground">Class Rank</p>
                </div>
                <Button variant="outline" size="sm" className="gap-1">
                  <Download className="w-4 h-4" />
                  PDF
                </Button>
              </div>
            </div>

            {/* Subjects Grid */}
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(student.subjects).map(([subject, data]) => (
                  <div key={subject} className="p-3 rounded-lg bg-secondary/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium truncate">{subject}</span>
                      {getTrendIcon(data.trend)}
                    </div>
                    <div className="flex items-end justify-between">
                      <span className="text-2xl font-bold">{data.marks}</span>
                      <span className={cn("px-2 py-0.5 rounded text-xs font-medium", getGradeColor(data.grade))}>
                        {data.grade}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ReportCard;
