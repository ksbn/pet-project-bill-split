import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getGroupByInviteCode, joinGroupByInviteCode } from "../services/api";

export default function JoinPage() {
  const { inviteCode } = useParams();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    getGroupByInviteCode(inviteCode)
      .then(setGroup)
      .catch(() => setError("Invalid or expired invite link."))
      .finally(() => setLoading(false));
  }, [inviteCode]);

  async function handleJoin(e) {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Please enter your name.");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await joinGroupByInviteCode(inviteCode, { name: name.trim() });
      navigate(`/groups/${group.id}`);
    } catch {
      setFormError("Could not join group. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <p style={{ padding: "2rem" }}>Loading invite…</p>;
  if (error) return <p style={{ padding: "2rem", color: "red" }}>{error}</p>;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "2rem" }}>
      <h1>You're invited!</h1>
      <p>Join <strong>{group?.name}</strong> on Split-It.</p>

      <form onSubmit={handleJoin} style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "1.5rem" }}>
        <label>
          Your name <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alice"
            style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }}
          />
        </label>
        {formError && <p style={{ color: "red", margin: 0 }}>{formError}</p>}
        <button type="submit" disabled={submitting} style={{ alignSelf: "flex-start", padding: "8px 20px" }}>
          {submitting ? "Joining…" : "Join Group"}
        </button>
      </form>
    </div>
  );
}