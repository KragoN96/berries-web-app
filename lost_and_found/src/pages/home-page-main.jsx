import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CSS/home_page_main.css';

function HomePageMain() {
  // State to control menu open/closed
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [height, setHeight] = useState('0px');
  const panelRef = useRef(null);

  // Mouse enter handler - opens menu
  const openNav = () => {
    setIsMenuOpen(true);
    if (panelRef.current) {
      setHeight(panelRef.current.scrollHeight + 'px');
    }
  };

  // Mouse leave handler - closes menu
  const closeNav = () => {
    setIsMenuOpen(false);
    if (panelRef.current) {
      setHeight('0px');
    }
  };

  // Handle transition end effect
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
<div className="container">
      <div className="navigation-bar">
        <div className="topnav-left">
          <div className="logo">
            <div className="homebbt">
              <Link to="/home">
                <button className="home-button">Home</button>
              </Link>
            </div>
            
            {/* News button - standalone */}
            <div className="newsbt">
              <Link to="/news-page">
                <button className="news-button">News</button>
              </Link>
            </div>
            
            {/* Menu button - separate from News */}
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
                <Link to="/settings">Settings</Link>
                <Link to="/login">Account</Link>
                <Link to="/donations">Donations</Link>
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
      
      <div className="login-welcome-message">
        <div className="motto-message">
          <h2>You lost it, We found it!</h2>
        </div>
        <div className="connect-message">
          <h3>Connect with us!</h3>
        </div>
      </div>
      
  <div className="home-table">
      <div className="box1">
          <div className="box1-text">
            <h2> City Universities </h2>
            <h1> Lost &amp; Found </h1>
            <p> Your trusted platform for lost and found items across city universities </p>
              <div className="buttons-container">
                <div className="reportbt">
                  <Link to="/report-lost-item">
                    <button className="report-lost-item-button"> Report Item </button>
                  </Link>
                </div>
                <div className="viewbt">
                  <Link to="/view-lost-items">
                    <button className="view-lost-items-button"> View Items </button>
                  </Link>
                </div>
              </div>
          </div>
          <div className="box1-image">
            <img 
              src="/Pictures/login_phone.png" 
              alt="Login Phone" 
              className="img_login_phone" 
            />
          </div>
      </div>

      <div className="box2">
          <div className="text1-box2">
            <h2> Report a lost item </h2>
            <p> Use our form to report a lost item. We will help you try to recover it.</p>
          </div>
          <div className="text2-box2">
            <h2> Browse found items </h2>
            <p> Check the items that have been found. You may find your lost belongings. </p>
          </div>
          <div className="text3-box2">
            <h2> Contact assistance </h2>
            <p> Get in touch with our support team for any questions, assistance, or feedback. </p>
          </div>
      </div>
    </div>
</div>
  );
}

export default HomePageMain;