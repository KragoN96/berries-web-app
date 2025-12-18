import "../styles/CSS/reset_password.css";
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const token = params.get("token");
  const email = params.get("email");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // countdown + redirect
  useEffect(() => {
    if (secondsLeft === null) return;

    if (secondsLeft === 0) {
      navigate("/login");
      return;
    }

    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, navigate]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setIsError(false);

    if (newPassword !== confirmPassword) {
      setIsError(true);
      setMsg("Passwords do not match. Please try again.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("https://berries-web-app.onrender.com/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword }),
      });

      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        setIsError(true);
        setMsg(data.message || "Reset failed. Please try again.");
      } else {
        setMsg(
          data.message ||
            "Your password has been updated successfully."
        );
        setIsSuccess(true);
        setSecondsLeft(10);
      }
    } catch (err) {
      setIsError(true);
      setMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token || !email) {
    return <p className="fp-error">Invalid or incomplete reset link.</p>;
  }

  return (
    <div className="fp-wrap">
      <div className="fp-card">

        {/* SUCCESS SCREEN */}
        {isSuccess ? (
          <div className="fp-success">
            <h2 className="fp-title">Password reset successful ✅</h2>

            <p className="fp-subtitle">
              Your password has been changed successfully.
            </p>

            <p className="fp-small">
              Redirecting to login in <b>{secondsLeft}</b> seconds...
            </p>
          </div>
        ) : (
          <>
            {/* FORM */}
            <h2 className="fp-title">Reset your password</h2>
            <p className="fp-subtitle">
              Set a new password for <b>{email}</b>.
            </p>

            <form className="fp-form" onSubmit={submit}>
              <label className="fp-label">New password</label>
              <input
                className="fp-input"
                type={showPasswords ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />

              <label className="fp-label">Confirm new password</label>
              <input
                className="fp-input"
                type={showPasswords ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                minLength={6}
                required
              />

              <button
                type="button"
                className="fp-show-btn"
                onClick={() => setShowPasswords((v) => !v)}
              >
                {showPasswords ? "Hide passwords" : "Show passwords"}
              </button>

              <button className="fp-btn" disabled={loading}>
                {loading ? "Saving..." : "Update password"}
              </button>
            </form>

            {msg && (
              <p className={`fp-msg ${isError ? "fp-msg-error" : ""}`}>
                {msg}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
