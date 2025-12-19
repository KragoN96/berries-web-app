import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CSS/change-email.css";

const API_BASE = "http://localhost:5000";

export default function ChangeEmail() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/change-email`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          newEmail,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update email");

      // ✅ update AuthContext + localStorage
      login({
        ...user,
        email: data.email,
      });

      setSuccess("Email updated successfully.");
      setTimeout(() => navigate("/my-account"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ce-page">
      <div className="ce-card">
        <h1>Change Email</h1>

        {error && <div className="ce-error">{error}</div>}
        {success && <div className="ce-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="newEmail">New email</label>
          <input
            id="newEmail"
            type="email"
            autoComplete="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="your@email.com"
            required
          />

          <label htmlFor="password">Current password</label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Updating..." : "Update email"}
          </button>
        </form>

        <button
          type="button"
          className="ce-back"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
