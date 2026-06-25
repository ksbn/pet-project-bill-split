import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { getGroup, getGroupUsers, addUserToGroup } from "../services/api";

export default function GroupPage() {
  const { groupId } = useParams();
  const location = useLocation();

  const [group, setGroup] = useState(location.state?.group ?? null);
  const [users, setUsers] = useState([]);
  const [groupLoading, setGroupLoading] = useState(!group);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }}
            />
          </label>
          <label>
            Email <span style={{ color: "#888", fontWeight: "normal" }}>(optional)</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. alice@example.com"
              style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }}
            />
          </label>
          {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
          <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
            {submitting ? "Adding…" : "Add Member"}
          </button>
        </form>
      </section>
    </div>
  );
}