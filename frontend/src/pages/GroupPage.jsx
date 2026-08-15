import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getToken } from "../services/token";
import { getGroup, getGroupUsers, addUserToGroup, addExpense, getExpenses, getSettlements, recalculateSplits, deleteExpense, confirmSettlement, getConfirmedSettlements, getDonations } from "../services/api";
import { validateMemberName, validateEmail, validateAmount } from "../utils/validate";

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
  const [donations, setDonations] = useState([]);
  const [donationOrg, setDonationOrg] = useState("");
  const [donationAmount, setDonationAmount] = useState("");
  const [donationSubmitting, setDonationSubmitting] = useState(false);
  const [donationError, setDonationError] = useState(null);

  useEffect(() => {
    if (!getToken()) navigate("/login");
  }, [navigate]);

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
    ]).then(([u, e, s, c]) => {
      setUsers(u);
      setExpenses(e);
      setSettlements(s);
      setConfirmed(c);
      setUsersLoading(false);
    }).catch(() => setError("Could not load group data."));
  }, [groupId]);

  useEffect(() => {
    getDonations().then(setDonations).catch(() => {});
  }, []);

  async function handleAddUser(e) {
    e.preventDefault();
    const nameError = validateMemberName(name);
    if (nameError) { setFormError(nameError); return; }
    const emailError = validateEmail(email);
    if (emailError) { setFormError(emailError); return; }
    setSubmitting(true);
    setFormError(null);
    try {
      const newUser = await addUserToGroup(groupId, {
        name: name.trim(),
        email: email.trim(),
        revolut_link: revolut.trim() || null,
      });
      setUsers((prev) => [...prev, newUser]);
      setName(""); setEmail(""); setRevolut("");
    } catch {
      setFormError("Could not add user. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddExpense(e) {
    e.preventDefault();
    if (!expTitle.trim()) { setExpFormError("Title is required"); return; }
    const amountError = validateAmount(expAmount);
    if (amountError) { setExpFormError(amountError); return; }
    if (!expPaidBy) { setExpFormError("Please select who paid"); return; }
    let splits = null;
    if (splitMode === "custom") {
      splits = users.map((u) => ({ user_id: u.id, amount: Number(customSplits[u.id] ?? 0) }));
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
      setExpTitle(""); setExpAmount(""); setExpPaidBy("");
      setCustomSplits({}); setSplitMode("even");
      getSettlements(groupId).then(setSettlements).catch(() => {});
    } catch (err) {
      setExpFormError(err.message || "Could not add expense. Please try again.");
    } finally {
      setExpSubmitting(false);
    }
  }

  async function handleDeleteExpense(expenseId) {
    if (!confirm("Delete this expense?")) return;
    try {
      await deleteExpense(groupId, expenseId);
      setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
      getSettlements(groupId).then(setSettlements).catch(() => {});
    } catch {
      alert("Could not delete expense.");
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

  async function handleDonate(e) {
    e.preventDefault();
    if (!donationOrg) { setDonationError("Please select an organisation."); return; }
    const amountError = validateAmount(donationAmount);
    if (amountError) { setDonationError(amountError); return; }
    if (!expPaidBy) { setDonationError("Please select who is paying."); return; }
    const org = donations.find((d) => d.id === Number(donationOrg));
    setDonationSubmitting(true);
    setDonationError(null);
    try {
      const newExpense = await addExpense(groupId, {
        title: `🎗️ Donation - ${org.org_name}`,
        amount: Number(donationAmount),
        paid_by: Number(expPaidBy),
      });
      setExpenses((prev) => [newExpense, ...prev]);
      setDonationOrg(""); setDonationAmount("");
      getSettlements(groupId).then(setSettlements).catch(() => {});
    } catch {
      setDonationError("Could not add donation. Please try again.");
    } finally {
      setDonationSubmitting(false);
    }
  }

  async function handleConfirmSettlement(s) {
    if (!confirm(`Mark "${s.from} owes ${s.to}" as paid?`)) return;
    try {
      await confirmSettlement(groupId, s.from, s.to, s.amount);
      setConfirmed((prev) => [...prev, { from_name: s.from, to_name: s.to, amount: s.amount }]);
    } catch {
      alert("Could not confirm settlement.");
    }
  }

  if (groupLoading) return <div className="page" style={{ paddingTop: "3rem" }}>Loading group...</div>;
  if (error) return <div className="page" style={{ paddingTop: "3rem", color: "#c00" }}>{error}</div>;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Join our group "${group?.name}" on Split-It: ${window.location.origin}/join/${group?.invite_code}`)}`;
  const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`${window.location.origin}/join/${group?.invite_code}`)}&text=${encodeURIComponent(`Join our group "${group?.name}" on Split-It!`)}`;

  return (
    <div className="page">

      {/* Group info */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: "800", marginBottom: "0.5rem" }}>{group?.name ?? "Group"}</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
          <span className="label" style={{ margin: 0 }}>Invite code:</span>
          <span className="badge">{group?.invite_code ?? "—"}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <button
            className="btn-glass"
            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/join/${group.invite_code}`); alert("Link copied!"); }}
            style={{
              background: "rgba(240, 244, 255, 0.6)",
              color: "#324bb8", // Brand Blue
              border: "1px solid rgba(79, 110, 247, 0.2)",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            📋 Copy invite link
          </button>
          <a
            className="btn-glass"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              background: "#cef6d2", // Soft pastel green (cleaner than bright neon WhatsApp green)
              color: "#308734", // Dark green text
              border: "1px solid rgba(46, 125, 50, 0.15)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
             }}
          >
            💬 WhatsApp
          </a>
          <a
            className="btn-glass"
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ 
              background: "#E1F5FE", // Soft pastel Telegram blue
              color: "#0288D1", // Dark blue text
              border: "1px solid rgba(2, 136, 209, 0.15)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              borderRadius: "8px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease"
             }}
          >
            ✈️ Telegram
          </a>
        </div>
      </div>

      {/* Members */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Members</h2>
        {usersLoading && <p style={{ color: "var(--text-muted)" }}>Loading members...</p>}
        {!usersLoading && users.length === 0 && <p style={{ color: "var(--text-muted)" }}>No members yet.</p>}
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

      {/* Add Member */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Add Member</h2>
        <form onSubmit={handleAddUser} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Name *</label>
            <input className="input" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alice" />
          </div>
          <div>
            <label className="label">Email (optional)</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. alice@example.com" />
          </div>
          <div>
            <label className="label">Revolut link (optional)</label>
            <input className="input" type="url" value={revolut} onChange={(e) => setRevolut(e.target.value)} placeholder="e.g. https://revolut.me/yourname" />
          </div>
          {formError && <p style={{ color: "#c00", margin: 0, fontSize: "0.9em" }}>{formError}</p>}
          <button type="submit" className="btn-primary" disabled={submitting} style={{ alignSelf: "flex-start" }}>
            {submitting ? "Adding..." : "Add Member"}
          </button>
        </form>
      </div>

      {/* Expenses */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Expenses</h2>
        {expenses.length === 0 && <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>No expenses yet.</p>}
        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
          {expenses.map((exp) => {
            const paidBy = users.find((u) => u.id === exp.paid_by);
            const share = users.length > 0 ? (Number(exp.amount) / users.length).toFixed(2) : "—";
            return (
              <li key={exp.id} className="glass" style={{ padding: "0.75rem 1rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: "600" }}>{exp.title} — €{exp.amount}</div>
                  <div style={{ fontSize: "0.85em", color: "var(--text-muted)" }}>
                    paid by {paidBy?.name ?? "unknown"} · €{share} per person
                  </div>
                </div>
                <button className="btn-danger" onClick={() => handleDeleteExpense(exp.id)}>Delete</button>
              </li>
            );
          })}
        </ul>

        <h3 style={{ marginBottom: "0.75rem" }}>Add Expense</h3>
        <form onSubmit={handleAddExpense} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Title *</label>
            <input className="input" type="text" value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="e.g. Dinner" />
          </div>
          <div>
            <label className="label">Amount *</label>
            <input className="input" type="number" value={expAmount} onChange={(e) => setExpAmount(e.target.value)} placeholder="e.g. 90" />
          </div>
          <div>
            <label className="label">Paid by *</label>
            <select className="input" aria-label="Paid by" value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)}>
              <option value="">Select member</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontWeight: "600", fontSize: "0.9em" }}>Split:</span>
            <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input type="radio" value="even" checked={splitMode === "even"} onChange={() => setSplitMode("even")} /> Even
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer" }}>
              <input type="radio" value="custom" checked={splitMode === "custom"} onChange={() => setSplitMode("custom")} /> Custom
            </label>
          </div>
          {splitMode === "custom" && (
            <div className="glass" style={{ padding: "1rem" }}>
              <p style={{ fontSize: "0.9em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                Enter each person's share (must add up to €{expAmount || 0})
              </p>
              {users.map((u) => (
                <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                  <span style={{ minWidth: "100px", fontSize: "0.9em" }}>{u.name}</span>
                  <input
                    className="input"
                    type="number"
                    value={customSplits[u.id] ?? ""}
                    onChange={(e) => setCustomSplits((prev) => ({ ...prev, [u.id]: e.target.value }))}
                    placeholder="0"
                    style={{ width: "100px" }}
                  />
                </div>
              ))}
              {(() => {
      const total = users.reduce((sum, u) => sum + Number(customSplits[u.id] || 0), 0);
      const target = Number(expAmount) || 0;
      const ok = Math.abs(total - target) < 0.01;
      return (
        <p style={{ fontSize: "0.85em", fontWeight: 600, color: ok ? "var(--primary)" : "#c00" }}>
          Total: €{total.toFixed(2)} / €{target.toFixed(2)}
        </p>
      );
    })()}
            </div>
          )}
          {expFormError && <p style={{ color: "#c00", margin: 0, fontSize: "0.9em" }}>{expFormError}</p>}
          <button type="submit" className="btn-primary" disabled={expSubmitting} style={{ alignSelf: "flex-start" }}>
            {expSubmitting ? "Adding..." : "Add Expense"}
          </button>
        </form>
      </div>

      {/* Settlements */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "1rem" }}>Settlements</h2>
        <button 
          onClick={handleRecalculate} disabled={recalculating} 
          style={{ 
            background: "rgba(240, 244, 255, 0.4)", 
            color: "#293b89", 
            border: "1px solid rgba(79, 110, 247, 0.15)",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "0.8rem", 
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            marginBottom: "1rem"
         }}
        >
          {recalculating ? "🔄 Recalculating..." : " 🔄 Recalculate Splits"}
        </button>
        {settlements.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>Everyone is settled up!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {settlements.map((s, i) => {
              const isConfirmed = confirmed.some(
                (c) => c.from_name === s.from && c.to_name === s.to && Number(c.amount) === Number(s.amount)
              );
              return (
                <li key={i} className="glass" style={{ padding: "0.75rem 1rem", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", opacity: isConfirmed ? 0.5 : 1 }}>
                  <div style={{ flex: 1 }}>
                    <strong>{s.from}</strong>
                    <span style={{ color: "var(--text-muted)" }}> owes </span>
                    <strong>{s.to}</strong>
                    <span style={{ color: "var(--primary)", fontWeight: "bold" }}> €{Number(s.amount).toFixed(2)}</span>
                    {isConfirmed && <span style={{ marginLeft: "8px", color: "var(--text-muted)", fontSize: "0.85em" }}>Paid</span>}
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {s.revolut_link && (
                      <a className="btn-primary" href={s.revolut_link} target="_blank" rel="noopener noreferrer"
                        style={{ textDecoration: "none", fontSize: "0.85em", padding: "6px 12px" }}>
                        Pay via Revolut
                      </a>
                    )}
                      {!isConfirmed && (
                        <button 
                          className="btn-glass" 
                          onClick={() => handleConfirmSettlement(s)} 
                          style={{ 
                            background: "#ffffff", 
                            color: "#4F6EF7", 
                            border: "1px solid #4F6EF7", 
                            textDecoration: "none", 
                            display: "inline-flex", 
                            alignItems: "center", 
                            padding: "6px 12px",
                            borderRadius: "6px", // Keeps it clean and rounded
                            fontWeight: "500",
                            cursor: "pointer"
                          }}
                        >
                          Mark as paid
                        </button>
                      )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Donate Together */}
      <div className="glass section" style={{ padding: "1.5rem" }}>
        <h2 style={{ marginBottom: "0.5rem" }}>💚 Donate Together</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9em", marginBottom: "1rem" }}>
          Choose a charity — the cost splits evenly among all members.
        </p>
        <form onSubmit={handleDonate} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label className="label">Organisation *</label>
            <select className="input" aria-label="Organisation" value={donationOrg} onChange={(e) => setDonationOrg(e.target.value)}>
              <option value="">Select organisation</option>
              {donations.map((d) => <option key={d.id} value={d.id}>{d.org_name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Amount (€) *</label>
            <input className="input" type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="e.g. 20" />
          </div>
          <div>
            <label className="label">Paid by *</label>
            <select className="input" aria-label="Paid by" value={expPaidBy} onChange={(e) => setExpPaidBy(e.target.value)}>
              <option value="">Select member</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>
          {donationError && <p style={{ color: "#c00", margin: 0, fontSize: "0.9em" }}>{donationError}</p>}
          <button type="submit" className="btn-primary" disabled={donationSubmitting} style={{ alignSelf: "flex-start" }}>
            {donationSubmitting ? "Adding..." : "Donate Together"}
          </button>
        </form>
      </div>

    </div>
  );
}