import { useEffect, useState } from "react";
import { api } from "./api";
import Dashboard from "./components/Dashboard";
import FilterBar from "./components/FilterBar";
import ProjectCard from "./components/ProjectCard";
import ProjectForm from "./components/ProjectForm";

export default function TaskManager({ user, onLogout }) {
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState(null);
  const [matchIds, setMatchIds] = useState(null); // null means no filter active
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  const reload = () => setReloadKey((k) => k + 1);
  const isAdmin = user.role === "admin";

  // wait 300ms after typing stops before searching
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [projectData, statsData] = await Promise.all([
          api.getProjects(),
          api.getStats(),
        ]);
        let ids = null;
        if (debouncedSearch.trim() || statusFilter) {
          const tasks = await api.getTasks({
            search: debouncedSearch.trim(),
            status: statusFilter,
          });
          ids = new Set(tasks.map((t) => t.id));
        }
        if (!cancelled) {
          setProjects(projectData);
          setStats(statsData);
          setMatchIds(ids);
          setError("");
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, statusFilter, reloadKey]);

  const filtering = matchIds !== null;

  const visibleProjects = projects
    .map((p) => ({
      project: p,
      tasks: filtering ? p.tasks.filter((t) => matchIds.has(t.id)) : p.tasks,
    }))
    .filter((entry) => !filtering || entry.tasks.length > 0);

  function clearFilters() {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("");
  }

  return (
    <div className="container">
      <div className="topbar">
        <h1>Project & Task Manager</h1>
        <div className="user-box">
          <span>
            {user.name}
            <span className="badge role-badge">{user.role}</span>
          </span>
          <button type="button" className="secondary" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>

      {error && <div className="alert">{error}</div>}

      <Dashboard stats={stats} />

      <section className="panel">
        <h2>New project</h2>
        <ProjectForm onCreated={reload} />
      </section>

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        status={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={clearFilters}
      />

      {loading ? (
        <p>Loading...</p>
      ) : visibleProjects.length === 0 ? (
        <p className="muted">
          {filtering
            ? "No tasks match your filters."
            : "No projects yet. Create your first project above."}
        </p>
      ) : (
        visibleProjects.map(({ project, tasks }) => (
          <ProjectCard
            key={project.id}
            project={project}
            tasks={tasks}
            canDeleteProject={isAdmin}
            onChanged={reload}
            onError={setError}
          />
        ))
      )}
    </div>
  );
}