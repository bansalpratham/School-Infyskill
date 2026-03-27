import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Medal, Award, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

import { apiRequest } from "@/lib/api";

type Achievement = {
  _id: string;
  studentId: string;
  className: string;
  category: string;
  title: string;
  level: string;
  date: string;
  description?: string;
};

type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  className?: string;
};

const Achievements = () => {
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const [items, setItems] = useState<Achievement[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [category, setCategory] = useState("Academic");
  const [level, setLevel] = useState("SCHOOL");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");

  const studentById = useMemo(() => {
    const m = new Map<string, Student>();
    for (const s of students) m.set(String(s._id), s);
    return m;
  }, [students]);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const [achRes, stuRes] = await Promise.all([
        apiRequest<any>("/api/teacher/achievements?limit=200"),
        apiRequest<any>("/api/students?limit=500"),
      ]);

      setItems(Array.isArray(achRes?.data) ? achRes.data : []);
      setStudents(Array.isArray(stuRes?.data) ? stuRes.data : []);
    } catch (e: any) {
      setError(e?.message || "Failed to load achievements");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!studentId || !title.trim() || !date) {
      toast({
        title: "Error",
        description: "Student, title, and date are required.",
        variant: "destructive",
      });
      return;
    }

    const student = studentById.get(studentId);
    const className = String(student?.className || "").trim();
    if (!className) {
      toast({
        title: "Error",
        description: "Selected student is missing a class.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await apiRequest("/api/teacher/achievements", {
        method: "POST",
        body: {
          studentId,
          className,
          category,
          title: title.trim(),
          level,
          date,
          description: description.trim() || undefined,
        },
      });

      toast({
        title: "Achievement Added",
        description: "The achievement has been recorded successfully.",
      });
      setIsAdding(false);
      setTitle("");
      setDescription("");
      await load();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to add achievement",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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
          <form onSubmit={handleAdd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Student</label>
              <Select value={studentId} onValueChange={setStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => {
                    const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-";
                    return (
                      <SelectItem key={s._id} value={s._id}>
                        {name} ({s.className || "-"})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Literary">Literary</SelectItem>
                  <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                  <SelectItem value="Discipline">Discipline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SCHOOL">School</SelectItem>
                  <SelectItem value="DISTRICT">District</SelectItem>
                  <SelectItem value="STATE">State</SelectItem>
                  <SelectItem value="NATIONAL">National</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Achievement Title</label>
              <Input placeholder="e.g., Science Fair Winner" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">Description</label>
            <Textarea placeholder="Describe the achievement..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button type="submit" className="gap-2" disabled={saving}>
            <Trophy className="w-4 h-4" />
            {saving ? "Saving..." : "Add Achievement"}
          </Button>
          </form>
        </Card>
      )}

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
        ) : error ? (
          <Card className="p-4 text-sm text-destructive">{error}</Card>
        ) : items.length === 0 ? (
          <Card className="p-4 text-sm text-muted-foreground">No achievements yet.</Card>
        ) : items.map((achievement, index) => {
          const student = studentById.get(String(achievement.studentId));
          const studentName = `${student?.firstName || ""} ${student?.lastName || ""}`.trim() || "-";
          const Icon = achievement.category === "Academic" ? Award : achievement.category === "Sports" ? Trophy : achievement.category === "Discipline" ? Star : Medal;
          return (
            <Card 
              key={achievement._id}
              className="p-5 hover:shadow-card-hover transition-shadow animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start gap-4">
                <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center", "bg-primary") }>
                  <Icon className="w-7 h-7 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-semibold">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{studentName} • Class {achievement.className}</p>
                    </div>
                    <span className="px-2 py-1 bg-secondary text-xs rounded-full font-medium">
                      {achievement.level}
                    </span>
                  </div>
                  <p className="text-sm mt-2">{achievement.description || '-'}</p>
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
