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
  Ticket,
  Luggage,
  ShieldCheck
} from 'lucide-react';

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
      {/* Dynamic Ambient Background Glows */}
      <div className="travel-auth-glow-1" />
      <div className="travel-auth-glow-2" />

      <div className="travel-auth-wrapper">
        
        {/* Left Side: Travel Passport / Boarding Pass Showcase */}
        <div className="travel-showcase-panel">
          <div className="showcase-top-badge">
            <Plane size={15} className="plane-fly-anim" /> Wanderer Boarding Pass
          </div>

          <div className="showcase-content">
            <h2 className="showcase-heading">
              Ready for your next <span className="highlight-text">escape?</span>
            </h2>
            <p className="showcase-sub">
              Your gateway to AI-curated journeys, customized daily routes, and secret hidden spots around the globe.
            </p>

            {/* Boarding Pass Ticket Mock */}
            <div className="boarding-ticket">
              <div className="ticket-header">
                <div>
                  <span className="ticket-label">PASSENGER</span>
                  <span className="ticket-val">Wanderer / Explorer</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="ticket-label">FLIGHT / CLASS</span>
                  <span className="ticket-val" style={{ color: '#00f59b' }}>WP-2026 • VIP</span>
                </div>
              </div>

              <div className="ticket-route">
                <div className="route-stop">
                  <span className="airport-code">CURRENT</span>
                  <span className="city-name">Your Location</span>
                </div>
                <div className="route-plane">
                  <div className="dotted-line" />
                  <Plane size={18} className="plane-mid" />
                </div>
                <div className="route-stop" style={{ textAlign: 'right' }}>
                  <span className="airport-code" style={{ color: '#ff007a' }}>DREAM</span>
                  <span className="city-name">Any Destination</span>
                </div>
              </div>

              <div className="ticket-perks">
                <div className="perk-item">
                  <Sparkles size={13} color="#00f59b" /> Instant AI Itineraries
                </div>
                <div className="perk-item">
                  <MapPin size={13} color="#ff6a00" /> Hidden Spots & Geo-Scout
                </div>
                <div className="perk-item">
                  <Globe2 size={13} color="#00d2ff" /> Multi-Currency Budgeting
                </div>
              </div>

              <div className="ticket-barcode">
                <div className="barcode-lines" />
                <span className="barcode-number">WNDR-PLN-SECURE-AUTH-2026</span>
              </div>
            </div>

            {/* Travel Quote */}
            <div className="travel-quote">
              <Compass size={18} color="#00f59b" />
              <span>"Jobs fill your pocket, but adventures fill your soul."</span>
            </div>
          </div>
        </div>

        {/* Right Side: Glassmorphic Login Form */}
        <div className="travel-form-panel">
          <div className="form-inner">
            <div className="form-brand-header">
              <div className="login-logo-pill">
                <Compass size={22} color="#00f59b" />
              </div>
              <h1 className="form-title">Explorer Sign In</h1>
              <p className="form-subtitle">Welcome! Sign in to unlock AI trip generation, saved trips & itineraries.</p>
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
                  <Mail size={15} color="#00f59b" /> Email Address
                </label>
                <div className="input-with-icon">
                  <input
                    id="login-email"
                    type="email"
                    placeholder="traveler@wanderplan.com"
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
                    <Lock size={15} color="#ff007a" /> Password
                  </label>
                </div>
                <div className="input-with-icon" style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••"
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

              <button type="submit" className="btn-glow-large" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Boarding & Signing In...
                  </>
                ) : (
                  <>
                    <span>Sign In & Start Planning</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGuestContinue}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '0.75rem', padding: '0.75rem 1rem' }}
              >
                Continue as Guest Explorer →
              </button>
            </form>

            <div className="auth-footer-notes">
              <p>
                Don't have an account yet?{' '}
                <Link to="/signup" className="auth-neon-link">
                  Create Traveler Account
                </Link>
              </p>
              <div className="security-guarantee">
                <ShieldCheck size={14} color="#00f59b" /> Encrypted & Secured by Supabase Cloud Auth
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
