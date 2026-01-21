import { useState, useMemo } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/CSS/news.css";

import newsIcon from "../Pictures/IllustrationPack/SVG/newspaper-solid-full.svg";
import accountIcon from "../Pictures/IllustrationPack/SVG/circle-user-solid-full.svg";
import donationsIcon from "../Pictures/IllustrationPack/SVG/credit-card-solid-full.svg";
import instagram from "../Pictures/IllustrationPack/SVG/instagram-brands-solid-full.svg";
import linkedin from "../Pictures/IllustrationPack/SVG/linkedin-in-brands-solid-full.svg";
import homeIcon from "../Pictures/IllustrationPack/SVG/house-solid-full.svg";

export default function News() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/home");
    setIsMenuOpen(false);
  };

  const posts = [
    {
      date: "December 19",
      title: "Official Launch of Lost & Found",
      tag: "Update",
      content: [
        "Today we officially launched the Lost & Found platform – a place made for students who want to recover lost items more easily on campus.",
        "You can post lost or found items, search quickly, and contact the person who posted directly.",
        "Thank you to everyone who tested the app and sent us feedback before launch!",
      ],
    },
    {
      date: "January 1",
      title: "Happy New Year! 🎆",
      tag: "Announcement",
      content: [
        "We are starting the new year with energy and new ideas for Lost & Found!",
        "In the next period, we plan to improve search, filters, and the mobile experience.",
        "Thank you for being part of the Lost & Found community. Happy New Year!",
      ],
    },
    {
      date: "January 17",
      title: "Stability & Improvements",
      tag: "Dev",
      content: [
        "We are constantly working on stability and performance.",
        "We optimized loading and prepared the base for future updates, including more filters and a faster experience.",
      ],
    },
  ];


  return (
    <div className="news-page-wrapper">
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
                {user.university && (
                  <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                    {user.university}
                  </div>
                )}
              </div>
              <button
                className="login-button"
                onClick={handleLogout}
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="loginbt">
              <Link to="/login">
                <button className="login-button" type="button">
                  Sign Up
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
      <div className="news-page-content">
        <div className="news-hero">
          <div className="news-hero__inner">
            <h1 className="news-title">NEWS</h1>
            <p className="news-subtitle">
              Latest announcements and updates about the Lost &amp; Found platform.
            </p>
          </div>
        </div>

        <div className="news-container">
          <div className="news-grid">
            {posts.map((p, idx) => (
              <article className="news-card" key={`${p.title}-${idx}`}>
                <div className="news-card__top">
                  <span className="news-date">{p.date}</span>
                  <span className="news-tag">{p.tag}</span>
                </div>

                <h2 className="news-card__title">{p.title}</h2>

                <div className="news-card__content">
                  {p.content.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>

                <div className="news-card__footer">
                  <span className="news-dot" />
                  <span className="news-footer-text">Berries Team</span>
                </div>
              </article>
            ))}
          </div>

          <div className="news-note">
            <p>
              Have a suggestion or found a bug? Contact us via email at berries.lostfound@gmail.com
            </p>
          </div>
        </div>
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