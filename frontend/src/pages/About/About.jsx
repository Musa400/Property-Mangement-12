import React from 'react';
import { FaHome, FaUsers, FaChartLine, FaShieldAlt, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './About.css';

function About() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1); // Goes back to the previous page
  };

  const teamMembers = [
    {
      name: "Hayat Khan",
      role: "Founder & CEO",
      bio: "Passionate about revolutionizing property management through technology.",
      image: "https://via.placeholder.com/150"
    },
    {
      name: "Tech Team",
      role: "Development & Innovation",
      bio: "Dedicated to creating cutting-edge solutions for property management.",
      image: "https://via.placeholder.com/150"
    }
  ];

  const companyValues = [
    {
      icon: <FaHome />,
      title: "Property Excellence",
      description: "Delivering top-notch property management solutions."
    },
    {
      icon: <FaUsers />,
      title: "Customer-Centric",
      description: "Putting our clients' needs at the heart of everything we do."
    },
    {
      icon: <FaChartLine />,
      title: "Continuous Innovation",
      description: "Constantly evolving to provide the best technological solutions."
    },
    {
      icon: <FaShieldAlt />,
      title: "Reliability & Trust",
      description: "Building trust through transparent and secure services."
    }
  ];

  return (
    <div className="about-container">
      <button className="back-button" onClick={handleGoBack}>
        <FaArrowLeft /> Back
      </button>

      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About PropertyPro</h1>
          <p>Transforming Property Management with Innovative Technology</p>
        </div>
      </section>

      <section className="about-mission">
        <div className="mission-content">
          <h2>Our Mission</h2>
          <p>
            At PropertyPro, we are dedicated to simplifying property management 
            through innovative technology. Our goal is to empower property owners, 
            managers, and tenants with seamless, efficient, and user-friendly solutions.
          </p>
        </div>
      </section>

      <section className="company-values">
        <h2>Our Core Values</h2>
        <div className="values-grid">
          {companyValues.map((value, index) => (
            <div key={index} className="value-card">
              <div className="value-icon">{value.icon}</div>
              <h3>{value.title}</h3>
              <p>{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="team-section">
        <h2>Meet Our Team</h2>
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img src={member.image} alt={member.name} className="member-image" />
              <h3>{member.name}</h3>
              <p className="member-role">{member.role}</p>
              <p className="member-bio">{member.bio}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default About;