import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../services/router';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Compass, 
  Plane, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Globe2,
  Calendar,
  ShieldCheck,
  Star,
  Luggage,
  Users
} from 'lucide-react';

const FEATURED_DESTINATIONS = [
  { name: 'Kyoto, Japan', tag: 'Cultural Haven', img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=500&auto=format&fit=crop&q=80' },
  { name: 'Santorini, Greece', tag: 'Sunset Views', img: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=500&auto=format&fit=crop&q=80' },
  { name: 'Swiss Alps', tag: 'Mountain Escape', img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=500&auto=format&fit=crop&q=80' }
];

export default function LoginPage() {
  const { signIn, loginAsGuest } = useAuth();
  const { navigate } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }

    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) return;

    setLoading(true);
    try {
      const { data, error } = await signIn(email.trim(), password);
      if (error) {
        setServerError(error.message || 'Invalid email or password');
      } else if (data?.user) {
        navigate('/');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    loginAsGuest();
    navigate('/');
  };

  return (
    <div className="travel-auth-container">
      {/* Immersive cinematic background hero with dark travel overlay */}
      <div className="travel-hero-bg-backdrop" />
      <div className="travel-auth-glow-1" />
      <div className="travel-auth-glow-2" />

      <div className="travel-auth-wrapper travel-first-look-card">
        
        {/* Left Side: Editorial Travel Showcase */}
        <div className="travel-showcase-panel editorial-layout">
          <div className="showcase-header-row">
            <div className="brand-pill-badge">
              <Compass size={16} className="brand-spin-icon" />
              <span>WanderPlan AI</span>
            </div>
            <div className="rating-pill">
              <Star size={13} fill="#f59e0b" color="#f59e0b" />
              <span>4.9 / 5 by 20,000+ Travelers</span>
            </div>
          </div>

          <div className="showcase-content">
            <h1 className="showcase-editorial-title">
              Craft unforgettable journeys in <span className="highlight-gradient">seconds</span>.
            </h1>
            <p className="showcase-editorial-sub">
              Your personal AI travel concierge. Discover secret viewpoints, tailor realistic schedules, and budget like a local globetrotter.
            </p>

            {/* Live Trending Destinations Showcase Ribbon */}
            <div className="destinations-showcase-row">
              {FEATURED_DESTINATIONS.map((dest, i) => (
                <div key={i} className="destination-preview-chip">
                  <img src={dest.img} alt={dest.name} className="dest-chip-thumb" />
                  <div className="dest-chip-info">
                    <span className="dest-chip-name">{dest.name}</span>
                    <span className="dest-chip-tag">{dest.tag}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Travel Value Highlights Grid */}
            <div className="travel-features-grid">
              <div className="feature-grid-item">
                <div className="feature-icon-wrapper">
                  <Sparkles size={17} color="#38bdf8" />
                </div>
                <div>
                  <h4>AI Day-by-Day Itineraries</h4>
                  <p>Smart geo-optimized routes tailored to your pace.</p>
                </div>
              </div>

              <div className="feature-grid-item">
                <div className="feature-icon-wrapper">
                  <MapPin size={17} color="#34d399" />
                </div>
                <div>
                  <h4>Hidden Gems & Local Spots</h4>
                  <p>Skip generic tourist traps with verified gems.</p>
                </div>
              </div>

              <div className="feature-grid-item">
                <div className="feature-icon-wrapper">
                  <Globe2 size={17} color="#818cf8" />
                </div>
                <div>
                  <h4>Multi-Currency & Weather</h4>
                  <p>Real-time exchange conversion & live forecasts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Quote */}
          <div className="showcase-footer-proof">
            <div className="travelers-avatars">
              <span className="avatar-chip a1">✈️</span>
              <span className="avatar-chip a2">🎒</span>
              <span className="avatar-chip a3">📸</span>
            </div>
            <p className="proof-text">
              "WanderPlan planned our 7-day trip to Switzerland flawlessly. Best travel tool I've used!"
            </p>
          </div>
        </div>

        {/* Right Side: Sleek Modern Traveler Login Form */}
        <div className="travel-form-panel">
          <div className="form-inner">
            <div className="form-brand-header">
              <div className="login-logo-pill">
                <Luggage size={24} color="#38bdf8" />
              </div>
              <h2 className="form-title">Welcome, Explorer</h2>
              <p className="form-subtitle">Sign in to start creating your dream itineraries, view saved routes, and access smart budgets.</p>
            </div>

            {/* One-click Instant Guest Explorer Action */}
            <div className="guest-quickstart-banner">
              <div className="guest-banner-text">
                <strong>Just exploring?</strong>
                <span>Try the full planner without creating an account</span>
              </div>
              <button
                type="button"
                onClick={handleGuestContinue}
                className="btn-guest-action"
              >
                <span>Continue as Guest</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="auth-divider-line">
              <span>or sign in with email</span>
            </div>

            {serverError && (
              <div className="alert alert-error auth-alert">
                <AlertCircle size={17} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="login-email">
                  <Mail size={15} color="#38bdf8" /> Email Address
                </label>
                <div className="input-with-icon">
                  <input
                    id="login-email"
                    type="email"
                    placeholder="e.g. explorer@wanderplan.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                    className={`input-text ${errors.email ? 'input-error' : ''}`}
                    disabled={loading}
                  />
                </div>
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="login-password">
                    <Lock size={15} color="#818cf8" /> Password
                  </label>
                </div>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                    className={`input-text ${errors.password ? 'input-error' : ''}`}
                    disabled={loading}
                    style={{ paddingRight: '2.8rem' }}
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <button type="submit" className="btn-glow-large submit-auth-btn" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to WanderPlan</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-notes">
              <p>
                New here?{' '}
                <Link to="/signup" className="auth-neon-link">
                  Create Traveler Account
                </Link>
              </p>
              <div className="security-guarantee">
                <ShieldCheck size={14} color="#34d399" /> 100% Free to start • Instant Itinerary Generation
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
