import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CSS/login.css';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert('Passwords do not match!');
      return;
    }

    try {
      const res = await fetch('http://localhost:5001/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!data.success) {
        alert(data.message || 'Registration failed');
        return;
      }

      alert('Registration successful! You can now log in.');
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      alert('Network error. Please make sure the backend is running.');
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-welcome-message">
          <h3>City Universities</h3>
          <h2>Lost &amp; Found</h2>
          <h3>Register</h3>
        </div>

        <form className="credentials-input" onSubmit={handleRegister}>
          <label>Email Address</label>
          <input
            type="email"
            placeholder="your@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <div className="loginbt">
            <button className="login-submit-button" type="submit">
              Register
            </button>
          </div>

          <div className="register-link">
            <Link to="/login">Already have an account?</Link>
          </div>
        </form>
      </section>
    </main>
  );
}

export default Register;
