import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Index from "./pages/Index";
import StudentProfile from "./pages/StudentProfile";
import Attendance from "./pages/Attendance";
import Homework from "./pages/Homework";
import MarksPerformance from "./pages/MarksPerformance";
import TeacherSchedule from "./pages/TeacherSchedule";
import Fees from "./pages/Fees";
import Achievements from "./pages/Achievements";
import Notifications from "./pages/Notifications";
import Announcements from "./pages/Announcements";
import Feedback from "./pages/Feedback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/student-profile" element={<StudentProfile />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/timetable" element={<TeacherSchedule />} />
        <Route path="/homework" element={<Homework />} />
        <Route path="/marks" element={<MarksPerformance />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/fees" element={<Fees />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
