import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaSearch, 
  FaChartLine, 
  FaBuilding,
  FaClipboardList,
  FaUsers,
  FaKey,
  FaChartPie,
  FaBars,
  FaTimes,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt
} from 'react-icons/fa';
import './Home.css';

function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const managementCards = [
    {
      icon: <FaBuilding />,
      title: 'Property Management',
      description: 'Manage and track all your properties efficiently',
      // link: '/properties',
      color: '#2962ff'
    },
    {
      icon: <FaClipboardList />,
      title: 'Lease Management',
      description: 'Handle lease agreements and track rental status',
      // link: '/leases',
      color: '#ff6d00'
    },
    {
      icon: <FaUsers />,
      title: 'Tenant Management',
      description: 'Manage tenant information and communications',
      // link: '/tenants',
      color: '#2e7d32'
    },
    {
      icon: <FaChartPie />,
      title: 'Financial Insights',
      description: 'Analyze property performance and revenue',
      // link: '/dashboard',
      color: '#d50000'
    }
  ];

  return (
    <div className="home-container">
      <nav className="home-navbar">
        <div className="navbar-brand">
          <Link to="/" className="logo">PropertyPro</Link>
        </div>
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/login" className="navbar-item login-btn">Login</Link>
          <Link to="/register" className="navbar-item register-btn">Register</Link>
        </div>
        <div className="navbar-toggle" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
      </nav>

      <section className="management-section">
        <h2>Quick Access Management</h2>
        <div className="management-cards">
          {managementCards.map((card, index) => (
            <Link to={card.link} key={index} className="management-card" style={{borderTopColor: card.color}}>
              <div className="management-card-icon" style={{color: card.color}}>
                {card.icon}
              </div>
              <div className="management-card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>
              <div className="management-card-arrow"><div className="footer-section links">
                <h4>Quick Links</h4>
                <ul>
                  <li><Link to="/about">About</Link></li>
                  <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                  <li><Link to="/terms">Terms of Service</Link></li>
                </ul>
              </div>
                <FaKey />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="features-section">
        <div className="feature">
          <FaBuilding className="feature-icon" />
          <h3>Comprehensive Listings</h3>
          <p>Detailed property information at your fingertips</p>
        </div>
        <div className="feature">
          <FaChartLine className="feature-icon" />
          <h3>Market Insights</h3>
          <p>Real-time market trends and analytics</p>
        </div>
        <div className="feature">
          <FaHome className="feature-icon" />
          <h3>Easy Management</h3>
          <p>Simplify your property management workflow</p>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section about">
            <h3>PropertyPro</h3>
            <p>Simplifying property management with innovative technology and user-friendly solutions.</p>
            <div className="social-icons">
              <a href="#" className="social-icon"><FaFacebook /></a>
              <a href="#" className="social-icon"><FaTwitter /></a>
              <a href="#" className="social-icon"><FaLinkedin /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
            </div>
          </div>

          <div className="footer-section links">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section contact">
            <h4>Contact Us</h4>
            <div className="contact-item">
              <FaEnvelope className="contact-icon" />
              <span>Hayatkhantotakhil400@gmail.com</span>
            </div>
            <div className="contact-item">
              <FaPhone className="contact-icon" />
              <span>+93 777 88 3200</span>
            </div>
            <div className="contact-item">
              <FaMapMarkerAlt className="contact-icon" />
              <span>Kabul Arzan-Qemat, 3block, 4th street 28 number Home</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 PropertyPro. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;