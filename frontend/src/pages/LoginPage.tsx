const LoginPage = () => {
  return (
    <div className="container">
      <h2 className="title">Meeting Manager</h2>
      <input placeholder="Email или логин" />
      <input type="password" placeholder="Пароль" />
      <button>Войти</button>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Нет аккаунта? Зарегистрироваться
      </p>
    </div>
  );
};

export default LoginPage;