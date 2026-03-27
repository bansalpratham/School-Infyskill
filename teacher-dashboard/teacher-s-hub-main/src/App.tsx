import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import TimeTable from "./pages/TimeTable";
import Attendance from "./pages/Attendance";
import Diary from "./pages/Diary";
import Feedback from "./pages/Feedback";
import Notifications from "./pages/Notifications";
import ReportCard from "./pages/ReportCard";
import Meetings from "./pages/Meetings";
import Leaves from "./pages/Leaves";
import Achievements from "./pages/Achievements";
import Exams from "./pages/Exams";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/timetable" element={<TimeTable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/report-card" element={<ReportCard />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/exams" element={<Exams />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
