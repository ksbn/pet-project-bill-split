import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { login } from "../services/api"
import { setToken } from "../services/token"

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token } = await login(email, password)
      setToken(token)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "calc(100vh - 64px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem 1.5rem",
    }}>
      <div className="glass" style={{ width: "100%", maxWidth: "400px", padding: "2.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem", letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p style={{ color: "#6b7280", marginBottom: "2rem", fontSize: "0.9rem" }}>
          Sign in to manage your groups
        </p>

        {error && (
          <div style={{
            background: "rgba(255,59,48,0.08)",
            border: "1px solid rgba(255,59,48,0.2)",
            borderRadius: "10px",
            padding: "10px 14px",
            color: "#c00",
            fontSize: "0.875rem",
            marginBottom: "1rem",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" required />
          </div>
          <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", marginTop: "0.5rem" }}>
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p style={{ marginTop: "1.5rem", textAlign: "center", color: "#6b7280", fontSize: "0.875rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4F6EF7", fontWeight: "600", textDecoration: "none" }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  )
}