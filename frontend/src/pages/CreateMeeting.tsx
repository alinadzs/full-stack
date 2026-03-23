import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

type MeetingCreate = {
  title: string;
  description?: string | null;
  meeting_date?: string | null;
};

export default function CreateMeeting() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [meetingDate, setMeetingDate] = useState<string>("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSave() {
    setLoading(true);
    setError(null);
    const payload: MeetingCreate = {
      title,
      description: description.trim() ? description.trim() : null,
      meeting_date: meetingDate ? meetingDate : null,
    };

    try {
      await API.post("/meetings/", payload);
      navigate("/");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status;
      if (status === 401) setError("Нужно войти (401). Перейдите на страницу Login.");
      else setError("Не удалось создать встречу. Проверьте данные и бэкенд.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h2>Создать встречу</h2>
      <input
        placeholder="Название собрания"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
      <textarea
        placeholder="Повестка встречи"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => void onSave()} disabled={loading || title.trim().length < 3}>
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        <button className="secondary" onClick={() => navigate(-1)} disabled={loading}>
          Отмена
        </button>
      </div>
      {error && <p style={{ color: "#6b1a1a" }}>{error}</p>}
    </div>
  );
}