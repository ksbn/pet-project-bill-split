import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getDonations, recordDonation } from "../services/api";

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

  async function handleDonate(org) {
    try {
      await recordDonation(org.org_name, org.org_url, org.description);

      setOrganizations((prev) =>
        prev.map((item) =>
          item.id === org.id ? { ...item, donated: true } : item,
        ),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "2rem",
      }}
    >
      <h1>Donations</h1>

      {organizations.map((org) => (
        <div
          key={org.id}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h2>{org.org_name}</h2>

          <p>{org.description}</p>

          <a href={org.org_url} target="_blank" rel="noopener noreferrer">
            Visit Website
          </a>

          <br />
          <br />

          <button
            onClick={() => handleDonate(org)}
            disabled={org.donated}
            style={{
              backgroundColor: org.donated ? "#ccc" : "green",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: org.donated ? "default" : "pointer",
            }}
          >
            {org.donated ? "✅ Donated" : "Donate"}
          </button>
        </div>
      ))}
    </div>
  );
}
