import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import TimeTable from "./pages/TimeTable";
import Attendance from "./pages/Attendance";
import Diary from "./pages/Diary";
import Achievements from "./pages/Achievements";
import Exams from "./pages/Exams";
import Feedback from "./pages/Feedback";
import Leaves from "./pages/Leaves";
import Meetings from "./pages/Meetings";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import ReportCard from "./pages/ReportCard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const token = localStorage.getItem("token");
  if (!isAuthenticated || !token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route element={(
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          )}>
            <Route path="/dashboard" element={<Index />} />
            <Route path="/timetable" element={<TimeTable />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/report-card" element={<ReportCard />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/exams" element={<Exams />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/leaves" element={<Leaves />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
