import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

type Meeting = {
  id: number;
  title: string;
  description?: string | null;
  meeting_date?: string | null;
  created_at: string;
  owner_id?: number | null;
};

export default function MeetingsList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await API.get<Meeting[]>("/meetings/");
      setMeetings(res.data);
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status;
      if (status === 401) setError("Требуется вход (401). Перейдите на страницу Login.");
      else setError("Не удалось загрузить список встреч. Проверьте, что бэкенд запущен.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function getStatus(meeting: Meeting): "planned" | "done" {
    if (!meeting.description) return "planned";
    return meeting.description.includes("[Завершено]") ? "done" : "planned";
  }

  return (
    <div className="container">
      <h2>Встречи</h2>

      <div style={{ display: "flex", gap: 10 }}>
        <Link to="/create">
          <button>+ Создать собрание</button>
        </Link>
        <button className="secondary" onClick={() => void load()} disabled={loading}>
          Обновить
        </button>
      </div>

      {loading && <p>Загрузка...</p>}

      {!loading && error && (
        <div className="card">
          <p style={{ marginTop: 0 }}>{error}</p>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => void load()}>Повторить</button>
            <Link to="/meetings">
              <button className="secondary">Login</button>
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && meetings.length === 0 && <p>Пока нет встреч.</p>}

      {!loading &&
        !error &&
        meetings.map((m) => (
          <div key={m.id} className="card">
            <Link to={`/meetings/${m.id}`}>
              <h4 style={{ marginTop: 0 }}>{m.title}</h4>
            </Link>
            {(() => {
              const status = getStatus(m);
              const text = status === "done" ? "Завершено" : "Запланировано";
              const className = status === "done" ? "status-done" : "status-planned";
              return (
                <p>
                  {m.meeting_date ?? ""} · <span className={className}>{text}</span>
                </p>
              );
            })()}
            {m.description && !m.description.includes("[Завершено]") && <p>{m.description}</p>}
          </div>
        ))}
    </div>
  );
}