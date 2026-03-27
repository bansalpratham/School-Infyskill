import { Link, useLocation } from "react-router-dom";
import { 
  User, 
  Calendar, 
  ClipboardCheck, 
  BookOpen, 
  FileText, 
  GraduationCap,
  LayoutDashboard,
  Bell,
  Trophy,
  MessageSquare,
  CalendarDays,
  CalendarOff,
  LogOut,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/api";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: Calendar, label: "Time Table", path: "/timetable" },
  { icon: ClipboardCheck, label: "Attendance", path: "/attendance" },
  { icon: BookOpen, label: "Diary", path: "/diary" },
  { icon: FileText, label: "Report Card", path: "/report-card" },
  { icon: Trophy, label: "Achievements", path: "/achievements" },
  { icon: CalendarDays, label: "Meetings", path: "/meetings" },
  { icon: CalendarOff, label: "Leaves", path: "/leaves" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: MessageSquare, label: "Feedback", path: "/feedback" },
  { icon: GraduationCap, label: "Exams", path: "/exams" },
  { icon: User, label: "Profile", path: "/profile" },
];

export function Sidebar({ open, onClose }: SidebarProps) {
  const location = useLocation();
  const user = getCurrentUser();
  const name = String(user?.name || "").trim() || "Teacher";
  const email = String(user?.email || "").trim();

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("schoolId");
    window.location.href = "/login";
  }

  return (
    <aside
      className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground flex flex-col transition-transform duration-300 ease-in-out",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">EduTrack</span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-accent transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{email || "Teacher"}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-destructive hover:bg-sidebar-accent"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
