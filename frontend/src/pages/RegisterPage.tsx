import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onRegister() {
    setLoading(true);
    setError(null);
    try {
      await API.post("/users/", { username, email, password });
      navigate("/login");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status;
      if (status === 422) setError("Проверьте корректность данных (логин/email/пароль).");
      else setError("Не удалось зарегистрироваться. Проверьте, что бэкенд запущен.");
    } finally {
      setLoading(false);
    }
  }

  const canSubmit = username.trim().length >= 3 && email.trim().length > 0 && password.length > 0;

  return (
    <div className="container">
      <h4 style={{ marginTop: 0, marginBottom: 10, color: "#555" }}>RegisterPage</h4>
      <h2 className="title">Регистрация</h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onRegister();
        }}
      >
        <input
          placeholder="Логин (username)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit" disabled={loading || !canSubmit}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </button>
      </form>

      {error && <p style={{ color: "#6b1a1a" }}>{error}</p>}

      {!error && (
        <p style={{ textAlign: "center", marginTop: 10 }}>
          Уже есть аккаунт?{" "}
          <Link to="/login" style={{ color: "#2f80ed", textDecoration: "underline" }}>
            Войти
          </Link>
        </p>
      )}
    </div>
  );
}

