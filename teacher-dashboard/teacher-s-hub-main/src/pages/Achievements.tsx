import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Medal, Award, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const achievements = [
  {
    id: 1,
    student: "Raj Kumar",
    class: "10-A",
    title: "Math Olympiad Winner",
    category: "Academic",
    level: "Inter-school",
    date: "2024-03-15",
    description: "Won first place in the Regional Math Olympiad 2024",
    icon: Trophy,
    color: "bg-warning",
  },
  {
    id: 2,
    student: "Aisha Patel",
    class: "10-A",
    title: "Science Fair - Best Project",
    category: "Academic",
    level: "School",
    date: "2024-03-10",
    description: "Awarded best project for innovative solar panel design",
    icon: Award,
    color: "bg-primary",
  },
  {
    id: 3,
    student: "Priya Singh",
    class: "9-B",
    title: "Essay Writing Competition",
    category: "Literary",
    level: "District",
    date: "2024-02-28",
    description: "Second place in district-level essay competition on environmental conservation",
    icon: Medal,
    color: "bg-accent",
  },
  {
    id: 4,
    student: "Arjun Mehta",
    class: "10-A",
    title: "Perfect Attendance Award",
    category: "Discipline",
    level: "School",
    date: "2024-02-15",
    description: "100% attendance for the academic year 2023-24",
    icon: Star,
    color: "bg-success",
  },
];

const Achievements = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAdd = () => {
    toast({
      title: "Achievement Added",
      description: "The achievement has been recorded successfully.",
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Student Achievements</h1>
          <p className="text-muted-foreground">Celebrate and record student accomplishments</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Achievement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up">
        {[
          { label: "Total Achievements", value: "24", icon: Trophy, color: "bg-warning/10 text-warning" },
          { label: "This Month", value: "6", icon: Star, color: "bg-primary/10 text-primary" },
          { label: "Academic", value: "15", icon: Award, color: "bg-success/10 text-success" },
          { label: "Extra-curricular", value: "9", icon: Medal, color: "bg-accent/10 text-accent" },
        ].map((stat, index) => (
          <Card key={index} className="p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Achievement Form */}
      {isAdding && (
        <Card className="p-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Add New Achievement</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsAdding(false)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Student</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="raj">Raj Kumar (10-A)</SelectItem>
                  <SelectItem value="aisha">Aisha Patel (10-A)</SelectItem>
                  <SelectItem value="priya">Priya Singh (9-B)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="literary">Literary</SelectItem>
                  <SelectItem value="arts">Arts & Culture</SelectItem>
                  <SelectItem value="discipline">Discipline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">School</SelectItem>
                  <SelectItem value="inter-school">Inter-school</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="state">State</SelectItem>
                  <SelectItem value="national">National</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Achievement Title</label>
              <Input placeholder="e.g., Science Fair Winner" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input type="date" />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea placeholder="Describe the achievement..." rows={3} />
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Trophy className="w-4 h-4" />
            Add Achievement
          </Button>
        </Card>
      )}

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          return (
            <Card 
              key={achievement.id}
              className="p-5 hover:shadow-card-hover transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", achievement.color)}>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.student} • Class {achievement.class}</p>
                    </div>
                    <span className="px-2 py-1 bg-secondary text-xs rounded-full font-medium">
                      {achievement.level}
                    </span>
                  </div>
                  <p className="text-sm mt-2">{achievement.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                    <span className="px-2 py-0.5 bg-secondary rounded">{achievement.category}</span>
                    <span>{new Date(achievement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;
