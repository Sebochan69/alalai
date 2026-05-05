import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });

  const submit = async (event) => {
    event.preventDefault();
    const { data } = await authAPI.register(form);
    setAuth(data);
    navigate("/dashboard");
  };

  return (
    <div className="mx-auto mt-16 max-w-md rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">Create Citizen Account</h1>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full rounded border p-2" placeholder="Full name" value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
        <input className="w-full rounded border p-2" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full rounded border p-2" type="password" placeholder="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="w-full rounded bg-slate-900 p-2 text-white">Register</button>
      </form>
      <p className="mt-4 text-sm">Already have an account? <Link className="underline" to="/login">Login</Link></p>
    </div>
  );
}
