import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaSignOutAlt } from 'react-icons/fa';
import './Header.css';

const Header = ({ onLogout, children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Function to get page title based on current route
  const getPageTitle = () => {
    const pathToTitleMap = {
      '/dashboard': 'Welcome To Dashboard Page',
      '/properties': 'د ملکیتونو پاڼې ته ښه راغلاست',
      '/add-property': 'Add Property',
      '/leases': 'Lease Agreements',
      '/tenant-list': 'د کرایه دار پاڼې ته ښه راغلاست',
      '/add-tenant': 'Add Tenant',
      '/maintenance-requests': 'Maintenance Requests',
      '/add-maintenance-request': 'New Maintenance Request'
    };
    return pathToTitleMap[location.pathname] || 'PropertyPro';
  };

  // Logout Handler
  const handleLogout = () => {
    // Show confirmation dialog
    const confirmLogout = window.confirm('Are you sure you want to logout?');
    if (confirmLogout) {
      // Clear both localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Call parent logout handler
      if (onLogout) {
        onLogout();
      }
      
      // Navigate to login page
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="global-header">
      <div className="header-content">
        {/* Page Title */}
        <h1 className="header-title">{getPageTitle()}</h1>
        
        {/* Logout Container */}
        <div className="header-actions">
          {/* Logout Button */}
          <button 
            onClick={handleLogout} 
            className="logout-btn"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>
      {children}
    </header>
  );
};

export default Header;