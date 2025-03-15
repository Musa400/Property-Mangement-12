import React, { useState, useEffect } from 'react';
import UserTable from './UserTable';
import UserRoleCharts from './UserRoleCharts';
import { FaUserPlus, FaUsers, FaChartPie, FaSignInAlt, FaUserCircle } from 'react-icons/fa';
import './UserManagement.css';
import { useRolePermissions } from '../../hook/useRolePermissions';

// Make MOCK_USERS a mutable variable
let MOCK_USERS = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'Admin',
    status: 'Active',
    position: 'System Administrator',
    department: 'IT Management',
    contact: '+1 (555) 123-4567',
    lastLogin: new Date().toISOString(),
    permissions: ['Full System Access']
  },
  {
    id: 2,
    name: 'Manager User',
    email: 'manager@example.com',
    password: 'manager123',
    role: 'Manager',
    status: 'Active',
    position: 'Property Manager',
    department: 'Operations',
    contact: '+1 (555) 987-6543',
    lastLogin: new Date().toISOString(),
    permissions: ['Property Oversight', 'Tenant Management']
  },
  {
    id: 3,
    name: 'Tenant User',
    email: 'tenant@example.com',
    password: 'tenant123',
    role: 'Tenant',
    status: 'Active',
    position: 'Resident',
    department: 'N/A',
    contact: '+1 (555) 246-8101',
    lastLogin: new Date().toISOString(),
    permissions: ['Basic Access']
  }
];

const LoginForm = ({ onLogin }) => {
  const [loginInput, setLoginInput] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Login Attempt:', {
      loginInput,
      password,
      mockUsers: MOCK_USERS
    });

    // Detailed matching with case-insensitive comparison
    const user = MOCK_USERS.find(u => {
      const emailMatch = u.email.toLowerCase() === loginInput.toLowerCase();
      const nameMatch = u.name.toLowerCase() === loginInput.toLowerCase();
      const passwordMatch = u.password === password;

      console.log('User Check:', {
        user: u,
        emailMatch,
        nameMatch,
        passwordMatch
      });

      return (emailMatch || nameMatch) && passwordMatch;
    });

    if (user) {
      console.log('Login Successful:', user);
      onLogin(user);
    } else {
      console.log('Login Failed');
      setError('Invalid login credentials. Try registering first.');
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          placeholder="Email or Name"
          value={loginInput}
          onChange={(e) => {
            setLoginInput(e.target.value);
            setError('');
          }}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          required
        />
        <button type="submit">
          <FaSignInAlt /> Login
        </button>
        
        <div className="login-hints">
          <p>No account? Register first!</p>
          <p>Existing users:</p>
          <p>Admin: admin@example.com / Admin User</p>
          <p>Manager: manager@example.com / Manager User</p>
          <p>Tenant: tenant@example.com / Tenant User</p>
        </div>
      </form>
    </div>
  );
};

const RegisterForm = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Tenant'
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Check if email already exists
    const emailExists = MOCK_USERS.some(u => u.email.toLowerCase() === formData.email.toLowerCase());
    if (emailExists) {
      setError('Email already registered');
      return;
    }

    // Create new user
    const newUser = {
      id: MOCK_USERS.length + 1,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role,
      status: 'Active'
    };
    MOCK_USERS.push(newUser);
    onRegister(newUser);
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="Tenant">Tenant</option>
          <option value="Manager">Manager</option>
        </select>
        <button type="submit">
          <FaUserCircle /> Register
        </button>
      </form>
    </div>
  );
};

const UserManagement = () => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(MOCK_USERS);
  const [filteredUsers, setFilteredUsers] = useState(MOCK_USERS);
  const [roleFilter, setRoleFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { hasPermission } = useRolePermissions(currentUser?.role || 'Tenant');

  const handleLogin = (user) => {
    setCurrentUser(user);
    setUsers(MOCK_USERS);
    setFilteredUsers(MOCK_USERS);
  };

  const handleRegister = (user) => {
    setCurrentUser(user);
    setUsers(MOCK_USERS);
    setFilteredUsers(MOCK_USERS);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUsers([]);
    setFilteredUsers([]);
  };

  const handleFilter = (role) => {
    setRoleFilter(role);
    const filtered = role === 'All' 
      ? users 
      : users.filter(user => user.role === role);
    setFilteredUsers(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      user.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const handleAddUser = () => {
    setCurrentUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    try {
      const updatedUsers = MOCK_USERS.filter(user => user.id !== userId);
      MOCK_USERS = updatedUsers;
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (currentUser) {
        // Update existing user
        const updatedUsers = MOCK_USERS.map(user => {
          if (user.id === currentUser.id) {
            return userData;
          }
          return user;
        });
        MOCK_USERS = updatedUsers;
        setUsers(updatedUsers);
        setFilteredUsers(updatedUsers);
      } else {
        // Create new user
        const newUser = {
          id: MOCK_USERS.length + 1,
          ...userData,
          status: 'Active'
        };
        MOCK_USERS.push(newUser);
        setUsers(MOCK_USERS);
        setFilteredUsers(MOCK_USERS);
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleResetPassword = async (userId) => {
    try {
      alert('Password reset link sent to user');
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  if (!currentUser) {
    return (
      <div className="auth-container">
        {authMode === 'login' ? (
          <LoginForm onLogin={handleLogin} />
        ) : (
          <RegisterForm onRegister={handleRegister} />
        )}
        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>
              Don't have an account? 
              <button onClick={() => setAuthMode('register')}>Register</button>
            </p>
          ) : (
            <p>
              Already have an account? 
              <button onClick={() => setAuthMode('login')}>Login</button>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="user-management-container">
      <header>
        <h1>User Management</h1>
        <div className="user-info">
          <span>Welcome, {currentUser.name}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
        <div className="user-stats">
          <div className="stat-card">
            <FaUsers /> Total Users: {users.length}
          </div>
          <div className="stat-card">
            <FaChartPie /> Active Users: {users.filter(u => u.status === 'Active').length}
          </div>
        </div>
      </header>

      <div className="user-management-content">
        {(hasPermission('USER_MANAGEMENT', 'view') || currentUser.role === 'Tenant') ? (
          <>
            <div className="filters">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
              <select 
                value={roleFilter} 
                onChange={(e) => handleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Tenant">Tenant</option>
              </select>
              {hasPermission('USER_MANAGEMENT', 'create') && (
                <button className="add-user-btn" onClick={handleAddUser}>
                  <FaUserPlus /> Add New User
                </button>
              )}
            </div>

            <div className="user-management-grid">
              <UserTable 
                users={filteredUsers} 
                onEditUser={handleEditUser}
                onDeleteUser={handleDeleteUser}
                onResetPassword={handleResetPassword}
              />
              <UserRoleCharts users={users} />
            </div>
          </>
        ) : (
          <div className="unauthorized-message">
            You do not have permission to view user management.
            Contact an administrator for access.
          </div>
        )}
      </div>

      {isModalOpen && (
        <UserModal 
          user={currentUser} 
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveUser}
        />
      )}
    </div>
  );
};

const UserModal = ({ user, onClose, onSave }) => {
  const [formData, setFormData] = useState(user ? { ...user } : {
    name: '',
    email: '',
    role: 'Tenant',
    position: '',
    status: 'Active'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="user-modal-overlay">
      <div className="user-modal">
        <h2>{user ? 'Edit User' : 'Add New User'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Tenant">Tenant</option>
          </select>
          <input
            type="text"
            name="position"
            placeholder="Position"
            value={formData.position}
            onChange={handleChange}
          />
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="modal-actions">
            <button type="submit">{user ? 'Update' : 'Add'} User</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserManagement;