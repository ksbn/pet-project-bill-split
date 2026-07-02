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
    <div className={styles.hero}>
      <h1>🚀 Split-It </h1>
      <p className={styles.subtitle}> 
        Split expenses effortlessly with roommates, friends, and trips.
      </p>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div className={styles.card}>
        <h2> Create a New Group </h2>
        <div className={styles.form}>
         <label htmlFor="group-name">
          Group Name
         </label>
         <input
           type="text"
           placeholder="Enter a group name"
           value={groupName}
           onChange={(e) => setGroupName(e.target.value)}
         />
         <button
           className={styles.button}
           onClick={handleCreateGroup}
           disabled={loading}
         >
         {loading ? "Creating…" : "Create Group"}
         </button>
        </div>
      </div>
    </div>
  );

}
