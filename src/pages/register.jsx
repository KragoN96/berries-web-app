import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CSS/register.css";

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
      setError("Te rugăm să completezi toate câmpurile obligatorii.");
      return;
    }

    if (!formData.university) {
      setError("Te rugăm să selectezi universitatea.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Parola trebuie să aibă minim 6 caractere.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Parolele nu coincid.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "A apărut o eroare la înregistrare.");
        setLoading(false);
        return;
      }

      alert("Cont creat cu succes! Te poți autentifica acum.");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      setError("Eroare de conexiune la server.");
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="register-page">
        
        <div className="illustration-panel">
          <div className="illustration-content">
            <h2>Ești nou pe platformă?</h2>
            <p>
              Creează-ți un cont ca să poți publica și urmări anunțuri Lost &amp;
              Found în toate universitățile din București.
            </p>
            
          </div>
        </div>

       
        <div className="register-container">
          <div className="register-welcome-message">
            <h2>Creare cont</h2>
            <p>Completează datele de mai jos pentru a începe.</p>
          </div>

          {error && <div className="register-error">{error}</div>}

          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              Nume complet *
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
              E-mail universitar *
              <input
                type="email"
                name="email"
                className="register-input"
                placeholder="exemplu@student.unibuc.ro"
                value={formData.email}
                onChange={handleChange}
              />
            </label>

            <label>
              Universitate *
              <select
                name="university"
                className="register-input"
                value={formData.university}
                onChange={handleChange}
              >
                <option value="">Selectează universitatea</option>

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
              Parolă *
              <input
                type="password"
                name="password"
                className="register-input"
                placeholder="Minim 6 caractere"
                value={formData.password}
                onChange={handleChange}
              />
            </label>

            <label>
              Confirmă parola *
              <input
                type="password"
                name="confirmPassword"
                className="register-input"
                placeholder="Reintrodu parola"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </label>

            <button
              type="submit"
              className="register-submit-button"
              disabled={loading}
            >
              {loading ? "Se creează contul..." : "Creează cont"}
            </button>
          </form>

          <div className="register-login-link">
            Ai deja cont? <Link to="/login">Autentifică-te aici</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
