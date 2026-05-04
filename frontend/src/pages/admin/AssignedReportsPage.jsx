import { useEffect, useState } from "react";
import StatusBadge from "../../components/StatusBadge";
import { reportsAPI } from "../../services/api";

export default function AssignedReportsPage() {
  const [reports, setReports] = useState([]);

  const load = () => reportsAPI.getAssignedReports().then(({ data }) => setReports(data));

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await reportsAPI.updateStatus(id, { status });
    load();
  };

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">Assigned Reports</h1>

      <div className="rounded-xl bg-white shadow">
        {reports.map((report) => (
          <div key={report.id} className="border-b p-4">
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="font-semibold">#{report.id} — {report.ai_summary}</p>
                <p className="text-sm text-slate-600">{report.address}</p>
                <p className="text-sm text-slate-600">{report.tag} · {report.priority}</p>
              </div>
              <StatusBadge status={report.status} />
            </div>

            <select
              className="rounded border p-2"
              value={report.status}
              onChange={(e) => updateStatus(report.id, e.target.value)}
            >
              <option value="pending">pending</option>
              <option value="in progress">in progress</option>
              <option value="for review">for review</option>
            </select>
          </div>
        ))}
      </div>
    </section>
  );
}
