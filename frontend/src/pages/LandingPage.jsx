import { useState, useEffect } from "react";
import { UserCard } from "../components/UserCard";
import styles from "./HomePage.module.css";

// Put page-level components in src/pages/.
// Each page is composed from smaller components in src/components/.
export function HomePage() {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState([]);

  // Example: fetch data from the backend on mount
  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, []);

  return (
    <div className={styles.container}>
      <h1>🚀 MigraCode Fullstack Starter</h1>
      <p>
        Counter: <strong>{count}</strong>
        <button className={styles.button} onClick={() => setCount((c) => c + 1)}>
          +1
        </button>
      </p>
      <h2>Users from API</h2>
      {users.length === 0 && <p className={styles.hint}>Start the backend to see users here.</p>}
      {users.map((user) => (
        <UserCard key={user.id} name={user.name} role={user.role} />
      ))}
    </div>
  );
}
