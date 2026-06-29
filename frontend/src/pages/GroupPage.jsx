import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getGroup, getGroupUsers, addUserToGroup, addExpense, getExpenses, getSettlements } from "../services/api";

export default function GroupPage() {
  const { groupId } = useParams();
  const location = useLocation();

  const [group, setGroup] = useState(location.state?.group ?? null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [groupLoading, setGroupLoading] = useState(!group);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  // member form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // expense form
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [expFormError, setExpFormError] = useState(null);
  const [settlements, setSettlements] = useState([]);

  useEffect(() => {
    if (group) return;
    setGroupLoading(true);
    getGroup(groupId)
      .then(setGroup)
      .catch(() => setError("Could not load group."))
      .finally(() => setGroupLoading(false));
  }, [groupId, group]);

  useEffect(() => {
    getGroupUsers(groupId)
      .then(setUsers)
      .catch(() => setError("Could not load users."))
      .finally(() => setUsersLoading(false));
  }, [groupId]);

  useEffect(() => {
    getExpenses(groupId)
      .then(setExpenses)
      .catch(() => {});
  }, [groupId]);

  useEffect(() => {
  getSettlements(groupId)
    .then(setSettlements)
    .catch(() => {});
}, [groupId]);

  async function handleAddUser(e) {
    e.preventDefault();
    if (!name.trim()) { setFormError("Name is required."); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const newUser = await addUserToGroup(groupId, { name: name.trim(), email: email.trim() });
      setUsers((prev) => [...prev, newUser]);
      setName("");
      setEmail("");
    } catch {
      setFormError("Could not add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount || !expPaidBy) {
      setExpFormError("All fields are required.");
      return;
    }
    setExpSubmitting(true);
    setExpFormError(null);
    try {
      const newExpense = await addExpense(groupId, {
        title: expTitle.trim(),
        amount: Number(expAmount),
        paid_by: Number(expPaidBy),
      });
      setExpenses((prev) => [newExpense, ...prev]);
      setExpTitle("");
      setExpAmount("");
      setExpPaidBy("");
    } catch {
      setExpFormError("Could not add expense. Please try again.");
    } finally {
      setExpSubmitting(false);
    }
  }

  if (groupLoading) return <p style={{ padding: "2rem" }}>Loading group…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "2rem" }}>
      <section>
        <h1>{group?.name ?? "Group"}</h1>
        <p>
          <strong>Invite code:</strong>{" "}
          <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: "4px" }}>
            {group?.invite_code ?? "—"}
          </code>
        </p>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Members</h2>
        {usersLoading && <p>Loading members…</p>}
        {!usersLoading && users.length === 0 && (
          <p style={{ color: "#888" }}>No members yet. Add one below.</p>
        )}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {users.map((user) => (
            <li key={user.id} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px" }}>
              <strong>{user.name}</strong>
              {user.email && (
                <span style={{ marginLeft: "8px", color: "#666", fontSize: "0.9em" }}>
                  {user.email}
                </span>
              )}
            </li>
          ))}
        </ul>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Add Member</h2>
        <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label>
            Name <span style={{ color: "red" }}>*</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
          </label>
          <label>
            Email <span style={{ color: "#888", fontWeight: "normal" }}>(optional)</span>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@example.com"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
          </label>
          {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
          <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
            {submitting ? "Adding…" : "Add Member"}
          </button>
        </form>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Expenses</h2>
        {expenses.length === 0 && <p style={{ color: "#888" }}>No expenses yet.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {expenses.map((exp) => {
            const paidBy = users.find((u) => u.id === exp.paid_by);
            const share = users.length > 0 ? (exp.amount / users.length).toFixed(2) : "—";
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
            );
          })}
        </ul>

        <h3>Add Expense</h3>
        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <label>
            Title <span style={{ color: "red" }}>*</span>
            <input type="text" value={expTitle} onChange={(e) => setExpTitle(e.target.value)}
              placeholder="e.g. Dinner"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
          </label>
          <label>
            Amount <span style={{ color: "red" }}>*</span>
            <input type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)}
              placeholder="e.g. 90"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
          </label>
          <label>
            Paid by <span style={{ color: "red" }}>*</span>
            <select value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }}>
              <option value="">Select member</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          {expFormError && <p style={{ color: "red", margin: 0 }}>{expFormError}</p>}
          <button type="submit" disabled={expSubmitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
            {expSubmitting ? "Adding…" : "Add Expense"}
          </button>
        </form>
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

    <section>
       <h2>Settlements</h2>
       {settlements.length === 0 ? (
        <p style={{ color: "#888" }}>Everyone is settled up! 🎉</p>
      ) : (
       <ul style={{ listStyle: "none", padding: 0 }}>
         {settlements.map((s, i) => (
          <li key={i} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px" }}>
            <strong>{s.debtor}</strong>
            <span style={{ color: "#666" }}> owes </span>
            <strong>{s.creditor}</strong>
            <span style={{ marginLeft: "8px", color: "#2a7a2a", fontWeight: "bold" }}>
              €{Number(s.amount).toFixed(2)}
            </span>
          </li>
         ))}
      </ul>
      )}
    </section>
  </div>
  );
}