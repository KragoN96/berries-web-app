import { useState, useEffect, useRef } from "react";
import lottie from "lottie-web";
import { Link, useNavigate, NavLink } from "react-router-dom";
import "../styles/CSS/login.css";
import universityIllustration from "../Pictures/IllustrationPack/SVG/login_animation.json";
import { useAuth } from "../context/AuthContext";

import newsIcon from "../Pictures/IllustrationPack/SVG/newspaper-solid-full.svg";
import accountIcon from "../Pictures/IllustrationPack/SVG/circle-user-solid-full.svg";
import donationsIcon from "../Pictures/IllustrationPack/SVG/credit-card-solid-full.svg";
import instagram from "../Pictures/IllustrationPack/SVG/instagram-brands-solid-full.svg";
import linkedin from "../Pictures/IllustrationPack/SVG/linkedin-in-brands-solid-full.svg";
import homeIcon from "../Pictures/IllustrationPack/SVG/house-solid-full.svg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const { login, user } = useAuth();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  // ✅ alege automat backend-ul (local vs prod)
  const API_URL =
    window.location.hostname === "localhost"
      ? "http://localhost:5000"
      : "https://berries-web-app.onrender.com";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      setLoading(true);

      const res = await fetch("https://berries-web-app.onrender.com/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch {}

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // ✅ salvăm userul CORECT în context + localStorage
      login({
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        university: data.user.university,
        token: data.token,
      });

      // ✅ navigare către RUTĂ, nu fișier
      navigate("/home-page-main");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Server connection error.");
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const animationContainer = useRef(null);

  useEffect(() => {
    if (animationContainer.current) {
      const anim = lottie.loadAnimation({
        container: animationContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: universityIllustration,
      });
      return () => anim.destroy();
    }
  }, []);

  return (
    <div className="login-page-wrapper">
      {/* NAVBAR */}
      <div className="navigation-bar">
        <div className="topnav-left">
          <div className="logo">
            <div className="menu">
              <button
                className={`hamburger-btn ${isMenuOpen ? "active" : ""}`}
                onClick={toggleMenu}
                aria-label="Open menu"
                type="button"
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </div>
          </div>

          <nav className="desktop-nav">
            <Link to="/home-page-main">Home</Link>
            <Link to="/news-page">News</Link>
            <Link to={user ? "/my-account" : "/login"}>
              {user ? "My Account" : "Account"}
            </Link>
            <Link to="/donations">Donations</Link>
          </nav>
        </div>

        <div className="topnav-right">
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <div style={{ textAlign: "right", color: "white" }}>
                <div>
                  Glad to see you, <strong>{user.fullName}</strong>
                </div>
              </div>
              <button
                className="login-button"
                onClick={() => {
                  navigate("/login");
                }}
                type="button"
              >
                Back
              </button>
            </div>
          ) : (
            <div className="loginbt">
              <Link to="/register">
                <button className="login-button" type="button">
                  Create Account
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className={`fullscreen-menu ${isMenuOpen ? "is-open" : ""}`}>
        <div className="menu-content">
          <NavLink
            to="/home-page-main"
            end
            onClick={toggleMenu}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            Home<img src={homeIcon} className="home-icon" alt="Home" />
          </NavLink>

          <NavLink
            to="/news-page"
            end
            onClick={toggleMenu}
            className={({ isActive }) =>
              isActive ? "menu-item active" : "menu-item"
            }
          >
            News<img src={newsIcon} className="news-icon" alt="News" />
          </NavLink>

          <Link
            to={user ? "/my-account" : "/login"}
            className="menu-item account-item"
            onClick={toggleMenu}
          >
            {user ? "My Account" : "Account"}
            <img src={accountIcon} className="account-icon" alt="Account" />
          </Link>

          <Link to="/donations" className="menu-item" onClick={toggleMenu}>
            Donations
            <img src={donationsIcon} className="donations-icon" alt="Donations" />
          </Link>
        </div>
      </div>

      {/* PAGE CONTENT */}
      <div className="login-container-wrapper">
        <main className="login-page">
          {/* Left illustration panel */}
          <div className="illustration-panel">
            <div className="illustration-content">
              <h2>Welcome Back!</h2>
              <p>Connect with your university's lost and found community</p>
              <div
                ref={animationContainer}
                className="login-animation"
                style={{ width: "100%", height: "auto" }}
              />
            </div>
          </div>

          {/* Right login form panel */}
          <section className="login-container">
            <div className="login-welcome-message">
              <h2>Lost &amp; Found</h2>
              <h3>Login</h3>
            </div>

            <form className="credentials-input" onSubmit={handleSubmit} noValidate>
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

              <button type="submit" className="login-submit-button" disabled={loading}>
                {loading ? "Connecting..." : "Login"}
              </button>
            </form>
          </section>
        </main>
      </div>

      {/* FOOTER */}
      <div className="footer-page">
        <p>&copy; 2026 Berries. All rights reserved.</p>

        <div className="footer-links">
          <a
            href="https://instagram.com/_.aris._24/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="instagram">
              <img src={instagram} alt="Instagram" />
            </div>
          </a>
          <a
            href="https://www.linkedin.com/in/aris-dasc%C4%83lu-807212290/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="linkedin">
              <img src={linkedin} alt="LinkedIn" />
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
