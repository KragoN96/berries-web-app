import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/CSS/home_page.css';

function HomePage() {
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
            <div className="contactbt">
                <Link to="/contact-page">
              <button className="contact-button">Contact</button>
            </Link>
          </div>
        
            <div className="aboutbt">
            <Link to="/about-page">
                <button className="about-button"> About Us </button>
            </Link>
                </div>
        </div>
      </div>
      
      <div className="welcome-message">
        <div className="motto-message">
            <h2> Welcome to Berries!</h2>
            <h3>You lost it, We found it!</h3>
        </div>
        <div className="connect-message">
          <h3>Connect with us!</h3>
        </div>
      </div>   
      
      <div className="image">
        <img 
          src="/Pictures/login_phone.png" 
          alt="Login Phone" 
          className="img_login_phone" 
        />
      </div>
    </div>
  );
}

export default HomePage;