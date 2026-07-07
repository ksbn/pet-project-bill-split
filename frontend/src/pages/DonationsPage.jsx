import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDonations } from "../services/api";

export default function DonationsPage() {
  const token = localStorage.getItem("token");

  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDonations() {
      try {
        const data = await getDonations();
        setOrganizations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadDonations();
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }
  if (loading) {
    return <p>Loading organizations...</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  return (
    <div>
      <h1>Donations</h1>
    </div>
  );
}
