import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../services/api";
import styles from "./HomePage.module.css";

// Put page-level components in src/pages/.
// Each page is composed from smaller components in src/components/.
export function HomePage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleCreateGroup() {
    setLoading(true);
    setError(null);
    try {
      const group = await createGroup(groupName || "My Group");
      navigate(`/groups/${group.id}`, { state: { group } });
    } catch (err) {
      setError("Could not create group. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <h1>🚀 Split-It — bill splitter fullstack project</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Group name"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        style={{ padding: "6px 8px", marginRight: "8px" }}
      />
      <button
        className={styles.button}
        onClick={handleCreateGroup}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create Group"}
      </button>
    </div>
  );
}
