
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppointmentProvider } from "./contexts/AppointmentContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AppointmentsPage from "./pages/AppointmentsPage";
import AvailabilityPage from "./pages/AvailabilityPage";
import FacultyDirectoryPage from "./pages/FacultyDirectoryPage";
import FacultyDetailPage from "./pages/FacultyDetailPage";
import NotFound from "./pages/NotFound";

import ProtectedRoute from '@/routing/ProtectedRoute';
import StudentDashboard from '@/pages/StudentDashboard';
import FacultyDashboard from '@/pages/FacultyDashboard';
import AdminDashboard from '@/pages/AdminDashboard';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <AppointmentProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/availability" element={<AvailabilityPage />} />
                <Route path="/faculty" element={<FacultyDirectoryPage />} />
                <Route path="/faculty/:id" element={<FacultyDetailPage />} />
                <Route path="*" element={<NotFound />} />

                {/* <Route path="/student/dashboard" element={<StudentDashboard />} /> */}
                <Route
                  path="/student/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['student']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  }
                />

      <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />

              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AppointmentProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
