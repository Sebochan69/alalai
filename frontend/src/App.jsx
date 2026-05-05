import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/authStore";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import FileReportPage from "./pages/citizen/FileReportPage";
import ReportDetailPage from "./pages/citizen/ReportDetailPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AssignedReportsPage from "./pages/admin/AssignedReportsPage";
import MapPage from "./pages/admin/MapPage";

function HomeRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRole="citizen">
                <CitizenDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/new"
            element={
              <ProtectedRoute allowedRole="citizen">
                <FileReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/report/:id"
            element={
              <ProtectedRoute>
                <ReportDetailPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <ProtectedRoute allowedRole="admin">
                <AssignedReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/map" element={<Navigate to="/map" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
