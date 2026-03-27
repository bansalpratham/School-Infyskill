import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Download, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";

const getGradeColor = (grade: string) => {
  if (grade.startsWith("A")) return "bg-success/10 text-success";
  if (grade.startsWith("B")) return "bg-info/10 text-info";
  if (grade.startsWith("C")) return "bg-warning/10 text-warning";
  return "bg-destructive/10 text-destructive";
};

type Student = {
  _id: string;
  firstName?: string;
  lastName?: string;
  className?: string;
  rollNumber?: string;
};

type AssignedClass = {
  _id: string;
  name: string;
  section: string;
};

type ResultItem = {
  _id: string;
  studentId: string;
  examName: string;
  subject: string;
  marks: number;
  grade?: string;
  status: "PASS" | "FAIL";
};

type ReportRow = {
  studentId: string;
  name: string;
  rollNo: string;
  className: string;
  subjects: Record<string, { marks: number; grade: string }>;
  total: number;
  percentage: number;
  rank: number;
};

const ReportCard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<ResultItem[]>([]);
  const [assignedClasses, setAssignedClasses] = useState<AssignedClass[]>([]);

  const [classFilter, setClassFilter] = useState<string>("__all__");
  const [examFilter, setExamFilter] = useState<string>("__all__");
  const [search, setSearch] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [stuRes, resRes, clsRes] = await Promise.all([
          apiRequest<any>("/api/students?limit=500"),
          apiRequest<any>("/api/results?limit=500"),
          apiRequest<any>("/api/classes/assigned"),
        ]);
        setStudents(Array.isArray(stuRes?.data) ? stuRes.data : []);
        setResults(Array.isArray(resRes?.data) ? resRes.data : []);
        setAssignedClasses(Array.isArray(clsRes?.data) ? clsRes.data : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load report cards");
        setStudents([]);
        setResults([]);
        setAssignedClasses([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allowedClassNames = useMemo(() => {
    const set = new Set<string>();
    for (const c of assignedClasses) {
      const key = `${String(c.name || "").trim()}-${String(c.section || "").trim()}`;
      if (key && key !== "-") set.add(key);
    }
    return set;
  }, [assignedClasses]);

  const allowedStudents = useMemo(() => {
    if (!allowedClassNames.size) return [] as Student[];
    return students.filter((s) => allowedClassNames.has(String(s.className || "").trim()));
  }, [students, allowedClassNames]);

  const allowedStudentIdSet = useMemo(() => {
    const set = new Set<string>();
    for (const s of allowedStudents) set.add(String(s._id));
    return set;
  }, [allowedStudents]);

  const classOptions = useMemo(() => {
    const s = new Set<string>();
    for (const st of allowedStudents) {
      const c = String(st.className || "").trim();
      if (c) s.add(c);
    }
    return Array.from(s).sort();
  }, [allowedStudents]);

  const examOptions = useMemo(() => {
    const s = new Set<string>();
    for (const r of results) {
      const e = String(r.examName || "").trim();
      if (e) s.add(e);
    }
    return Array.from(s).sort();
  }, [results]);

  const reportRows = useMemo((): ReportRow[] => {
    const cf = classFilter === "__all__" ? "" : classFilter.trim();
    const ef = examFilter === "__all__" ? "" : examFilter.trim();
    const q = search.trim().toLowerCase();

    const studentById = new Map<string, Student>();
    for (const st of allowedStudents) studentById.set(String(st._id), st);

    const filteredResults = results.filter((r) => {
      if (!allowedStudentIdSet.has(String(r.studentId))) return false;
      if (ef && String(r.examName || "") !== ef) return false;
      if (!cf) return true;
      const st = studentById.get(String(r.studentId));
      return String(st?.className || "") === cf;
    });

    const byStudent = new Map<string, ResultItem[]>();
    for (const r of filteredResults) {
      const sid = String(r.studentId);
      const arr = byStudent.get(sid) || [];
      arr.push(r);
      byStudent.set(sid, arr);
    }

    const rows: Omit<ReportRow, "rank">[] = [];
    for (const [sid, items] of byStudent.entries()) {
      const st = studentById.get(sid);
      const name = st ? [st.firstName, st.lastName].filter(Boolean).join(" ") || "Student" : "Student";
      const rollNo = String(st?.rollNumber || "-");
      const className = String(st?.className || "-");

      if (q) {
        const hay = `${name} ${rollNo} ${className}`.toLowerCase();
        if (!hay.includes(q)) continue;
      }

      const subjects: ReportRow["subjects"] = {};
      let total = 0;
      let count = 0;

      for (const r of items) {
        total += Number(r.marks) || 0;
        count += 1;
        subjects[String(r.subject)] = {
          marks: Number(r.marks) || 0,
          grade: String(r.grade || "-")
        };
      }

      const percentage = count ? Math.round((total / (count * 100)) * 1000) / 10 : 0;
      rows.push({ studentId: sid, name, rollNo, className, subjects, total, percentage });
    }

    const sorted = rows.sort((a, b) => b.percentage - a.percentage);
    return sorted.map((r, idx) => ({ ...r, rank: idx + 1 }));
  }, [allowedStudents, allowedStudentIdSet, results, classFilter, examFilter, search]);
  function handlePrintRow(row: ReportRow) {
    const ef = examFilter === "__all__" ? "" : examFilter.trim();
    if (!ef) {
      setError("Please select an Exam/Term to export PDF");
      return;
    }

    const subjectRows = Object.entries(row.subjects)
      .map(([subject, data]) => ({
        subject,
        marks: data?.marks ?? "-",
        grade: data?.grade ?? "-",
      }))
      .sort((a, b) => String(a.subject).localeCompare(String(b.subject)));

    const total = Number(row.total) || 0;
    const percentage = Number(row.percentage) || 0;

    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html>
        <head>
          <title>Report Card</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { margin: 0 0 8px 0; }
            .meta { margin-bottom: 16px; color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            th, td { border: 1px solid #ddd; padding: 8px; font-size: 13px; }
            th { background: #f5f5f5; text-align: left; }
            .summary { margin-top: 16px; font-weight: bold; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Report Card</h1>
          <div class="meta">
            <div><strong>Name:</strong> ${row.name}</div>
            <div><strong>Roll No:</strong> ${row.rollNo}</div>
            <div><strong>Class:</strong> ${row.className}</div>
            <div><strong>Exam:</strong> ${ef}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Marks</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${subjectRows
                .map(
                  (r) => `<tr><td>${r.subject}</td><td>${r.marks}</td><td>${r.grade}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
          <div class="summary">Total: ${total} | Percentage: ${percentage}%</div>
          <script>
            window.onload = () => { window.print(); };
          </script>
        </body>
      </html>
    `);
    w.document.close();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Report Cards</h1>
          <p className="text-muted-foreground">View and manage student report cards</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Classes</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>Class {c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={examFilter} onValueChange={setExamFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Term" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Exams</SelectItem>
              {examOptions.map((e) => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 animate-slide-up">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students..." className="pl-10" />
        </div>
      </div>

      {/* Student Report Cards */}
      <div className="space-y-4">
        {error && (
          <Card className="p-4 border-destructive/30">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        {!loading && !error && allowedClassNames.size === 0 && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">No class assigned to you yet. Please ask admin to assign you as class teacher.</p>
          </Card>
        )}

        {loading && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">Loading report cards...</p>
          </Card>
        )}

        {!loading && !error && reportRows.length === 0 && (
          <Card className="p-5">
            <p className="text-sm text-muted-foreground">No results published yet.</p>
          </Card>
        )}

        {!loading &&
          reportRows.map((student, index) => (
            <Card
              key={student.studentId}
              className="overflow-hidden animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Student Header */}
              <div className="p-4 bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold text-primary">
                      {student.name
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{student.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      Roll No: {student.rollNo} {student.className !== "-" ? `| Class ${student.className}` : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">{student.percentage}%</p>
                    <p className="text-xs text-muted-foreground">Overall</p>
                  </div>
                  <div className="text-center px-4 border-l">
                    <p className="text-2xl font-bold">#{student.rank}</p>
                    <p className="text-xs text-muted-foreground">Rank</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    disabled={examFilter === "__all__"}
                    onClick={() => handlePrintRow(student)}
                  >
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
