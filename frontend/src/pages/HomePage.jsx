import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserCard from "../components/UserCard";
import { createGroup } from "../services/api";
import styles from "./HomePage.module.css";

// Put page-level components in src/pages/.
// Each page is composed from smaller components in src/components/.
export function HomePage() {
  const navigate = useNavigate();
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  // Example: fetch data from the backend on mount
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

    async function handleCreateGroup() {
    setLoading(true);
    setError(null);
    try {
      const group = await createGroup("My Group");
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
      <p>
        Counter: <strong>{count}</strong>
        <button className={styles.button} onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      <button
        className={styles.button}
        onClick={handleCreateGroup}
        disabled={loading}
      >
        {loading ? "Creating…" : "Create Group"}
      </button>
      
      <h2>Users from API</h2>
      {users.length === 0 && <p className={styles.hint}>Start the backend to see users here.</p>}
      {users.map((user) => (
        <UserCard key={user.id} name={user.name} role={user.role} />
      ))}
    </div>
  );
}
