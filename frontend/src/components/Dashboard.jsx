export default function Dashboard({ stats }) {
  if (!stats) return null;

  const cards = [
    { label: "Projects", value: stats.total_projects, cls: "" },
    { label: "Total tasks", value: stats.total_tasks, cls: "" },
    { label: "Pending", value: stats.pending, cls: "status-pending" },
    { label: "In progress", value: stats.in_progress, cls: "status-in-progress" },
    { label: "Completed", value: stats.completed, cls: "status-completed" },
  ];

  return (
    <section className="panel">
      <h2>Dashboard</h2>
      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className={`stat ${c.cls}`}>
            <div className="stat-value">{c.value}</div>
            <div className="stat-label">{c.label}</div>
          </div>
        ))}
      </div>
      <div className="progress">
        <div
          className="progress-bar"
          style={{ width: `${stats.completion_rate}%` }}
        />
      </div>
      <p className="muted">{stats.completion_rate}% of tasks completed</p>
    </section>
  );
}