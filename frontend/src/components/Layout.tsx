import { Link, Outlet, useNavigate } from "react-router-dom";

const Layout = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <nav style={{ display: "flex", gap: "15px", padding: "10px", borderBottom: "1px solid #ccc" }}>
        <Link to="/meetings">Meetings</Link>
        <Link to="/create">Create</Link>
        <Link to="/search">Search</Link>
        <Link to="/profile">Profile</Link>
        {token ? (
          <button onClick={handleLogout} style={{ cursor: "pointer", marginLeft: "auto" }}>
            Logout
          </button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
      <Outlet />
    </>
  );
};

export default Layout;