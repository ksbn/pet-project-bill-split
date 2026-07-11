import { useNavigate, Link } from "react-router-dom"
import { getToken, clearToken } from "../services/token"

export default function Navbar() {
  const navigate = useNavigate()
  const isLoggedIn = !!getToken()

  function handleLogout() {
    clearToken()
    navigate("/login")
  }

  return (
    <nav style={{
      position: "sticky",
      top: 0,
      zIndex: 100,
      background: "rgba(240, 244, 255, 0.7)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      borderBottom: "1px solid rgba(255,255,255,0.6)",
      padding: "0 1.5rem",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    }}>
      <Link to="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontSize: "1.25rem",
          fontWeight: "700",
          background: "linear-gradient(135deg, #4F6EF7, #7B5EA7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.02em",
        }}>
          Split-It 
        </span>
      </Link>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {isLoggedIn ? (
          <>
            <Link to="/my-groups" style={{ textDecoration: "none", color: "#6b7280", fontSize: "0.9rem", fontWeight: "500" }}>
              My Groups
            </Link>
            <Link to="/donations" style={{
              textDecoration: "none",
              color: "#6b7280",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}>
              💚 Donations
            </Link>
            <button onClick={handleLogout} className="btn-glass">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{
              textDecoration: "none",
              color: "#6b7280",
              fontSize: "0.9rem",
              fontWeight: "500",
            }}>
              Login
            </Link>
            <Link to="/register">
              <button className="btn-primary" style={{ padding: "8px 20px", fontSize: "0.875rem" }}>
                Get started →
              </button>
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}