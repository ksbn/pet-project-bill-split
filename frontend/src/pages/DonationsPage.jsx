import { Navigate } from "react-router-dom";

export default function DonationsPage() {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div>
      <h1>Donations</h1>
    </div>
  );
}
