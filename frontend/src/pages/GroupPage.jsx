import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getGroup, getGroupUsers, addUserToGroup, addExpense, getExpenses, getSettlements, recalculateSplits, deleteExpense, confirmSettlement, getConfirmedSettlements, getDonations } from "../services/api";
import { getToken, getAccountId } from "../services/token"

export default function GroupPage() {
  const { groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [group, setGroup] = useState(location.state?.group ?? null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [groupLoading, setGroupLoading] = useState(!group);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState([]);

  // member form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [revolut, setRevolut] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // expense form
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expPaidBy, setExpPaidBy] = useState("");
  const [splitMode, setSplitMode] = useState("even");
  const [customSplits, setCustomSplits] = useState({});
  const [expSubmitting, setExpSubmitting] = useState(false);
  const [expFormError, setExpFormError] = useState(null);
  const [recalculating, setRecalculating] = useState(false);

  // donation form
  const [donationOrgs, setDonationOrgs] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donating, setDonating] = useState(false);
  const [donationError, setDonationError] = useState(null);

  useEffect(() => {
    if (!getToken()) navigate("/login")
  }, [navigate])

  useEffect(() => {
    if (group) return;
    setGroupLoading(true);
    getGroup(groupId)
      .then(setGroup)
      .catch(() => setError("Could not load group."))
      .finally(() => setGroupLoading(false));
  }, [groupId, group]);

  useEffect(() => {
    Promise.all([
      getGroupUsers(groupId),
      getExpenses(groupId),
      getSettlements(groupId),
      getConfirmedSettlements(groupId),
    ]).then(([users, expenses, settlements, confirmed]) => {
      setUsers(users)
      setExpenses(expenses)
      setSettlements(settlements)
      setConfirmed(confirmed)
      setUsersLoading(false)
    }).catch(() => setError("Could not load group data."))
  }, [groupId])

  useEffect(() => {
    getDonations().then(setDonationOrgs).catch(() => {})
  }, [])

  async function handleAddUser(e) {
    e.preventDefault();
    if (!name.trim()) { setFormError("Name is required."); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const newUser = await addUserToGroup(groupId, {
        name: name.trim(),
        email: email.trim(),
        revolut_link: revolut.trim() || null
      });
      setUsers((prev) => [...prev, newUser]);
      setName("");
      setEmail("");
      setRevolut("");
    } catch (err) {
      setFormError(err.message || "Could not add user. Please try again.");
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

    let splits = null;
    if (splitMode === "custom") {
      splits = users.map((u) => ({
        user_id: u.id,
        amount: Number(customSplits[u.id] ?? 0),
      }));
      const total = splits.reduce((sum, s) => sum + s.amount, 0);
      if (Math.abs(total - Number(expAmount)) > 0.01) {
        setExpFormError(`Custom splits must add up to €${expAmount}. Current total: €${total.toFixed(2)}`);
        return;
      }
    }

    setExpSubmitting(true);
    setExpFormError(null);
    try {
      const newExpense = await addExpense(groupId, {
        title: expTitle.trim(),
        amount: Number(expAmount),
        paid_by: Number(expPaidBy),
        splits,
      });
      setExpenses((prev) => [newExpense, ...prev]);
      setExpTitle("");
      setExpAmount("");
      setExpPaidBy("");
      setCustomSplits({});
      setSplitMode("even");
      getSettlements(groupId).then(setSettlements).catch(() => {});
    } catch (err) {
      setExpFormError(err.message || "Could not add expense. Please try again.");
    } finally {
      setExpSubmitting(false);
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!confirm('Delete this expense?')) return
    try {
      await deleteExpense(groupId, expenseId)
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId))
      getSettlements(groupId).then(setSettlements).catch(() => {})
    } catch {
      alert('Could not delete expense.')
    }
  }

  async function handleRecalculate() {
    setRecalculating(true);
    try {
      await recalculateSplits(groupId);
      const updated = await getSettlements(groupId);
      setSettlements(updated);
    } catch {
      alert("Could not recalculate splits.");
    } finally {
      setRecalculating(false);
    }
  }

  async function handleConfirmSettlement(s) {
    if (!confirm(`Mark "${s.from} owes ${s.to} €${s.amount}" as paid?`)) return
    try {
      await confirmSettlement(groupId, s.from, s.to, s.amount)
      setConfirmed((prev) => [...prev, { from_name: s.from, to_name: s.to, amount: s.amount }])
    } catch {
      alert('Could not confirm settlement.')
    }
  }

  async function handleGroupDonation(e) {
    e.preventDefault()
    if (!selectedOrg || !donationAmount || !expPaidBy) {
      setDonationError("Please select an org, enter amount and select who is paying.")
      return
    }
    const org = donationOrgs.find((o) => o.id === Number(selectedOrg))
    setDonating(true)
    setDonationError(null)
    try {
      const newExpense = await addExpense(groupId, {
        title: `🎗️ Donation — ${org.org_name}`,
        amount: Number(donationAmount),
        paid_by: Number(expPaidBy),
      })
      setExpenses((prev) => [newExpense, ...prev])
      setSelectedOrg("")
      setDonationAmount("")
      getSettlements(groupId).then(setSettlements).catch(() => {})
    } catch {
      setDonationError("Could not add donation expense.")
    } finally {
      setDonating(false)
    }
  }

  if (groupLoading) return <p style={{ padding: "2rem" }}>Loading group…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  const isOwner = group?.account_id === getAccountId()

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join our group "${group?.name}" on Split-It: ${window.location.origin}/join/${group?.invite_code}`)}`
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/join/${group?.invite_code}`)}&text=${encodeURIComponent(`Join our group "${group?.name}" on Split-It!`)}`

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
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/join/${group.invite_code}`)
              alert("Link copied!")
            }}
            style={{ padding: "6px 12px", borderRadius: "6px", border: "1px solid #ccc", background: "#f0f0f0", cursor: "pointer", fontSize: "0.85em" }}
          >
            📋 Copy invite link
          </button>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "6px 12px", borderRadius: "6px", background: "#25D366", color: "white", textDecoration: "none", fontSize: "0.85em", display: "inline-block" }}
          >
            💬 Share on WhatsApp
          </a>
          <a
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ padding: "6px 12px", borderRadius: "6px", background: "#0088cc", color: "white", textDecoration: "none", fontSize: "0.85em", display: "inline-block" }}
          >
            ✈️ Share on Telegram
          </a>
        </div>
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

      {isOwner && (
        <>
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
              <label>
                Revolut link <span style={{ color: "#888", fontWeight: "normal" }}>(optional)</span>
                <input type="url" value={revolut} onChange={(e) => setRevolut(e.target.value)}
                  placeholder="e.g. https://revolut.me/yourname"
                  style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
              </label>
              {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
              <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
                {submitting ? "Adding…" : "Add Member"}
              </button>
            </form>
          </section>
        </>
      )}

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Expenses</h2>
        {expenses.length === 0 && <p style={{ color: "#888" }}>No expenses yet.</p>}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {expenses.map((exp) => {
            const paidBy = users.find((u) => u.id === exp.paid_by);
            const share = users.length > 0 ? (Number(exp.amount) / users.length).toFixed(2) : "—";
            return (
              <li key={exp.id} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <strong>{exp.title}</strong> — €{exp.amount}
                  <span style={{ marginLeft: "8px", color: "#666", fontSize: "0.9em" }}>
                    paid by {paidBy?.name ?? "unknown"}
                  </span>
                  <div style={{ fontSize: "0.85em", color: "#888", marginTop: "4px" }}>
                    €{share} per person
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleDeleteExpense(exp.id)}
                    style={{ padding: "4px 10px", background: "#fee", border: "1px solid #fcc", borderRadius: "4px", cursor: "pointer", color: "#c00", fontSize: "0.85em", lineHeight: "1.5" }}
                  >
                    Delete
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {isOwner && (
          <>
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

              <div>
                <strong>Split:</strong>
                <label style={{ marginLeft: "12px" }}>
                  <input type="radio" value="even" checked={splitMode === "even"}
                    onChange={() => setSplitMode("even")} /> Even
                </label>
                <label style={{ marginLeft: "12px" }}>
                  <input type="radio" value="custom" checked={splitMode === "custom"}
                    onChange={() => setSplitMode("custom")} /> Custom
                </label>
              </div>

              {splitMode === "custom" && (
                <div style={{ background: "#f9f9f9", padding: "12px", borderRadius: "6px" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "0.9em", color: "#666" }}>
                    Enter each person's share (must add up to €{expAmount || 0})
                  </p>
                  {users.map((u) => (
                    <label key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                      <span style={{ minWidth: "100px" }}>{u.name}</span>
                      <input
                        type="number"
                        value={customSplits[u.id] ?? ""}
                        onChange={(e) => setCustomSplits((prev) => ({ ...prev, [u.id]: e.target.value }))}
                        placeholder="0"
                        style={{ padding: "4px 8px", width: "100px" }}
                      />
                    </label>
                  ))}
                </div>
              )}

              {expFormError && <p style={{ color: "red", margin: 0 }}>{expFormError}</p>}
              <button type="submit" disabled={expSubmitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
                {expSubmitting ? "Adding…" : "Add Expense"}
              </button>
            </form>
          </>
        )}
      </section>

      <hr style={{ margin: "1.5rem 0" }} />

      <section>
        <h2>Settlements</h2>
        {isOwner && (
          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            style={{ marginBottom: "1rem", padding: "6px 16px", background: "#f0f0f0", border: "1px solid #ccc", borderRadius: "4px", cursor: "pointer" }}
          >
            {recalculating ? "Recalculating…" : "🔄 Recalculate Splits"}
          </button>
        )}
        {settlements.length === 0 ? (
          <p style={{ color: "#888" }}>Everyone is settled up! 🎉</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {settlements.map((s, i) => {
              const isConfirmed = confirmed.some(
                (c) => c.from_name === s.from && c.to_name === s.to && Number(c.amount) === Number(s.amount)
              )
              return (
                <li key={i} style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", opacity: isConfirmed ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{s.from}</strong>
                    <span style={{ color: "#666" }}> owes </span>
                    <strong>{s.to}</strong>
                    <span style={{ color: "#2a7a2a", fontWeight: "bold" }}> €{Number(s.amount).toFixed(2)}</span>
                    {isConfirmed && <span style={{ marginLeft: "8px", color: "#888", fontSize: "0.85em" }}>✅ Paid</span>}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {s.revolut_link && (
                      <a
                        href={s.revolut_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ padding: "4px 10px", background: "#0075eb", color: "white", borderRadius: "6px", textDecoration: "none", fontSize: "0.85em", whiteSpace: "nowrap", display: "inline-block", lineHeight: "1.5" }}
                      >
                        Pay via Revolut
                      </a>
                    )}
                    {isOwner && !isConfirmed && (
                      <button
                        onClick={() => handleConfirmSettlement(s)}
                        style={{ padding: "4px 10px", background: "#e6f4ea", border: "1px solid #a8d5b5", borderRadius: "6px", cursor: "pointer", color: "#2a7a2a", fontSize: "0.85em", whiteSpace: "nowrap", lineHeight: "1.5" }}
                      >
                        Mark as paid
                      </button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {isOwner && (
        <>
          <hr style={{ margin: "1.5rem 0" }} />
          <section>
            <h2>💚 Donate Together</h2>
            <p style={{ color: "#666", fontSize: "0.9em" }}>
              Split a donation to a charity among all group members.
            </p>
            <form onSubmit={handleGroupDonation} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label>
                Organization <span style={{ color: "red" }}>*</span>
                <select value={selectedOrg} onChange={(e) => setSelectedOrg(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }}>
                  <option value="">Select organization</option>
                  {donationOrgs.map((org) => (
                    <option key={org.id} value={org.id}>{org.org_name}</option>
                  ))}
                </select>
              </label>
              <label>
                Amount (€) <span style={{ color: "red" }}>*</span>
                <input type="number" value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="e.g. 20"
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
              {donationError && <p style={{ color: "red", margin: 0 }}>{donationError}</p>}
              <button type="submit" disabled={donating}
                style={{ alignSelf: "flex-start", padding: "8px 20px", background: "#2a7a2a", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
                {donating ? "Adding…" : "💚 Split Donation"}
              </button>
            </form>
          </section>
        </>
      )}
    </div>
  );
}
