import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/CSS/home_page_main.css";

import landingIllustration from "../Pictures/IllustrationPack/PNG/landing_page_illustration.png";
import accountIcon from "../Pictures/IllustrationPack/SVG/circle-user-solid-full.svg";
import donationsIcon from "../Pictures/IllustrationPack/SVG/credit-card-solid-full.svg";
import newsIcon from "../Pictures/IllustrationPack/SVG/newspaper-solid-full.svg";

import { useAuth } from "../context/AuthContext";

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/home"); // Back to landing page
  };

  const reportLink = user ? "/report-lost-item" : "/login";

  return (
    <div className="container-home">
      {/* blurred background shapes */}
      <div className="bg-shape bg-shape-1"></div>
      <div className="bg-shape bg-shape-2"></div>

      {/* all page content */}
      <div className="home-content">
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
          </div>

          {/* top-right: messsage + logout */}
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

                <button className="login-button" onClick={handleLogout} type="button">
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

        {/* Full screen menu overlay (WITHOUT Home) */}
        <div className={`fullscreen-menu ${isMenuOpen ? "is-open" : ""}`}>
          <div className="menu-content">
            <Link to="/news-page" className="menu-item" onClick={toggleMenu}>
              News
              <img src={newsIcon} className="news-icon" alt="News" />
            </Link>

           {/*<Link to="/settings" className="menu-item" onClick={toggleMenu}>
              Settings
              <img src={settingsIcon} className="settings-icon" alt="Settings" />
            </Link>*/}

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
              <img
                src={donationsIcon}
                className="donations-icon"
                alt="Donations"
              />
            </Link>
          </div>
        </div>

        <div className="welcome-message">
          <div className="motto-message">
            <h2>Find your lost items quickly and securely</h2>
          </div>
          <div className="connect-message">
            <h3>Search reports from students or submit your own in seconds</h3>
          </div>
        </div>

        <div className="home-table">
          <div className="box1">
            <div className="box1-text">
              <h2>Berries</h2>
              <h1>Lost &amp; Found</h1>
              <p>Your trusted platform where you can find your belongings fast!</p>

              <div className="buttons-container">
                <div className="reportbt">
                  <Link to={reportLink}>
                    <button className="report-lost-item-button" type="button">
                      Report Found Item
                    </button>
                  </Link>
                </div>

                <div className="viewbt">
                  <Link to="/view-lost-items">
                    <button className="view-lost-items-button" type="button">
                      View Lost Items
                    </button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="box1-image">
              <img
                src={landingIllustration}
                alt="Landing Page Illustration"
                className="landing_illustration"
              />
            </div>
          </div>

          <div className="box2">
            <div className="text1-box2">
              <h2>Report a lost item</h2>
              <p>
                Tell us what you misplaced and where you last saw it.
                <br />
                We’ll publish the report so others can help you recover it.
              </p>
            </div>

            <div className="text2-box2">
              <h2>Browse Found Items</h2>
              <p>
                See items students have already reported.
                <br />
                Your backpack, laptop, or ID might already be listed.
              </p>
            </div>

            <div className="text3-box2">
              <h2>Lost an ID or Sensitive Document?</h2>
              <p>
                Student IDs, passports, bank cards, and any document containing
                personal data are handled securely.
                <br />
                We’ll forward your request directly to the university office.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
