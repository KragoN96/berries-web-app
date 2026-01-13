import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "../styles/CSS/my-account.css";

export default function MyAccount() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isAuthed = !!user?.token;

  // 🔹 Nume afișat
  const displayName = useMemo(() => {
    if (!user) return "Guest";
    return (
      user.name ||
      user.fullName ||
      user.username ||
      user.email ||
      "User"
    );
  }, [user]);

  // 🔹 Email
  const email = useMemo(() => {
    return user?.email || "";
  }, [user]);

  // 🔹 UNIVERSITATE – NUME COMPLET
  // IMPORTANT: aici NU scurtăm nimic
  const university = useMemo(() => {
    if (!user) return "";

    return (
      user.university ||          // recomandat
      user.universityName ||      // alternativ
      user.locationText ||        // fallback (dacă așa o salvezi)
      ""
    );
  }, [user]);

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    navigate("/login");
  };

  return (
    <div className="ma-page">
      <div className="ma-wrap">
        {/* TOP BAR */}
        <div className="ma-topbar">
          <button
            type="button"
            className="ma-back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <h1 className="ma-title">My Account</h1>
          <div className="ma-spacer" />
        </div>

        <div className="ma-grid">
          {/* PROFILE */}
          <div className="ma-card">
            <div className="ma-kicker">PROFILE</div>

            <div className="ma-name">{displayName}</div>

            {/* ✅ UNIVERSITATE COMPLETĂ */}
            {university && (
              <div className="ma-university">
                🎓 {university}
              </div>
            )}

            {email && <div className="ma-email">{email}</div>}

            {!isAuthed ? (
              <div className="ma-note">
                You’re not logged in. Please{" "}
                <Link className="ma-link" to="/login">
                  sign in
                </Link>{" "}
                to manage your account.
              </div>
            ) : (
              <div className="ma-note">
                Manage your credentials and keep your account secure.
              </div>
            )}
          </div>

          {/* SECURITY */}
          <div className="ma-card">
            <div className="ma-kicker">SECURITY</div>

            <div className="ma-actions">
              <Link
                to="/forgot-password"
                className={`ma-btn ${!isAuthed ? "is-disabled" : ""}`}
                onClick={(e) => !isAuthed && e.preventDefault()}
              >
                Reset password
              </Link>

              <Link
                to="/change-email"
                className={`ma-btn ma-btn--ghost ${!isAuthed ? "is-disabled" : ""}`}
                onClick={(e) => !isAuthed && e.preventDefault()}
              >
                Change email
              </Link>

              <button
                type="button"
                className={`ma-btn ma-btn--danger ${!isAuthed ? "is-disabled" : ""}`}
                onClick={handleLogout}
                disabled={!isAuthed}
              >
                Log out
              </button>
            </div>

            <div className="ma-mini">
              <div className="ma-mini-title">Why change email?</div>
              <div className="ma-mini-text">
                Useful if you changed your university email or lost access to it.
              </div>
            </div>
          </div>

          {/* EXTRA */}
          <div className="ma-card">
            <div className="ma-kicker">EXTRA</div>

            <div className="ma-mini">
              <div className="ma-mini-title">Privacy & Safety</div>
              <div className="ma-mini-text">
                Don’t post sensitive data (IDs, bank cards). Use secure “Where to claim” info instead.
              </div>
            </div>

            
            
          </div>
        </div>

        {/* SUPPORT */}
        <div className="ma-support">
          Need help? Contact us at{" "}
          <a
            className="ma-support-link"
            href="mailto:berries.lostfound@gmail.com"
          >
            berries.lostfound@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
