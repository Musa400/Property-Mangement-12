import React, { useState, useEffect } from 'react'
import { FaBars, FaHome, FaMoneyBill, FaMoneyBillWave, FaThList, FaUser, FaSignOutAlt, FaTh, FaChevronDown, FaChevronRight, FaTachometerAlt, FaChartLine, FaFileInvoiceDollar } from 'react-icons/fa'
import { NavLink, useNavigate } from 'react-router-dom'
import './sidebar.css'

const SideBar = ({ children }) => {
  const [isOpen, SetIsOpen] = useState(false)
  const [isFinancialOpen, setIsFinancialOpen] = useState(false)
  const toggle = () => SetIsOpen(!isOpen)
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      navigate('/login');
    }
  }, []);

  const handleLogout = () => {
    const confirmLogout = window.confirm('Are you sure you want to log out?');
    
    if (confirmLogout) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        localStorage.removeItem('user');
        
        console.log('Logged out successfully');
        navigate('/login');
      } catch (error) {
        console.error('Logout failed:', error);
        alert('An error occurred during logout. Please try again.');
      }
    }
  };

  const toggleFinancial = () => {
    setIsFinancialOpen(!isFinancialOpen);
  }

  const menuItem = [
    {
      path: "/dashboard",
      name: 'Dashboard',
      icon: <FaChartLine />
    },
    {
      path: "/properties",
      name: 'Property',
      icon: <FaThList />
    },
    {
      path: "/tenant-list",
      name: 'Tenant',
      icon: <FaUser />
    },
    {
      name: 'Financial',
      icon: <FaMoneyBill />,
      isDropdown: true,
      children: [
        {
          path: "/financial-dashboard",
          name: 'DashBoard',
          icon: <FaChartLine />
        },
        {
          path: "/financial-report",
          name: 'Report',
          icon: <FaFileInvoiceDollar />
        },
        // {
        //   path: "/financial-expenses",
        //   name: 'Expenses',
        //   icon: <FaMoneyBillWave />
        // },
        {
          path: "/financial-rent",
          name: 'Rent Payments',
          icon: <FaHome />
        },
        // {
        //   path: "/Rent-receipt-list",
        //   name: 'Rent Receipts',
        //   icon: <FaMoneyBill />
        // }
      ]
    }


  ]

  return (
    <div className='container'>
      <div style={{width: isOpen ? '250px' : '50px'}} className="sidebar">
        <div className="top_section">
          <h1 style={{display: isOpen ? 'block' : 'none'}} className="logo">Logo</h1>
          <div style={{marginLeft: isOpen ? '50px' : '0px'}} className="bars">
            <FaBars onClick={toggle} />
          </div>
        </div>
        <div className="menu-items">
          {menuItem.map((item, index) => (
            item.isDropdown ? (
              <div 
                key={index} 
                className={`dropdown-menu ${isFinancialOpen ? 'open' : ''}`}
              >
                <div 
                  className='link dropdown-toggle' 
                  onClick={toggleFinancial}
                  style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
                >
                  <div className="icon">{item.icon}</div>
                  <div 
                    style={{
                      display: isOpen ? 'block' : 'none', 
                      marginLeft: '10px', 
                      flexGrow: 1
                    }}
                  >
                    {item.name}
                  </div>
                  <div 
                    style={{
                      display: isOpen ? 'block' : 'none', 
                      marginLeft: 'auto'
                    }}
                  >
                    {isFinancialOpen ? <FaChevronDown /> : <FaChevronRight />}
                  </div>
                </div>
                {isFinancialOpen && isOpen && (
                  <div className="dropdown-content">
                    {item.children.map((child, childIndex) => (
                      <NavLink 
                        to={child.path} 
                        key={childIndex} 
                        className='link sub-link' 
                        activeclassName='active'
                      >
                        <div className="icon">{child.icon}</div>
                        <div className="link_text">{child.name}</div>
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <NavLink 
                to={item.path} 
                key={index} 
                className='link' 
                activeclassName='active'
              >
                <div className="icon">{item.icon}</div>
                <div style={{display: isOpen ? 'block' : 'none'}} className="link_text">{item.name}</div>
              </NavLink>
            )
          ))}
          {/* <div 
            className='link logout' 
            onClick={handleLogout}
            style={{cursor: 'pointer'}}
          >
            <div className="icon"><FaSignOutAlt /></div>
            <div style={{display: isOpen ? 'block' : 'none'}} className="link_text">Logout</div>
          </div> */}
        </div>
      </div>
      <main>{children}</main>
    </div>
  )
}

export default SideBar