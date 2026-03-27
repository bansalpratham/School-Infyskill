import { Users, BookOpen, ClipboardCheck, Calendar } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { UpcomingClasses } from "@/components/dashboard/UpcomingClasses";
import { RecentNotifications } from "@/components/dashboard/RecentNotifications";
import { AttendanceOverview } from "@/components/dashboard/AttendanceOverview";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Index = () => {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="animate-fade-in">
        <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, Sarah! 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your classes today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={156}
          icon={Users}
          trend={{ value: 5, positive: true }}
          variant="primary"
        />
        <StatCard
          title="Classes Today"
          value={4}
          icon={BookOpen}
          variant="accent"
        />
        <StatCard
          title="Attendance Rate"
          value="94%"
          icon={ClipboardCheck}
          trend={{ value: 2, positive: true }}
          variant="success"
        />
        <StatCard
          title="Pending Tasks"
          value={7}
          icon={Calendar}
          variant="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <UpcomingClasses />
          <RecentNotifications />
        </div>

        {/* Right Column - Overview & Actions */}
        <div className="space-y-6">
          <AttendanceOverview />
          <QuickActions />
        </div>
      </div>
    </div>
  );
};

export default Index;
