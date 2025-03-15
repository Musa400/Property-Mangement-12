import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import rentPaymentService from '../../services/rentPaymentService';
import './Login.css';

const API_BASE_URL = 'http://localhost:5000/api';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      console.group('Login Process');
      console.log('Starting login attempt...');
      console.log('Email:', email);
      console.log('API URL:', `${API_BASE_URL}/auth/login`);

      // First, log the request configuration
      console.log('Request Configuration:', {
        url: `${API_BASE_URL}/auth/login`,
        method: 'POST',
        withCredentials: true,
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // Log the full response (excluding sensitive data)
      console.log('Raw Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          ...response.data,
          token: response.data.token ? 'TOKEN_EXISTS' : 'NO_TOKEN'
        }
      });

      // Validate response data
      if (!response.data) {
        console.error('No response data received');
        throw new Error('No response data received from server');
      }

      if (!response.data.token) {
        console.error('No token in response');
        throw new Error('No authentication token received');
      }

      if (!response.data.user) {
        console.error('No user data in response');
        throw new Error('No user data received');
      }

      console.log('Response validation passed');

      // Store token and user data in both localStorage and sessionStorage
      const token = response.data.token;
      const userData = response.data.user;

      // Store in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));

      // Also store in sessionStorage as backup
      sessionStorage.setItem('token', token);
      sessionStorage.setItem('user', JSON.stringify(userData));

      // Get user type for redirection
      const userType = userData.userType;
      console.log('Login successful, redirecting user type:', userType);
      
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
      console.group('Login Error Details');
      console.error('Login attempt failed');
      console.error('Error object:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
      
      if (error.response) {
        console.error('Server response error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      console.groupEnd();

      setError(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-wrapper">
        <form onSubmit={handleLogin} className="login-form">
          <h2>Welcome Back</h2>
          <p>Login to manage your properties</p>
          
          <div className="form-group">
            <FaEnvelope className="input-icon" />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          
          <div className="form-group">
            <FaLock className="input-icon" />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          
          <div className="forgot-password">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
          
          <button type="submit" className="login-btn">Login</button>
          
          <div className="register-link">
            Don't have an account? 
            <Link to="/register"> Sign Up</Link>
          </div>
          {error && <div style={{ color: 'red' }}>{error}</div>}
        </form>
      </div>
    </div>
  );
}

export default Login;