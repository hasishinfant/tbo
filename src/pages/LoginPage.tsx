import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Check, Eye, EyeOff, Sparkles, Compass } from 'lucide-react';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
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
      name: isLogin ? (formData.email.split('@')[0] || 'Traveler') : formData.name,
      loggedIn: true,
      loginTime: new Date().toISOString(),
    };

    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('auth-change'));
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
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  return (
    <div className="login-page">
      <div className="login-decoration" aria-hidden="true">
        <div className="circle-1"></div>
        <div className="circle-2"></div>
      </div>
      
      <div className="login-container">
        {/* Left Side - Visual */}
        <div className="login-visual">
          <div className="visual-content">
            <div className="brand-badge">
              <span className="brand-badge-icon">✈️</span>
            </div>
            <h1>TravelSphere</h1>
            <p className="tagline">Explore the world with AI-powered confidence.</p>
            
            <div className="features-list">
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} strokeWidth={2.5} /></div>
                <span>AI-Powered Smart Itineraries</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} strokeWidth={2.5} /></div>
                <span>Curated Flight & Hotel Deals</span>
              </div>
              <div className="feature-row">
                <div className="feature-icon-box"><Check size={16} strokeWidth={2.5} /></div>
                <span>24/7 Intelligent Travel Companion</span>
              </div>
            </div>

            <div className="trust-badge">
              <Compass size={16} className="trust-icon" />
              <span>Personalized recommendations in real-time</span>
            </div>
          </div>
          <div className="visual-overlay" aria-hidden="true"></div>
        </div>

        {/* Right Side - Form */}
        <div className="login-form-wrapper">
          <div className="form-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Enter your credentials to access your trips' : 'Start your journey with us today'}</p>
          </div>

          {error && (
            <div className="error-message" role="alert">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            {!isLogin && (
              <div className="input-group">
                <label htmlFor="login-name">Full Name</label>
                <div className="input-field">
                  <User size={18} className="field-icon" aria-hidden="true" />
                  <input
                    id="login-name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>
            )}

            <div className="input-group">
              <label htmlFor="login-email">Email Address</label>
              <div className="input-field">
                <Mail size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  inputMode="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-field">
                <Lock size={18} className="field-icon" aria-hidden="true" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="form-actions">
              {isLogin && (
                <label className="remember-me" htmlFor="remember">
                  <input type="checkbox" id="remember" />
                  <span>Remember me</span>
                </label>
              )}
              {isLogin && (
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => alert('Password reset link sent to demo account.')}
                >
                  Forgot Password?
                </button>
              )}
            </div>

            <button type="submit" className="submit-btn">
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={18} />
            </button>

            <div className="divider">
              <span>OR</span>
            </div>

            <button type="button" className="demo-btn" onClick={handleDemoLogin}>
              <Sparkles size={18} className="demo-icon" />
              <span>Continue as Guest (Demo Account)</span>
            </button>
          </form>

          <div className="auth-switch">
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                className="switch-btn"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                }}
              >
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
