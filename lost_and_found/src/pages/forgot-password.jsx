import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/CSS/forgot_password.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    setIsError(false);

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = { message: text }; }

      if (!res.ok) {
        setIsError(true);
        setMsg(data?.message || "Something went wrong. Please try again.");
      } else {
        setMsg(data?.message || "If this email exists, you’ll receive a reset link shortly.");
      }
    } catch (err) {
      setIsError(true);
      setMsg("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-badge">🔒</div>
          <h2 className="auth-title">Forgot your password?</h2>
        </div>

        <p className="auth-subtitle">
          Enter your email and we’ll send you a secure link to reset your password.
        </p>

        <form className="auth-form" onSubmit={submit}>
          <p className="auth-label">Email address</p>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@university.edu"
            required
          />

          <button className="auth-btn" disabled={loading}>
            {loading ? "Sending..." : "Send reset link"}
          </button>
        </form>

        {msg && (
          <div className={`auth-msg ${isError ? "auth-msg--error" : ""}`}>
            {msg}
          </div>
        )}

        <div className="auth-row">
          <span className="auth-small">Remembered it?</span>
          <Link className="auth-link" to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
