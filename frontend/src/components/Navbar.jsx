import { Link, useNavigate } from "react-router-dom";
import { appConfig } from "../config/appConfig";
import { useAuthStore } from "../store/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="border-b bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link to="/" className="text-xl font-bold">{appConfig.appName}</Link>

        <div className="flex items-center gap-4">
          {user?.role === "citizen" && (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/report/new">File Complaint</Link>
            </>
          )}

          {user?.role === "admin" && (
            <>
              <Link to="/admin">Analytics</Link>
              <Link to="/admin/reports">Reports</Link>
              <Link to="/admin/map">Map</Link>
            </>
          )}

          {user && (
            <button onClick={handleLogout} className="rounded bg-slate-900 px-3 py-1 text-white">
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
