import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

const BASE = "/api";

export default function GroupViewPage() {
  const { inviteCode } = useParams();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadGroup() {
      try {
        const groupRes = await fetch(`${BASE}/groups/${inviteCode}`);
        if (!groupRes.ok) throw new Error("Group not found");
        const group = await groupRes.json();
        setGroup(group);

        const [users, expenses, settlements] = await Promise.all([
          fetch(`${BASE}/groups/${group.id}/users`).then((r) => r.json()),
          fetch(`${BASE}/groups/${group.id}/expenses`).then((r) => r.json()),
          fetch(`${BASE}/groups/${group.id}/settlements`).then((r) => r.json()),
        ]);

        setUsers(users);
        setExpenses(expenses);
        setSettlements(settlements);
      } catch (err) {
        setError(err.message || "Could not load group.");
      } finally {
        setLoading(false);
      }
    }
    loadGroup();
  }, [inviteCode]);

  if (loading) return <div className="page" style={{ paddingTop: "3rem", color: "var(--text-muted)" }}>Loading group...</div>;
  if (error) return <div className="page" style={{ paddingTop: "3rem", color: "#c00" }}>{error}</div>;

  return (
    <div className="page">

      {/* Group info */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>{group.name}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <span className="label" style={{ margin: 0 }}>Invite code:</span>
          <span className="badge">{group.invite_code}</span>
        </div>
        <Link to="/login" style={{ fontSize: "0.9em", color: "var(--primary)" }}>
          Login to manage this group
        </Link>
      </div>

      {/* Members */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Members</h2>
        {users.length === 0 && <p style={{ color: "var(--text-muted)" }}>No members yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {users.map((user) => (
            <li key={user.id} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "linear-gradient(135deg, var(--primary), var(--accent))",
                color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "700", fontSize: "0.85rem", flexShrink: 0,
              }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: "600" }}>{user.name}</div>
                {user.email && <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.email}</div>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Expenses */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Expenses</h2>
        {expenses.length === 0 && <p style={{ color: "var(--text-muted)" }}>No expenses yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {expenses.map((exp) => {
            const paidBy = users.find((u) => u.id === exp.paid_by);
            const share = users.length > 0 ? (Number(exp.amount) / users.length).toFixed(2) : "—";
            return (
              <li key={exp.id} className="glass" style={{ padding: "0.75rem 1rem" }}>
                <div style={{ fontWeight: "600" }}>{exp.title} — €{exp.amount}</div>
                <div style={{ fontSize: "0.85em", color: "var(--text-muted)" }}>
                  paid by {paidBy?.name ?? "unknown"} · €{share} per person
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Settlements */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Settlements</h2>
        {settlements.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Everyone is settled up!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {settlements.map((s, i) => (
              <li key={i} className="glass" style={{ padding: "0.75rem 1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ flex: 1 }}>
                  <strong>{s.from}</strong>
                  <span style={{ color: "var(--text-muted)" }}> owes </span>
                  <strong>{s.to}</strong>
                  <span style={{ color: "var(--primary)", fontWeight: "bold" }}> €{Number(s.amount).toFixed(2)}</span>
                </div>
                {s.revolut_link && (
                  <a
                    className="btn-primary"
                    href={s.revolut_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: "none", fontSize: "0.85em", padding: "6px 12px" }}
                  >
                    Pay via Revolut
                  </a>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}
