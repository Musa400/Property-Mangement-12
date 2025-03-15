import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaLock, FaShieldAlt, FaUserSecret } from 'react-icons/fa';
import './privacy.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const privacyPolicySections = [
    {
      icon: <FaLock />,
      title: "Information Collection",
      description: "We collect personal information that you voluntarily provide to us when registering, using our services, or communicating with us."
    },
    {
      icon: <FaShieldAlt />,
      title: "Data Protection",
      description: "We implement industry-standard security measures to protect your personal information from unauthorized access, disclosure, or alteration."
    },
    {
      icon: <FaUserSecret />,
      title: "User Privacy Rights",
      description: "You have the right to access, correct, or delete your personal information. Contact us to exercise these rights."
    }
  ];

  return (
    <div className="privacy-policy-container">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft /> Back
      </button>

      <section className="privacy-hero">
        <div className="privacy-hero-content">
          <h1>Privacy Policy</h1>
          <p>Your Privacy and Data Protection are Our Top Priority</p>
        </div>
      </section>

      <section className="privacy-overview">
        <h2>Our Commitment to Privacy</h2>
        <p>
          At PropertyPro, we are committed to protecting your personal information 
          and maintaining the highest standards of data privacy and security.
        </p>
      </section>

      <section className="privacy-key-points">
        <h2>Key Privacy Principles</h2>
        <div className="privacy-grid">
          {privacyPolicySections.map((section, index) => (
            <div key={index} className="privacy-card">
              <div className="privacy-icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="privacy-details">
        <h2>Detailed Privacy Information</h2>
        
        <div className="privacy-section">
          <h3>1. Information We Collect</h3>
          <ul>
            <li>Personal identification information</li>
            <li>Contact details</li>
            <li>Property-related information</li>
            <li>Usage and interaction data</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h3>2. How We Use Your Information</h3>
          <ul>
            <li>Provide and improve our services</li>
            <li>Communicate with you</li>
            <li>Process transactions</li>
            <li>Enhance user experience</li>
          </ul>
        </div>

        <div className="privacy-section">
          <h3>3. Data Protection Measures</h3>
          <ul>
            <li>Encryption of sensitive data</li>
            <li>Regular security audits</li>
            <li>Access controls</li>
            <li>Compliance with data protection regulations</li>
          </ul>
        </div>
      </section>

      <section className="privacy-contact">
        <h2>Contact Us</h2>
        <p>
          If you have any questions about our Privacy Policy, 
          please contact us at support@propertypro.com
        </p>
      </section>
    </div>
  );
}

export default PrivacyPolicy;