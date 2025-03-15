import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaLock, FaEnvelope, FaUserTag } from 'react-icons/fa';
import rentPaymentService from '../../services/rentPaymentService';
import axios from 'axios';
import './Register.css';

const API_BASE_URL = 'http://localhost:5000/api';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate form data
      if (!formData.username || !formData.email || !formData.password || !formData.userType) {
        setError('Please fill in all fields');
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match!');
        return;
      }

      console.log('Starting registration process...');
      
      // Clear any existing tokens before registration
      localStorage.clear();
      sessionStorage.clear();
      
      // Create registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      };

      console.log('Sending registration request:', {
        url: `${API_BASE_URL}/auth/register`,
        data: { ...registrationData, password: '[HIDDEN]' }
      });
      
      const response = await axios.post(`${API_BASE_URL}/auth/register`, registrationData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('Registration response:', {
        status: response.status,
        statusText: response.statusText,
        data: {
          ...response.data,
          token: response.data.token ? 'TOKEN_EXISTS' : 'NO_TOKEN',
          user: response.data.user ? 'USER_DATA_EXISTS' : 'NO_USER_DATA'
        }
      });

      if (!response.data || !response.data.token || !response.data.user) {
        throw new Error('Invalid response from server');
      }

      // Initialize session with the registration token and user data
      console.log('Initializing session after registration...');
      await rentPaymentService.initializeSession(response.data.token, response.data.user);
      
      console.log('Session initialized successfully');
      console.log('Storage check:', {
        localStorage: {
          token: localStorage.getItem('token') ? 'Present' : 'Missing',
          user: localStorage.getItem('user') ? 'Present' : 'Missing'
        }
      });

      // Redirect based on user type
      const userType = response.data.user.userType;
      console.log('Registration successful, redirecting user type:', userType);
      
      // Use setTimeout to ensure state is updated before navigation
      setTimeout(() => {
        switch(userType) {
          case 'admin':
          case 'administrator':
            navigate('/dashboard', { replace: true });
            break;
          case 'tenant':
            navigate('/tenant-dashboard', { replace: true });
            break;
          default:
            navigate('/', { replace: true });
        }
      }, 100);

    } catch (error) {
      console.error('Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  };

  return (
    <div className="register-container">
      <div className="register-form-wrapper">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Create an Account</h2>
          <p>Join PropertyPro and manage your properties</p>
          
          <div className="form-group">
            <FaUser className="input-icon" />
            <input 
              type="text" 
              name="username"
              placeholder="Username" 
              value={formData.username}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <FaEnvelope className="input-icon" />
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
              className="user-type-select"
            >
              <option value="">Select User Type</option>
              <option value="admin">Admin</option>
              <option value="administrator">Administrator</option>
              <option value="tenant">Tenant</option>
            </select>
          </div>
          
          <div className="form-group">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              name="password"
              placeholder="Password" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              name="confirmPassword"
              placeholder="Confirm Password" 
              value={formData.confirmPassword}
              onChange={handleChange}
              required 
            />
          </div>
          
          <button type="submit" className="register-btn">Sign Up</button>
          
          <div className="login-link">
            Already have an account? 
            <Link to="/login"> Login</Link>
          </div>
          {error && <div className="error-message" style={{ color: 'red', marginTop: '10px' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Register;