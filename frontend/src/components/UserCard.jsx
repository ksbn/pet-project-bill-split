export default function UserCard({ name, role }) {
  return (
    <div style={{ padding: "10px", border: "1px solid #ccc", marginBottom: "8px" }}>
      <h3>{name}</h3>
      <p>{role}</p>
    </div>
  );
}