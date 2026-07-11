import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getToken } from "../services/token"

const BASE = "/api"

export default function MyGroupsPage() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!getToken()) { navigate("/login"); return }
    fetch(`${BASE}/groups/my`, {
      headers: { Authorization: `Bearer ${getToken()}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setGroups(data)
        else setError("Could not load your groups.")
      })
      .catch(() => setError("Could not load your groups."))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) return <div className="page" style={{ paddingTop: "3rem", color: "#6b7280" }}>Loading…</div>
  if (error) return <div className="page" style={{ paddingTop: "3rem", color: "#c00" }}>{error}</div>

  return (
    <div className="page">
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          My Groups
        </h1>
        <p style={{ color: "#6b7280" }}>All groups you've created.</p>
      </div>

      {groups.length === 0 ? (
        <div className="glass" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>No groups yet.</p>
          <Link to="/">
            <button className="btn-primary">Create your first group →</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {groups.map((group) => (
            <div
              key={group.id}
              className="glass"
              onClick={() => navigate(`/groups/${group.id}`)}
              style={{ padding: "1.25rem 1.5rem", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div>
                <strong style={{ fontSize: "1rem" }}>{group.name}</strong>
                <div style={{ fontSize: "0.8rem", color: "#6b7280", marginTop: "2px" }}>
                  Code: <code style={{ background: "rgba(79,110,247,0.08)", padding: "1px 6px", borderRadius: "4px" }}>{group.invite_code}</code>
                </div>
              </div>
              <span style={{ color: "#4F6EF7", fontSize: "1.2rem" }}>→</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}