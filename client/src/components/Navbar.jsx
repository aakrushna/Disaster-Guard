import { useState, useMemo } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { currentUser, logout, isLoggedIn, isAdmin } = useAuth();
  
  // Use useMemo to avoid repeated calls during rendering
  const isUserLoggedIn = useMemo(() => isLoggedIn(), [isLoggedIn]);
  const isUserAdmin = useMemo(() => isAdmin(), [isAdmin, currentUser]);

  // Define styles for links
  const linkStyle = {
    color: '#ffffff' // White color
  };

  const activeLinkStyle = {
    color: '#f8673a' // Orange color for active link
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Function to check if the link is active
  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  // Get user's name from currentUser
  const getUserName = () => {
    if (!currentUser) return '';
    return currentUser.fullName || currentUser.email.split('@')[0];
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <i className="fas fa-shield-alt"></i>
          <span>DisasterGuard</span>
        </Link>

        <div className="menu-icon" onClick={toggleMenu}>
          <i className={isOpen ? 'fas fa-times' : 'fas fa-bars'}></i>
        </div>

        <ul className={isOpen ? 'nav-menu active' : 'nav-menu'}>
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/')}`} 
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/' ? activeLinkStyle : linkStyle}
            >
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/disasters" 
              className={`nav-link ${isActive('/disasters')}`} 
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/disasters' ? activeLinkStyle : linkStyle}
            >
              Disasters
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/preparedness" 
              className={`nav-link ${isActive('/preparedness')}`} 
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/preparedness' ? activeLinkStyle : linkStyle}
            >
              Preparedness
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/maps" 
              className={`nav-link ${isActive('/maps')}`} 
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/maps' ? activeLinkStyle : linkStyle}
            >
              Maps
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/contact" 
              className={`nav-link ${isActive('/contact')}`} 
              onClick={() => setIsOpen(false)}
              style={location.pathname === '/contact' ? activeLinkStyle : linkStyle}
            >
              Contact
            </Link>
          </li>
          
          {/* Mobile auth buttons - only visible in mobile menu */}
          <div className={`mobile-auth-buttons ${isUserAdmin ? 'with-admin' : ''}`}>
            {isUserLoggedIn ? (
              <>
                <div className="user-greeting">
                  <i className="fas fa-user-circle"></i>
                  <span>Hello, {getUserName()}</span>
                </div>
                {isUserAdmin && (
                  <Link 
                    to="/admin" 
                    className="auth-btn admin-btn"
                    onClick={() => setIsOpen(false)}
                  >
                    <i className="fas fa-user-shield"></i> Admin
                  </Link>
                )}
                <button 
                  className="auth-btn logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`auth-btn login-btn ${isActive('/login')}`}
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-sign-in-alt"></i> Login
                </Link>
                <Link 
                  to="/signup" 
                  className={`auth-btn signup-btn ${isActive('/signup')}`}
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-user-plus"></i> Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Inside the nav-menu ul, add an admin link that's conditional on the user role */}
          {isUserLoggedIn && isUserAdmin && (
            <li className="nav-item admin-link">
              <Link 
                to="/admin" 
                className={`nav-link ${isActive('/admin')}`} 
                onClick={() => setIsOpen(false)}
                style={location.pathname === '/admin' ? activeLinkStyle : linkStyle}
              >
                <i className="fas fa-user-shield"></i> Admin
              </Link>
            </li>
          )}
        </ul>

        {/* Desktop auth buttons - hidden on mobile */}
        <div className={`nav-auth-buttons ${isUserAdmin ? 'with-admin' : ''}`}>
          {isUserLoggedIn ? (
            <>
              <div className="user-greeting">
                <i className="fas fa-user-circle"></i>
                <span>Hello, {getUserName()}</span>
              </div>
              {isUserAdmin && (
                <Link 
                  to="/admin" 
                  className="auth-btn admin-btn"
                  onClick={() => setIsOpen(false)}
                >
                  <i className="fas fa-user-shield"></i> Admin
                </Link>
              )}
              <button 
                className="auth-btn logout-btn"
                onClick={handleLogout}
              >
                <i className="fas fa-sign-out-alt"></i> Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`auth-btn login-btn ${isActive('/login')}`}
                onClick={() => setIsOpen(false)}
              >
                <i className="fas fa-sign-in-alt"></i> Login
              </Link>
              <Link 
                to="/signup" 
                className={`auth-btn signup-btn ${isActive('/signup')}`}
                onClick={() => setIsOpen(false)}
              >
                <i className="fas fa-user-plus"></i> Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 