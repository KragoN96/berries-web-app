import React, { useState, useRef, useEffect } from "react";
import lottie from "lottie-web";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CSS/register.css";

import registerAnimation from "../Pictures/IllustrationPack/SVG/STUDENT.json";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    university: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.email || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!formData.university) {
      setError("University selection is required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("The password must be at least 6 characters long..");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://berries-web-app.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "An error occurred during registration.");
        setLoading(false);
        return;
      }

      alert("Account created successfully! You can now log in.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError("Eroare de conexiune la server.");
      setLoading(false);
    }
  };

  const animContainer = useRef(null);

  useEffect(() => {
    if (animContainer.current) {
      const anim = lottie.loadAnimation({
        container: animContainer.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: registerAnimation,
      });
      return () => anim.destroy();
    }
  }, []);

  return (
    <div className="container">
      <div className="register-page">
        {/* Left illustration panel */}
        <div className="illustration-panel">
          <div className="illustration-content">
            <h2>New here?</h2>
            <p>
              Create an account to publish and follow posts Lost &amp;
              Found across all universities in Bucharest.
            </p>
            <div
              ref={animContainer}
              className="register-animation"
              style={{ width: "100%", height: "auto" }}
            />
          </div>
        </div>

        {/* Right registration form panel */}
        <div className="register-container">
          <div className="register-welcome-message">
            <h2>Create an account</h2>
            <p>Fill in the details below to get started.</p>
          </div>

          {error && <div className="register-error">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Full name *
              <input
                type="text"
                name="fullName"
                className="register-input"
                placeholder="Ex: Ionescu Maria"
                value={formData.fullName}
                onChange={handleChange}
              />
            </label>

            <label>
              University email address *
              <input
                type="email"
                name="email"
                className="register-input"
                placeholder="example@student.unibuc.ro"
                value={formData.email}
                onChange={handleChange}
              />
            </label>

            <label>
              University *
              <select
                name="university"
                className="register-input"
                value={formData.university}
                onChange={handleChange}
              >
                <option value="">Select University</option>

                {/* Stat */}
                <option value="UB">Universitatea din București</option>
                <option value="UNSTPB">Politehnica București</option>
                <option value="ASE">Academia de Studii Economice</option>
                <option value="UMFCD">UMF „Carol Davila”</option>
                <option value="UNARTE">
                  Universitatea Națională de Arte
                </option>
                <option value="UNATC">UNATC „I. L. Caragiale”</option>
                <option value="SNSPA">SNSPA</option>
                <option value="UNEFS">UNEFS</option>
                <option value="UNMB">
                  Universitatea Națională de Muzică
                </option>
                <option value="ANIMV">
                  Academia Națională de Informații
                </option>
                <option value="APOL">Academia de Poliție</option>
                <option value="UNAP">
                  Universitatea Națională de Apărare
                </option>

                {/* Private */}
                <option value="SPIRU">Universitatea Spiru Haret</option>
                <option value="HYPERION">Universitatea Hyperion</option>
                <option value="URA">
                  Universitatea Româno-Americană
                </option>
                <option value="UTM">Universitatea Titu Maiorescu</option>
                <option value="TITULESCU">
                  Universitatea Nicolae Titulescu
                </option>
                <option value="CANTEMIR">
                  Universitatea Dimitrie Cantemir
                </option>
                <option value="BIOTERRA">Universitatea Bioterra</option>
                <option value="ECOLOGICA">
                  Universitatea Ecologică din București
                </option>
                <option value="ATHENAEUM">
                  Universitatea Athenaeum
                </option>
              </select>
            </label>

            <label>
              Password *
              <input
                type="password"
                name="password"
                className="register-input"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </label>

            <label>
              Confirm password *
              <input
                type="password"
                name="confirmPassword"
                className="register-input"
                placeholder="Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </label>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <div className="register-login-link">
            Already have an account? <Link to="/login">Log in now</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
