import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/api";

type Student = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  className?: string;
  status?: string;
};

const RecentStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rows = useMemo(() => {
    return students.map((s) => {
      const name = `${s.firstName || ""} ${s.lastName || ""}`.trim() || "-";
      return {
        id: s._id,
        name,
        email: s.email || "-",
        className: s.className || "-",
        status: String(s.status || "").toUpperCase() === "ACTIVE" ? "ACTIVE" : "INACTIVE",
      };
    });
  }, [students]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await apiRequest<any>("/api/students?limit=4");
        const items: Student[] = Array.isArray(res?.data) ? res.data : [];
        if (!mounted) return;
        setStudents(items);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Failed to load students");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-card rounded-2xl p-5 lg:p-6 shadow-card animate-slide-up w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-display font-semibold">Recent Students</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/students")}>
          View All
        </Button>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading students...</div>
      ) : error ? (
        <div className="text-sm text-destructive">{error}</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-muted-foreground">No students found.</div>
      ) : (
        <>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Student</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Class</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
              <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((student) => (
              <tr key={student.id} className="border-b border-border/50 hover:bg-muted/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={""} />
                      <AvatarFallback>{student.name.split(' ').filter(Boolean).map((n) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm">{student.name}</p>
                      <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge variant="secondary">{student.className}</Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={student.status === "ACTIVE" ? "default" : "outline"}>
                    {student.status}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => navigate(`/students/${student.id}`)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rows.map((student) => (
          <div key={student.id} className="p-4 rounded-xl bg-muted/50">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={""} />
                <AvatarFallback>{student.name.split(' ').filter(Boolean).map((n) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-medium">{student.name}</p>
                <p className="text-xs text-muted-foreground">{student.email}</p>
              </div>
              <Badge variant={student.status === "ACTIVE" ? "default" : "outline"} className="text-xs">
                {student.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{student.className}</Badge>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
        </>
      )}
    </div>
  );
};

export default RecentStudents;
