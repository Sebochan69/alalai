import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsAPI } from "../../services/api";

export default function FileReportPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ address: "", description: "" });
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("address", form.address);
    formData.append("description", form.description);

    try {
      await reportsAPI.fileReport(formData);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to file complaint.");
    }
  };

  return (
    <section className="mx-auto max-w-2xl rounded-xl bg-white p-6 shadow">
      <h1 className="mb-4 text-2xl font-bold">File New Complaint</h1>

      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="Address / area" value={form.address}
          onChange={(e) => setForm({ ...form, address: e.target.value })} />
        <textarea className="h-40 w-full rounded border p-2" placeholder="Describe the complaint" value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="rounded bg-slate-900 px-4 py-2 text-white">Submit Complaint</button>
      </form>
    </section>
  );
}
