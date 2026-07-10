import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { createGroup } from "../services/api"
import { getToken, getAccountId } from "../services/token"

export default function HomePage() {
  const navigate = useNavigate()
  const [groupName, setGroupName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const isLoggedIn = !!getToken()

  useEffect(() => {
    
  }, [])

  async function handleCreateGroup() {
    if (!isLoggedIn) {
      navigate("/register")
      return
    }
    if (!groupName.trim()) return
    setLoading(true)
    setError(null)
    try {
      const group = await createGroup(groupName.trim())
      navigate(`/groups/${group.id}`, { state: { group } })
    } catch (err) {
      setError("Could not create group. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>

      {/* Hero */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 1.5rem 2rem",
        textAlign: "center",
      }}>
        <div className="badge" style={{ marginBottom: "1.5rem" }}>
          💸 Split bills, not friendships
        </div>

        <h1 style={{
          fontSize: "clamp(2.5rem, 6vw, 4rem)",
          fontWeight: "800",
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: "1rem",
          background: "linear-gradient(135deg, #1a1a2e 60%, #4F6EF7)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}>
          Group expenses,<br />simplified.
        </h1>

        <p style={{
          fontSize: "1.1rem",
          color: "#6b7280",
          maxWidth: "480px",
          lineHeight: 1.6,
          marginBottom: "2.5rem",
        }}>
          Create a group, add expenses, and let Split-It figure out who owes what. Share the link — done.
        </p>

        {/* CTA Card */}
        <div className="glass" style={{
          padding: "2rem",
          width: "100%",
          maxWidth: "420px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}>
          {isLoggedIn ? (
            <>
              <input
                className="input"
                type="text"
                placeholder="Name your group, e.g. Barcelona Trip"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
              />
              {error && <p style={{ color: "#c00", fontSize: "0.85rem" }}>{error}</p>}
              <button
                className="btn-primary"
                onClick={handleCreateGroup}
                disabled={loading || !groupName.trim()}
                style={{ width: "100%" }}
              >
                {loading ? "Creating…" : "Create Group →"}
              </button>
            </>
          ) : (
            <>
              <p style={{ color: "#6b7280", fontSize: "0.9rem", marginBottom: "4px" }}>
                Sign up free to get started
              </p>
              <Link to="/register" style={{ width: "100%" }}>
                <button className="btn-primary" style={{ width: "100%" }}>
                  Get started free →
                </button>
              </Link>
              <Link to="/login" style={{ textAlign: "center", color: "#6b7280", fontSize: "0.85rem" }}>
                Already have an account? Login
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "1rem",
        padding: "0 1.5rem 4rem",
        maxWidth: "860px",
        margin: "0 auto",
        width: "100%",
      }}>
        {[
          { icon: "🧮", title: "Auto-split", desc: "Even or custom splits — you decide how expenses are shared." },
          { icon: "💳", title: "Pay via Revolut", desc: "One tap to pay directly. No more awkward IOUs." },
          { icon: "💚", title: "Donate together", desc: "Round up and donate leftover amounts to a charity as a group." },
        ].map((f) => (
          <div key={f.title} className="glass" style={{ padding: "1.5rem" }}>
            <div style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>{f.icon}</div>
            <h3 style={{ fontWeight: "700", marginBottom: "0.5rem", fontSize: "1rem" }}>{f.title}</h3>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", lineHeight: 1.5 }}>{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}