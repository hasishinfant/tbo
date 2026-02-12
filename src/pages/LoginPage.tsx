import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isLogin && !formData.name) {
      setError('Please enter your name');
      return;
    }

    // Mock authentication
    const userData = {
      email: formData.email,
      name: isLogin ? formData.email.split('@')[0] : formData.name,
      loggedIn: true,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem('user', JSON.stringify(userData));
    navigate('/');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDemoLogin = () => {
    const demoUser = {
      email: 'demo@travelsphere.com',
      name: 'Demo Traveler',
      loggedIn: true,
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('user', JSON.stringify(demoUser));
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-decoration">
        <div className="circle-1"></div>
        <div className="circle-2"></div>
      </div>
      
      <div className="login-container">
        {/* Left Side - Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="brand-badge">
              <span>✈️</span>
            </div>
            <h1>TravelSphere</h1>
            <p className="tagline">Explore the world with confidence.</p>
            
            <div className="features-list">
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} /></div>
                <span>AI-Powered Itineraries</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} /></div>
                <span>Exclusive Deals</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} /></div>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
          <div className="visual-overlay"></div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Enter your details to access your account' : 'Start your journey with us today'}</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="input-group">
                <label>Full Name</label>
                <div className="input-field">
                  <User size={18} className="field-icon" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label>Email Address</label>
              <div className="input-field">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-field">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-actions">
              {isLogin && (
                <div className="remember-me">
                  <input type="checkbox" id="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
              )}
              {isLogin && <a href="#" className="forgot-link">Forgot Password?</a>}
            </div>

            <button type="submit" className="submit-btn">
              {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <button type="button" className="demo-btn" onClick={handleDemoLogin}>
              Continue as Guest (Demo)
            </button>
          </form>

          <div className="auth-switch">
             <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'Create Account' : 'Sign In'}
              </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
