import { useState } from "react";
import { api } from "../api";

export default function ProjectForm({ onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) return setError("Project name is required.");
    if (trimmedName.length > 100)
      return setError("Project name must be 100 characters or less.");
    if (description.length > 500)
      return setError("Description must be 500 characters or less.");

    setSaving(true);
    setError("");
    try {
      await api.createProject({
        name: trimmedName,
        description: description.trim() || null,
      });
      setName("");
      setDescription("");
      onCreated();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Project name *"
        value={name}
        maxLength={100}
        onChange={(e) => setName(e.target.value)}
      />
      <textarea
        rows={2}
        placeholder="Description (optional)"
        value={description}
        maxLength={500}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <div>
        <button type="submit" disabled={saving}>
          {saving ? "Creating..." : "Create project"}
        </button>
      </div>
    </form>
  );
}