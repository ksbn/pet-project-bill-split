import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createGroup } from "../services/api";
import { getToken } from "../services/token";
import { clearToken } from "../services/token"
import styles from "./HomePage.module.css";

// Each page is composed from smaller components in src/components/.
export function HomePage() {
  const navigate = useNavigate();
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
    }
  }, [navigate]);

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

  function handleLogout() {
  clearToken()
  navigate("/login")
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
<button
  onClick={handleLogout}
  style={{ marginLeft: "8px", padding: "6px 16px" }}
>
  Logout
</button>
    </div>
  );
}
