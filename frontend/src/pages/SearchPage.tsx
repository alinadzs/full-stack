import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import API from "../api";

type Meeting = {
  id: number;
  title: string;
  description?: string | null;
  meeting_date?: string | null;
  created_at: string;
  owner_id?: number | null;
};

export default function SearchPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  type FilterParams = {
    keyword: string;
    dateFrom: string;
    dateTo: string;
    status: "all" | "done" | "planned";
  };

  const [pendingFilters, setPendingFilters] = useState<FilterParams>({
    keyword: "",
    dateFrom: "",
    dateTo: "",
    status: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState<FilterParams>(pendingFilters);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.get<Meeting[]>("/meetings/");
      setMeetings(res.data);
    } catch (e: unknown) {
      const statusCode = (e as { response?: { status?: number } }).response?.status;
      if (statusCode === 401) setError("Требуется вход (401). Перейдите на страницу Login.");
      else setError("Не удалось загрузить встречи для поиска.");
    } finally {
      setLoading(false);
    }
  }, []);

  function getStatus(meeting: Meeting): "planned" | "done" {
    if (!meeting.description) return "planned";
    return meeting.description.includes("[Завершено]") ? "done" : "planned";
  }

  useEffect(() => {
    void load();
  }, [load]);

  const applySearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAppliedFilters(pendingFilters);
  };

  const clearSearch = () => {
    const resetFilters: FilterParams = { keyword: "", dateFrom: "", dateTo: "", status: "all" };
    setPendingFilters(resetFilters);
    setAppliedFilters(resetFilters);
  };

  const filtered = useMemo(() => {
    return meetings.filter((m) => {
      if (appliedFilters.keyword) {
        const hay = `${m.title} ${m.description ?? ""}`.toLowerCase();
        if (!hay.includes(appliedFilters.keyword.toLowerCase())) return false;
      }

      if (m.meeting_date) {
        if (appliedFilters.dateFrom && m.meeting_date < appliedFilters.dateFrom) return false;
        if (appliedFilters.dateTo && m.meeting_date > appliedFilters.dateTo) return false;
      }

      if (appliedFilters.status === "done" && getStatus(m) !== "done") return false;
      if (appliedFilters.status === "planned" && getStatus(m) !== "planned") return false;

      return true;
    });
  }, [meetings, appliedFilters]);

  return (
    <div className="container">
      <h4 style={{ marginTop: 0, marginBottom: 10 }}>SearchPage</h4>
      <h2 className="title">SearchPage</h2>

      <form onSubmit={applySearch} style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <input
            type="text"
            placeholder="Ключевые слова"
            value={pendingFilters.keyword}
            onChange={(e) => setPendingFilters((prev) => ({ ...prev, keyword: e.target.value }))}
            style={{ flex: 2, minWidth: 160, padding: 8 }}
          />
          <input
            type="date"
            value={pendingFilters.dateFrom}
            onChange={(e) => setPendingFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
            style={{ flex: 1, minWidth: 140, padding: 8 }}
            placeholder="Дата от"
          />
          <input
            type="date"
            value={pendingFilters.dateTo}
            onChange={(e) => setPendingFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
            style={{ flex: 1, minWidth: 140, padding: 8 }}
            placeholder="Дата до"
          />
          <select
            value={pendingFilters.status}
            onChange={(e) => setPendingFilters((prev) => ({ ...prev, status: e.target.value as FilterParams['status'] }))}
            style={{ flexBasis: 140, padding: 8 }}
          >
            <option value="all">Все статусы</option>
            <option value="planned">Запланировано</option>
            <option value="done">Завершено</option>
          </select>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button type="submit" className="primary" style={{ flex: 1 }}>
            Искать
          </button>
          <button type="button" className="secondary" style={{ flex: 1 }} onClick={clearSearch}>
            Сбросить
          </button>
        </div>
      </form>

      {loading && <p>Загрузка...</p>}
      {!loading && error && (
        <div className="card">
          <p style={{ marginTop: 0 }}>{error}</p>
          <button onClick={() => void load()}>Повторить</button>
        </div>
      )}

      {!loading && !error && filtered.length === 0 && <p>Ничего не найдено.</p>}

      {!loading &&
        !error &&
        filtered.map((m) => (
          <div key={m.id} className="card">
            <h4 style={{ marginTop: 0 }}>{m.title}</h4>
            {(() => {
              const s = getStatus(m);
              const text = s === "done" ? "Завершено" : "Запланировано";
              const className = s === "done" ? "status-done" : "status-planned";
              return (
                <p>
                  {m.meeting_date ?? ""} · <span className={className}>{text}</span>
                </p>
              );
            })()}
          </div>
        ))}
    </div>
  );
}