import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { reportsAPI } from "../../services/api";

export default function CitizenDashboard() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    reportsAPI.getMyReports().then(({ data }) => setReports(data));
  }, []);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Complaints</h1>
        <Link className="rounded bg-slate-900 px-4 py-2 text-white" to="/report/new">File New Complaint</Link>
      </div>

      <div className="rounded-xl bg-white shadow">
        {reports.map((report) => (
          <Link key={report.id} to={`/report/${report.id}`} className="block border-b p-4 hover:bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">#{report.id} — {report.ai_summary || report.description}</p>
                <p className="text-sm text-slate-600">{report.tag} · {report.priority}</p>
              </div>
              <StatusBadge status={report.status} />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
