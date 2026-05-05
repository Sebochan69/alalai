import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import StatusBadge from "../../components/StatusBadge";
import { reportsAPI } from "../../services/api";

export default function ReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);

  useEffect(() => {
    reportsAPI.getMyReports().then(({ data }) => {
      setReport(data.find((item) => String(item.id) === String(id)));
    });
  }, [id]);

  const resolveReport = async () => {
    const { data } = await reportsAPI.updateStatus(id, { status: "resolved" });
    setReport(data);
  };

  if (!report) return <p>Loading...</p>;

  return (
    <section className="rounded-xl bg-white p-6 shadow">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Report #{report.id}</h1>
        <StatusBadge status={report.status} />
      </div>

      <p><strong>Address:</strong> {report.address}</p>
      <p><strong>Description:</strong> {report.description}</p>
      <p><strong>AI Summary:</strong> {report.ai_summary}</p>
      <p><strong>Tag:</strong> {report.tag}</p>
      <p><strong>Priority:</strong> {report.priority}</p>
      <p><strong>Admin Comment:</strong> {report.admin_comment || "No comment yet"}</p>

      {report.status === "for review" && (
        <button onClick={resolveReport} className="mt-4 rounded bg-green-700 px-4 py-2 text-white">
          Mark as Resolved
        </button>
      )}
    </section>
  );
}
