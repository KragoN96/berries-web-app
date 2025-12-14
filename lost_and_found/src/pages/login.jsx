import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CSS/login.css";
import universityIllustration from "../Pictures/IllustrationPack/PNG/login_illustration.png";
import { useAuth } from "../context/AuthContext";


function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
 const { login } = useAuth();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Completează email și parolă.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Invalid login credentials.");
        setLoading(false);
        return;
      }
        login(data.user);
      
      

      alert("Te-ai autentificat cu succes!");
      navigate("/home-page");
    } catch (err) {
      console.error("Login error:", err);
      setError("Eroare de conexiune la server.");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="container">
      <main className="login-page">
        {/* Left illustration panel */}
        <div className="illustration-panel">
          <div className="illustration-content">
            <h2>Welcome Back!</h2>
            <p>Connect with your university's lost and found community</p>
            <img
              src={universityIllustration}
              alt="University Life"
              className="illustration-image"
            />
          </div>
        </div>

        {/* Right login form panel */}
        <section className="login-container">
          <div className="login-welcome-message">
            <h2>Lost &amp; Found</h2>
            <h3>Login</h3>
          </div>

          <form
            className="credentials-input"
            onSubmit={handleSubmit}
            noValidate
          >
            {error && <div className="login-error">{error}</div>}

            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="email-input"
              name="email"
              autoComplete="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="password-input"
                name="password"
                autoComplete="current-password"
                placeholder="........."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="forgot-password-link">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            <div className="register-link">
              <Link to="/register">Don't have an account?</Link>
            </div>

            <button
              type="submit"
              className="login-submit-button"
              disabled={loading}
            >
              {loading ? "Se conectează..." : "Login"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

export default Login;
