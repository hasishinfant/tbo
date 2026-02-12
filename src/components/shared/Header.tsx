// Header component
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <header className="header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/')}>
          <span className="logo-icon">🌍</span>
          <span className="logo-text">TravelSphere</span>
        </div>
        <nav className="nav">
          <button 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button 
            className={`nav-link ${location.pathname === '/plan-trip' ? 'active' : ''}`}
            onClick={() => navigate('/plan-trip')}
          >
            Plan Trip
          </button>
          <button 
            className={`nav-link ${location.pathname.includes('/emergency') ? 'active' : ''}`}
            onClick={() => navigate('/emergency-support')}
          >
            Emergency
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;