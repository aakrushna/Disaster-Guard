import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

// Create the authentication context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provider component that wraps the app and makes auth object available to any child component that calls useAuth()
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in from localStorage on initial load
  useEffect(() => {
    // Clear any existing login data on startup
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setLoading(false);
    
    /* Comment out the previous auto-login functionality
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      setCurrentUser(JSON.parse(user));
      
      // Verify token is still valid by fetching current user
      authAPI.getCurrentUser()
        .then(response => {
          if (response.data.success) {
            setCurrentUser(response.data.user);
          } else {
            // Token is invalid, log out
            logout();
          }
        })
        .catch(() => {
          // Error fetching user, token might be expired
          logout();
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    */
  }, []);

  // Login function with session option
  const login = async (credentials, rememberMe = false) => {
    try {
      setError(null);
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { user, token } = response.data;
        
        // Only store in localStorage if "remember me" is checked
        // otherwise use sessionStorage for session-only login
        if (rememberMe) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Session storage is cleared when the browser is closed
          sessionStorage.setItem('token', token);
          sessionStorage.setItem('user', JSON.stringify(user));
        }
        
        setCurrentUser(user);
        return { success: true };
      } else {
        setError(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      console.log('Attempting to register with data:', userData);
      
      const response = await authAPI.register(userData);
      console.log('Registration response:', response);
      
      if (response.data.success) {
        const { user, token } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setCurrentUser(user);
        return { success: true };
      } else {
        const errorMsg = response.data.message || 'Registration failed';
        console.error('Registration failed:', errorMsg);
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Registration failed. Please try again.';
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        message = err.response.data.message || message;
      }
      
      setError(message);
      return { success: false, message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setCurrentUser(null);
  };

  // Check if user is logged in
  const isLoggedIn = () => {
    if (currentUser) return true;
    
    // Check both localStorage and sessionStorage
    const localToken = localStorage.getItem('token');
    const sessionToken = sessionStorage.getItem('token');
    const localUser = localStorage.getItem('user');
    const sessionUser = sessionStorage.getItem('user');
    
    if ((localToken && localUser) || (sessionToken && sessionUser)) {
      // If we have user data but currentUser isn't set, set it now
      if (!currentUser) {
        try {
          setCurrentUser(JSON.parse(localUser || sessionUser));
        } catch (e) {
          // Invalid user data
          logout();
          return false;
        }
      }
      return true;
    }
    
    return false;
  };

  // Check if user is admin
  const isAdmin = () => {
    return currentUser && currentUser.role === 'admin';
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      setError(null);
      const response = await authAPI.updateProfile(userData);
      
      if (response.data.success) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setCurrentUser(updatedUser);
        return { success: true };
      } else {
        setError(response.data.message || 'Profile update failed');
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Profile update failed. Please try again.';
      setError(message);
      return { success: false, message };
    }
  };

  // Value object that will be passed to any consuming components
  const value = {
    currentUser,
    login,
    register,
    logout,
    isLoggedIn,
    isAdmin,
    updateProfile,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 