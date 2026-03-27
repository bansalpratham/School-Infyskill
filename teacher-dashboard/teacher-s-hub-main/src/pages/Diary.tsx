import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, BookOpen, Calendar, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const diaryEntries = [
  {
    id: 1,
    date: "2024-03-18",
    class: "10-A",
    subject: "Mathematics",
    homework: "Complete exercises 5.1 to 5.5 from textbook. Due: Wednesday",
    remarks: "Chapter 5 test on Friday. Please revise all formulas.",
  },
  {
    id: 2,
    date: "2024-03-17",
    class: "9-B",
    subject: "Algebra",
    homework: "Solve practice worksheet - Quadratic Equations",
    remarks: "Bring graph paper for next class.",
  },
  {
    id: 3,
    date: "2024-03-16",
    class: "11-A",
    subject: "Geometry",
    homework: "Prepare presentation on 3D shapes",
    remarks: "Group presentation due next Monday.",
  },
];

const Diary = () => {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const { toast } = useToast();

  const handleSubmit = () => {
    toast({
      title: "Diary Entry Added",
      description: "The diary entry has been sent to all parents.",
    });
    setIsAddingNew(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Diary</h1>
          <p className="text-muted-foreground">Record and share homework & remarks with parents</p>
        </div>
        <Button onClick={() => setIsAddingNew(!isAddingNew)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Entry
        </Button>
      </div>

      {/* New Entry Form */}
      {isAddingNew && (
        <Card className="p-6 animate-slide-up">
          <h3 className="font-semibold text-lg mb-4">Add New Diary Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
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
              <label className="text-sm font-medium mb-2 block">Subject</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mathematics">Mathematics</SelectItem>
                  <SelectItem value="algebra">Algebra</SelectItem>
                  <SelectItem value="geometry">Geometry</SelectItem>
                  <SelectItem value="statistics">Statistics</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Homework</label>
              <Textarea placeholder="Enter homework details..." rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Remarks / Notes</label>
              <Textarea placeholder="Any additional remarks for parents..." rows={2} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button onClick={handleSubmit} className="gap-2">
              <Send className="w-4 h-4" />
              Send to Parents
            </Button>
            <Button variant="outline" onClick={() => setIsAddingNew(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Diary Entries */}
      <div className="space-y-4">
        {diaryEntries.map((entry, index) => (
          <Card 
            key={entry.id} 
            className="p-5 animate-slide-up"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">{entry.subject}</h3>
                  <p className="text-sm text-muted-foreground">Class {entry.class}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>{new Date(entry.date).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-secondary/50">
                <p className="text-sm font-medium text-muted-foreground mb-1">Homework</p>
                <p>{entry.homework}</p>
              </div>
              {entry.remarks && (
                <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <p className="text-sm font-medium text-accent mb-1">Remarks</p>
                  <p className="text-sm">{entry.remarks}</p>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Diary;
