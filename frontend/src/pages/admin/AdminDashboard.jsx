import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { adminAPI } from "../../services/api";

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    adminAPI.getAnalytics().then(({ data }) => setAnalytics(data));
  }, []);

  if (!analytics) return <p>Loading analytics...</p>;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-bold">Barangay Analytics</h1>

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="font-semibold">Summary</h2>
        <p>{analytics.summary}</p>
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="mb-3 font-semibold">Top Issues</h2>
        <div className="h-72">
          <ResponsiveContainer>
            <BarChart data={analytics.top_issues || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tag" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <InfoList title="Hotspot Areas" items={analytics.hotspot_areas} />
        <InfoList title="Suggested Actions" items={analytics.suggested_actions} />
      </div>

      <div className="rounded-xl bg-white p-4 shadow">
        <h2 className="font-semibold">Forecast</h2>
        <p>{analytics.forecast}</p>
      </div>
    </section>
  );
}

function InfoList({ title, items = [] }) {
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <ul className="list-disc pl-5">
        {items.map((item, index) => <li key={index}>{item}</li>)}
      </ul>
    </div>
  );
}
