import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import {useEffect} from 'react'
import Login from './pages/login';
import Home from './pages/home-page';
import HomePage from './pages/home-page-main';
import About from './pages/about-page';
import Contact from './pages/contact-page';
import News from './pages/news-page';
import ForgotPassword from './pages/forgot-password';
import Register from './pages/register'
import ReportItem from './pages/report-lost-item';
import ViewItems from './pages/view-lost-items';


function App(){
  return(
    <Router>
      <Routes>
      {/* Redirect root to home page */}
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


        {/* 404 Page not found */}
        <Route path="*" element={<Navigate to ="/home-page" replace />} />
      </Routes>
    </Router>

  );


function App() {
  useEffect(() => {
    // Track user IP when app loads
    fetch('http://localhost:5000/api/track-ip')
      .then(res => res.json())
      .then(data => {
        console.log('✓ User tracked:', data);
      })
      .catch(err => console.error('Error:', err));
  }, []);

  return (
    <div className="App">
      {/* Your existing content */}
    </div>
  );

}}

export default App;
