import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const { data } = await authAPI.login(form);
      setAuth(data);
      navigate(data.role === "admin" ? "/admin" : "/dashboard");
    } catch {
      setError("Invalid email or password.");
    }
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Login to AlalAI</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="w-full rounded bg-slate-900 p-2 text-white">Login</button>
      </form>
      <p className="mt-4 text-sm">No account? <Link className="underline" to="/register">Register</Link></p>
    </div>
  );
}
