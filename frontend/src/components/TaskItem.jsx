import { useState } from "react";
import { api } from "../api";
import { STATUSES } from "../constants";

export default function TaskItem({ task, onChanged, onError }) {
  const [busy, setBusy] = useState(false);
  const statusClass = task.status.toLowerCase().replace(/\s+/g, "-");

  async function handleStatusChange(e) {
    setBusy(true);
    try {
      await api.updateTaskStatus(task.id, e.target.value);
      onError("");
      onChanged();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete task "${task.title}"?`)) return;
    setBusy(true);
    try {
      await api.deleteTask(task.id);
      onError("");
      onChanged();
    } catch (err) {
      onError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="task">
      <div className="task-info">
        <div className="task-title">{task.title}</div>
        {task.description && <div className="muted">{task.description}</div>}
        <span className={`badge status-${statusClass}`}>{task.status}</span>
      </div>
      <div className="task-actions">
        <select value={task.status} onChange={handleStatusChange} disabled={busy}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="button" className="danger" onClick={handleDelete} disabled={busy}>
          Delete
        </button>
      </div>
    </li>
  );
}