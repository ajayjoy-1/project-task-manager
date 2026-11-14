import { STATUSES } from "../constants";

export default function FilterBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onClear,
}) {
  const active = search || status;

  return (
    <div className="filters">
      <input
        className="grow"
        type="search"
        placeholder="Search tasks by title or description..."
        value={search}
        maxLength={100}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <select value={status} onChange={(e) => onStatusChange(e.target.value)}>
        <option value="">All statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      {active && (
        <button type="button" className="secondary" onClick={onClear}>
          Clear
        </button>
      )}
    </div>
  );
}