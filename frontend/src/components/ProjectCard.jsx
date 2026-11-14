import { api } from "../api";
import TaskForm from "./TaskForm";
import TaskItem from "./TaskItem";

export default function ProjectCard({ project, tasks, onChanged, onError }) {
  async function handleDelete() {
    if (!window.confirm(`Delete project "${project.name}" and all its tasks?`))
      return;
    try {
      await api.deleteProject(project.id);
      onError("");
      onChanged();
    } catch (err) {
      onError(err.message);
    }
  }

  return (
    <article className="card">
      <div className="card-header">
        <div>
          <h2>{project.name}</h2>
          {project.description && <p className="muted">{project.description}</p>}
          <p className="muted">{tasks.length} task(s)</p>
        </div>
        <button type="button" className="danger" onClick={handleDelete}>
          Delete project
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="muted">No tasks yet.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onChanged={onChanged}
              onError={onError}
            />
          ))}
        </ul>
      )}

      <TaskForm projectId={project.id} onCreated={onChanged} />
    </article>
  );
}