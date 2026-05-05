const styles = {
  pending: "bg-yellow-100 text-yellow-800",
  "in progress": "bg-blue-100 text-blue-800",
  "for review": "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}
