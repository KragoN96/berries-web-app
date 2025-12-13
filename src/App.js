import React, { useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import Login from "./pages/login";
import Home from "./pages/home-page";
import HomePage from "./pages/home-page-main";
import About from "./pages/about-page";
import Contact from "./pages/contact-page";
import News from "./pages/news-page";
import ForgotPassword from "./pages/forgot-password";
import Register from "./pages/register";
import ReportItem from "./pages/report-lost-item";
import ViewItems from "./pages/view-lost-items";
import Donations from "./pages/donations";

import { AuthProvider } from "./context/AuthContext";

function App() {
  // Track user IP când se încarcă aplicația
  useEffect(() => {
    fetch("http://localhost:5000/api/track-ip")
      .then((res) => res.json())
      .then((data) => {
        console.log("✓ User tracked:", data);
      })
      .catch((err) => console.error("Error:", err));
  }, []);
console.log("React version:",React.version);
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Redirect root to /home */}
          <Route path="/" element={<Navigate to="/home" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/home-page" element={<Home />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about-page" element={<About />} />
          <Route path="/contact-page" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<Register />} />
          <Route path="/news-page" element={<News />} />
          <Route path="/report-lost-item" element={<ReportItem />} />
          <Route path="/view-lost-items" element={<ViewItems />} />
          <Route path="/donations" element={<Donations />} />

          {/* 404 → trimitem la /home-page */}
          <Route path="*" element={<Navigate to="/home-page" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
