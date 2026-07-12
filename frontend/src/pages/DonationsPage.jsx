import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getToken } from "../services/token";
import { getDonations } from "../services/api";

export default function DonationsPage() {
  const navigate = useNavigate();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [donated, setDonated] = useState({});

  useEffect(() => {
    if (!getToken()) { navigate("/login"); return; }
    getDonations()
      .then(setDonations)
      .catch(() => setError("Could not load organisations."))
      .finally(() => setLoading(false));
  }, [navigate]);

  function handleDonate(id) {
    setDonated((prev) => ({ ...prev, [id]: true }));
  }

  if (loading) return <div className="page" style={{ paddingTop: "3rem", color: "var(--text-muted)" }}>Loading...</div>;
  if (error) return <div className="page" style={{ paddingTop: "3rem", color: "#c00" }}>{error}</div>;

  return (
    <div className="page">
      <div className="section">
        <h1 style={{ fontSize: "2rem", fontWeight: "800", letterSpacing: "-0.02em", marginBottom: "0.5rem" }}>
          Donate Together
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Choose a charity and donate as a group.
        </p>
      </div>

      {donations.length === 0 ? (
        <div className="glass section" style={{ padding: "3rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)" }}>No organisations available yet.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {donations.map((org) => (
            <div key={org.id} className="glass section" style={{ padding: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                <div>
                  <strong style={{ fontSize: "1.05rem" }}>{org.org_name}</strong>
                  {org.description && (
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9em", marginTop: "4px" }}>
                      {org.description}
                    </p>
                  )}
                </div>
                <button
                  className="btn-primary"
                  onClick={() => handleDonate(org.id)}
                  disabled={donated[org.id]}
                  style={{ flexShrink: 0, minWidth: "110px" }}
                >
                  {donated[org.id] ? "Donated" : "Donate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}