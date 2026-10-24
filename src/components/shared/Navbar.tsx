import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { User, ChevronDown, CheckCircle2, LogOut, MessageSquare, Menu, X, Sparkles } from "lucide-react";
import "./Navbar.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
      } else {
        setUser(null);
      }
    };

    updateUser();
    window.addEventListener('storage', updateUser);
    window.addEventListener('auth-change', updateUser);

    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('auth-change', updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('auth-change'));
    setUser(null);
    setShowDropdown(false);
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Plan Trip', path: '/plan-trip' },
    { name: 'Book Hotels', path: '/book-hotels' },
    { name: 'My Trips', path: '/itinerary' },
    { name: 'Emergency', path: '/emergency-support' },
  ];

  const isCurrent = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="navbar-wrapper">
      <div className="navbar-pill">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-pill">
            <span className="brand-icon">🌿</span>
          </div>
          <span className="brand-name">
            Travel<span className="brand-accent">Sphere</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="nav-links-capsule" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`nav-pill-item ${isCurrent(link.path) ? 'active' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA & Profile */}
        <div className="navbar-actions">
          <div 
            className="user-profile-pill"
            onClick={() => setShowDropdown(!showDropdown)}
            title="User Profile"
          >
            <div className="avatar-circle">
              <User size={15} />
            </div>
            <span className="user-display-name">{user?.name ? user.name.split(' ')[0] : 'Guest'}</span>
            <ChevronDown size={14} className={`dropdown-chevron ${showDropdown ? 'open' : ''}`} />

            {showDropdown && (
              <div className="navbar-dropdown-menu">
                <div className="dropdown-user-info">
                  <p className="dropdown-user-name">{user?.name || 'Guest Traveler'}</p>
                  <p className="dropdown-user-email">{user?.email || 'demo@travelsphere.com'}</p>
                </div>
                <div className="dropdown-divider" />
                <button 
                  type="button" 
                  className="dropdown-menu-link" 
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(false); navigate('/itinerary'); }}
                >
                  <CheckCircle2 size={16} />
                  <span>My Bookings</span>
                </button>
                <button 
                  type="button" 
                  className="dropdown-menu-link" 
                  onClick={(e) => { e.stopPropagation(); setShowDropdown(false); navigate('/chat'); }}
                >
                  <MessageSquare size={16} />
                  <span>AI Travel Chat</span>
                </button>
                <div className="dropdown-divider" />
                <button 
                  type="button" 
                  className="dropdown-menu-link logout-link" 
                  onClick={(e) => { e.stopPropagation(); handleLogout(); }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          <button 
            type="button"
            className="btn-plan-trip-pill"
            onClick={() => navigate('/plan-trip')}
          >
            <Sparkles size={15} />
            <span>Plan Trip</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button 
            type="button"
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-nav-drawer">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`mobile-nav-link ${isCurrent(link.path) ? 'active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="mobile-drawer-footer">
            <button
              type="button"
              className="btn-pill-green full-width"
              onClick={() => { setMobileMenuOpen(false); navigate('/plan-trip'); }}
            >
              Plan Your Trip Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
