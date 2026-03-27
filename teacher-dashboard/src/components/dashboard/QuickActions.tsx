import { Plus, ClipboardCheck, BookOpen, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const actions = [
  { icon: ClipboardCheck, label: "Mark Attendance", path: "/attendance", variant: "default" as const },
  { icon: BookOpen, label: "Add Diary Entry", path: "/diary", variant: "accent" as const },
  { icon: MessageSquare, label: "Send Feedback", path: "/feedback", variant: "secondary" as const },
  { icon: Plus, label: "Schedule Meeting", path: "/meetings", variant: "outline" as const },
];

export function QuickActions() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-card animate-slide-up">
      <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            className="h-auto py-4 flex-col gap-2"
            asChild
          >
            <Link to={action.path}>
              <action.icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
