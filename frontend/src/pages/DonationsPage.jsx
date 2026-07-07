import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export default function DonationsPage() {
  const token = localStorage.getItem("token");

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div>
      <h1>Donations</h1>
    </div>
  );
}
