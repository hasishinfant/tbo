import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronDown, CheckCircle2, LogOut } from "lucide-react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <header className="mmt-navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <a href="/" className="mmt-logo">
            <span className="logo-icon">✈️</span>
            <span className="logo-text">travel<span className="logo-accent">sphere</span></span>
          </a>
        </div>

        <nav className="navbar-right">
          <div className="nav-item" onClick={() => navigate('/itinerary')}>
            <span className="nav-icon-wrapper">
              <span className="offer-icon">%</span>
            </span>
            <div className="nav-text">
              <span className="nav-title">Super Offers</span>
              <span className="nav-subtitle">Explore great deals</span>
            </div>
          </div>

          <div className="nav-item" onClick={() => navigate('/itinerary')}>
            <span className="nav-icon-wrapper">
              <CheckCircle2 size={20} className="text-secondary" />
            </span>
            <div className="nav-text">
              <span className="nav-title">My Trips</span>
              <span className="nav-subtitle">Manage your bookings</span>
            </div>
          </div>

          <div 
            className="nav-item login-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            style={{ position: 'relative', cursor: 'pointer' }}
          >
            <div className="login-icon-bg">
              <User size={16} />
            </div>
            <div className="nav-text">
              <span className="nav-title">{user?.name || 'Guest'}</span>
              <span className="nav-subtitle">
                {user?.email || 'Not logged in'} <ChevronDown size={12} />
              </span>
            </div>
            
            {showDropdown && (
              <div className="user-dropdown">
                <div className="dropdown-item" onClick={() => navigate('/itinerary')}>
                  <CheckCircle2 size={16} />
                  <span>My Trips</span>
                </div>
                <div className="dropdown-item" onClick={handleLogout}>
                  <LogOut size={16} />
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
