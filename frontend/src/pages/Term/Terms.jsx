import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaArrowLeft, 
  FaClipboardList, 
  FaHandshake, 
  FaBalanceScale, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import './Term.css';

function Terms() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const termsSections = [
    {
      icon: <FaClipboardList />,
      title: "Service Agreement",
      description: "By using PropertyPro, you agree to abide by our terms and conditions."
    },
    {
      icon: <FaHandshake />,
      title: "User Responsibilities",
      description: "Users must provide accurate information and use the platform responsibly."
    },
    {
      icon: <FaBalanceScale />,
      title: "Legal Compliance",
      description: "All users must comply with local and international laws."
    }
  ];

  return (
    <div className="terms-container">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft /> Back
      </button>

      <section className="terms-hero">
        <div className="terms-hero-content">
          <h1>Terms of Service</h1>
          <p>Understanding Your Rights and Responsibilities</p>
        </div>
      </section>

      <section className="terms-overview">
        <h2>Welcome to PropertyPro</h2>
        <p>
          These Terms of Service govern your use of our platform and outline 
          the agreement between you and PropertyPro.
        </p>
      </section>

      <section className="terms-key-points">
        <h2>Key Terms</h2>
        <div className="terms-grid">
          {termsSections.map((section, index) => (
            <div key={index} className="terms-card">
              <div className="terms-icon">{section.icon}</div>
              <h3>{section.title}</h3>
              <p>{section.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="terms-details">
        <h2>Detailed Terms</h2>
        
        <div className="terms-section">
          <h3>1. User Account</h3>
          <ul>
            <li>You must provide accurate and current information</li>
            <li>You are responsible for maintaining account confidentiality</li>
            <li>You agree to accept responsibility for all activities under your account</li>
          </ul>
        </div>

        <div className="terms-section">
          <h3>2. Property Listings</h3>
          <ul>
            <li>Users must provide accurate property information</li>
            <li>PropertyPro reserves the right to remove misleading listings</li>
            <li>Commercial use of listings requires explicit permission</li>
          </ul>
        </div>

        <div className="terms-section">
          <h3>3. Limitation of Liability</h3>
          <ul>
            <li>PropertyPro is not liable for transactions between users</li>
            <li>We do not guarantee the accuracy of all listings</li>
            <li>Users engage in transactions at their own risk</li>
          </ul>
        </div>
      </section>

      <section className="terms-warning">
        <div className="warning-icon">
          <FaExclamationTriangle />
        </div>
        <h3>Important Notice</h3>
        <p>
          Violation of these terms may result in account suspension 
          or termination without prior notice.
        </p>
      </section>

      <section className="terms-contact">
        <h2>Questions?</h2>
        <p>
          If you have any questions about our Terms of Service, 
          please contact us at support@propertypro.com
        </p>
      </section>
    </div>
  );
}

export default Terms;