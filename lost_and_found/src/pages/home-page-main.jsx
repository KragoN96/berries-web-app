import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/CSS/home_page_main.css';
import landingIllustration from '../Pictures/IllustrationPack/PNG/landing_page_illustration.png';
import accountIcon from '../Pictures/IllustrationPack/SVG/circle-user-solid-full.svg';

function HomePageMain() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [height, setHeight] = useState('0px');
  const panelRef = useRef(null);

  const openNav = () => {
    setIsMenuOpen(true);
    if (panelRef.current) {
      setHeight(panelRef.current.scrollHeight + 'px');
    }
  };

  const closeNav = () => {
    setIsMenuOpen(false);
    if (panelRef.current) {
      setHeight('0px');
    }
  };

  useEffect(() => {
    const panel = panelRef.current;
    const handleTransitionEnd = () => {
      if (!isMenuOpen) {
        setHeight('0px');
      }
    };

    if (panel) {
      panel.addEventListener('transitionend', handleTransitionEnd);
      return () => panel.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [isMenuOpen]);

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
              <div className="homebbt">
                <Link to="/home">
                  <button className="home-button">Home</button>
                </Link>
              </div>

              <div className="newsbt">
                <Link to="/news-page">
                  <button className="news-button">News</button>
                </Link>
              </div>

              <div className="menu">
                <button
                  className="button-menu"
                  onMouseEnter={openNav}
                  onMouseLeave={closeNav}
                >
                  Menu
                </button>
                <div
                  ref={panelRef}
                  className={`menu-open ${isMenuOpen ? 'is-open' : ''}`}
                  id="menu-trans"
                  style={{ height: height }}
                  onMouseEnter={openNav}
                  onMouseLeave={closeNav}
                >
                    <div className="settings-link">
                      <Link to="/settings">Settings</Link></div>
                    <div className="account-link">
                      <Link to="/login">Account</Link>
                  <img
                    src={accountIcon}
                    className="img_account"
                  /></div>
                    <div className="donations-link">
                      <Link to="/donations">Donations</Link></div>
                </div>
              </div>
            </div>
          </div>

          <div className="topnav-right">
            <div className="loginbt">
              <Link to="/login">
                <button className="login-button">Sign Up</button>
              </Link>
            </div>
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
                  <Link to="/login">
                    <button className="report-lost-item-button">Report Found Item</button>
                  </Link>
                </div>
                <div className="viewbt">
                  <Link to="/view-lost-items">
                    <button className="view-lost-items-button">View Lost Items</button>
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
              <p>Tell us what you misplaced and where you last saw it.<br></br>
                We’ll publish the report so others can help you recover it.</p>
            </div>
            <div className="text2-box2">
              <h2>Browse Found Items</h2>
              <p>See items students have already reported.<br></br>
                  Your backpack, laptop, or ID might already be listed.</p>
            </div>
            <div className="text3-box2">
              <h2>Lost an ID or Sensitive Document?</h2>
              <p>Student IDs, passports, bank cards, and any document containing personal data are handled securely.<br></br>
                  We’ll forward your request directly to the university office.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePageMain;
