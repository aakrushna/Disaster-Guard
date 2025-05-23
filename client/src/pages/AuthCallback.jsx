import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthPages.css';

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(location.search);
      const token = params.get('token');

      if (token) {
        try {
          // Store the token
          localStorage.setItem('token', token);
          
          // Get user data
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.success) {
              localStorage.setItem('user', JSON.stringify(data.user));
              // Redirect to the page they were trying to access or home
              const from = location.state?.from?.pathname || '/';
              navigate(from, { replace: true });
            }
          }
        } catch (error) {
          console.error('Auth callback error:', error);
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' }
          });
        }
      } else {
        navigate('/login', { 
          state: { error: 'No authentication token received.' }
        });
      }
    };

    handleCallback();
  }, [navigate, location, login]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Completing Authentication</h2>
          <p>Please wait while we complete your login...</p>
        </div>
        <div className="auth-loading">
          <i className="fas fa-spinner fa-spin"></i>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback; 