import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

type User = {
  id: number;
  username: string;
  email: string;
};

type Meeting = {
  id: number;
  title: string;
  description?: string | null;
  meeting_date?: string | null;
  created_at: string;
  owner_id?: number | null;
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [userRes, meetingsRes] = await Promise.all([
        API.get<User>("/users/me"),
        API.get<Meeting[]>("/meetings/"),
      ]);
      setCurrentUser(userRes.data);
      setMeetings(meetingsRes.data);
    } catch (e: unknown) {
      const statusCode = (e as { response?: { status?: number } }).response?.status;
      if (statusCode === 401) setError("Требуется вход (401). Перейдите на страницу Login.");
      else if (statusCode === 403) setError("Доступ запрещён (403). У вас нет прав администратора или сессия устарела.");
      else setError("Не удалось загрузить данные профиля.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const myMeetings =
    currentUser && meetings.length > 0
      ? meetings.filter((m) => m.owner_id === currentUser.id || m.owner_id == null)
      : meetings;

  function getStatus(meeting: Meeting): "planned" | "done" {
    if (!meeting.description) return "planned";
    return meeting.description.includes("[Завершено]") ? "done" : "planned";
  }

  function onLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return (
    <div className="container">
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#2f80ed",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            {currentUser ? currentUser.username.charAt(0).toUpperCase() : "U"}
          </div>
          <div>
            <div>{currentUser ? currentUser.username : "Пользователь"}</div>
            <div>{currentUser ? currentUser.email : "email@example.com"}</div>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <button className="secondary" onClick={onLogout}>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <h3>Мои собрания</h3>

      {loading && <p>Загрузка...</p>}
      {!loading && error && (
        <div className="card">
          <p style={{ marginTop: 0 }}>{error}</p>
          <button onClick={() => void load()}>Повторить</button>
        </div>
      )}

      {!loading && !error && myMeetings.length === 0 && <p>У вас пока нет собраний.</p>}

      {!loading &&
        !error &&
        myMeetings.map((m) => (
          <div key={m.id} className="card">
            <h4 style={{ marginTop: 0 }}>{m.title}</h4>
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
            <Link to={`/meetings/${m.id}`}>Открыть</Link>
          </div>
        ))}
    </div>
  );
}