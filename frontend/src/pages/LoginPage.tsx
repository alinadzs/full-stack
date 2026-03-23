import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onLogin() {
    setLoading(true);
    setError(null);

    try {
      const body = new URLSearchParams();
      body.set("username", username);
      body.set("password", password);

      const res = await API.post<{ access_token: string; token_type: string }>(
        "/auth/login",
        body,
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
      );

      localStorage.setItem("token", res.data.access_token);
      navigate("/meetings");
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } }).response?.status;
      if (status === 401) setError("Неверный логин/пароль.");
      else setError("Не удалось войти. Проверьте, что бэкенд запущен.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <h4 style={{ marginTop: 0, marginBottom: 10, color: "#555" }}>LoginPage</h4>
      <h2 className="title">Meeting Manager</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void onLogin();
        }}
      >
        <input
          placeholder="Логин (username)"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" disabled={loading || !username || !password}>
          {loading ? "Вход..." : "Войти"}
        </button>
      </form>
      {error && <p style={{ color: "#6b1a1a" }}>{error}</p>}
      {!error && (
        <p style={{ textAlign: "center", marginTop: 10 }}>
          Нет аккаунта?{" "}
          <Link to="/register" style={{ color: "#2f80ed", textDecoration: "underline" }}>
            Зарегистрироваться
          </Link>
        </p>
      )}
    </div>
  );
}