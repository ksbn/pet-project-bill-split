import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"

const BASE = "/api"

export default function GroupViewPage() {
  const { inviteCode } = useParams()
  const [group, setGroup] = useState(null)
  const [users, setUsers] = useState([])
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadGroup() {
      try {
        const groupRes = await fetch(`${BASE}/groups/${inviteCode}`)
        if (!groupRes.ok) throw new Error('Group not found')
        const group = await groupRes.json()
        setGroup(group)

        const [users, expenses, settlements] = await Promise.all([
          fetch(`${BASE}/groups/${group.id}/users`).then(r => r.json()),
          fetch(`${BASE}/groups/${group.id}/expenses`).then(r => r.json()),
          fetch(`${BASE}/groups/${group.id}/settlements`).then(r => r.json()),
        ])

        setUsers(users)
        setExpenses(expenses)
        setSettlements(settlements)
      } catch (err) {
        setError(err.message || 'Could not load group.')
      } finally {
        setLoading(false)
      }
    }

    loadGroup()
  }, [inviteCode])

  if (loading) return <p style={{ padding: "2rem" }}>Loading group…</p>
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <section>
        <h1>{group.name}</h1>
        <p style={{ color: "#666", fontSize: "0.9em" }}>
          Invite code: <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px" }}>{group.invite_code}</code>
        </p>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Members</h2>
        {users.length === 0 && <p style={{ color: "#888" }}>No members yet.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((user) => (
            <li key={user.id} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px" }}>
              <strong>{user.name}</strong>
              {user.email && (
                <span style={{ marginLeft: "8px", color: "#666", fontSize: "0.9em" }}>{user.email}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Expenses</h2>
        {expenses.length === 0 && <p style={{ color: "#888" }}>No expenses yet.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {expenses.map((exp) => {
            const paidBy = users.find((u) => u.id === exp.paid_by)
            const share = users.length > 0 ? (Number(exp.amount) / users.length).toFixed(2) : "—"
            return (
              <li key={exp.id} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px" }}>
                <strong>{exp.title}</strong> — €{exp.amount}
                <span style={{ marginLeft: "8px", color: "#666", fontSize: "0.9em" }}>
                  paid by {paidBy?.name ?? "unknown"}
                </span>
                <div style={{ fontSize: "0.85em", color: "#888", marginTop: "4px" }}>
                  €{share} per person
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Settlements</h2>
        {settlements.length === 0 ? (
          <p style={{ color: "#888" }}>Everyone is settled up! 🎉</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {settlements.map((s, i) => (
              <li key={i} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <strong>{s.from}</strong>
                  <span style={{ color: "#666" }}> owes </span>
                  <strong>{s.to}</strong>
                  <span style={{ color: "#2a7a2a", fontWeight: "bold" }}> €{Number(s.amount).toFixed(2)}</span>
                </div>
                {s.revolut_link && (
                  <a
                    href={s.revolut_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ padding: "4px 10px", background: "#0075eb", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "0.85em", whiteSpace: "nowrap" }}
                  >
                    Pay via Revolut
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
