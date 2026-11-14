import { useState } from "react";
import { api } from "../api";
import { STATUSES } from "../constants";

export default function TaskForm({ projectId, onCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Pending");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) return setError("Task title is required.");
    if (trimmedTitle.length > 200)
      return setError("Task title must be 200 characters or less.");
    if (description.length > 1000)
      return setError("Description must be 1000 characters or less.");

    setSaving(true);
    setError("");
    try {
      await api.createTask(projectId, {
        title: trimmedTitle,
        description: description.trim() || null,
        status,
      });
      setTitle("");
      setDescription("");
      setStatus("Pending");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form add-task" onSubmit={handleSubmit}>
      <div className="form-row">
        <input
          className="grow"
          type="text"
          placeholder="New task title *"
          value={title}
          maxLength={200}
          onChange={(e) => setTitle(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        maxLength={1000}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <div>
        <button type="submit" disabled={saving}>
          {saving ? "Adding..." : "Add task"}
        </button>
      </div>
    </form>
  );
}