import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter, Link } from '../services/router';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Compass, 
  Plane, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe2
} from 'lucide-react';

export default function SignupPage() {
  const { signUp } = useAuth();
  const { navigate } = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!fullName.trim()) {
      errs.fullName = 'Please enter your name';
    }

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

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
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
      const { data, error } = await signUp(email.trim(), password, fullName.trim());
      if (error) {
        setServerError(error.message || 'Failed to create account');
      } else if (data?.user) {
        navigate('/dashboard');
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="travel-auth-container">
      <div className="travel-auth-glow-1" />
      <div className="travel-auth-glow-2" />

      <div className="travel-auth-wrapper">
        
        {/* Left Side: Travel Passport / Welcome Panel */}
        <div className="travel-showcase-panel">
          <div className="showcase-top-badge">
            <Plane size={15} className="plane-fly-anim" /> New Traveler Registration
          </div>

          <div className="showcase-content">
            <h2 className="showcase-heading">
              Join the new era of <span className="highlight-text">smart travel.</span>
            </h2>
            <p className="showcase-sub">
              Create your free passport to craft AI itineraries, scout hidden gems in any region, and save dream journeys.
            </p>

            {/* Travel Passport Card */}
            <div className="boarding-ticket">
              <div className="ticket-header">
                <div>
                  <span className="ticket-label">PASSPORT TYPE</span>
                  <span className="ticket-val" style={{ color: '#38bdf8' }}>WanderPlan Global Access</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="ticket-label">MEMBERSHIP</span>
                  <span className="ticket-val" style={{ color: '#34d399' }}>Lifetime Free</span>
                </div>
              </div>

              <div style={{ margin: '1.15rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} /> Instant custom day-by-day AI schedules
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} /> Real-time 8-currency cost conversion
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} /> Ask WanderBot AI surrounding area scout
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#cbd5e1', fontSize: '0.88rem' }}>
                  <CheckCircle2 size={16} color="#34d399" style={{ flexShrink: 0 }} /> Cloud sync across all your devices
                </div>
              </div>

              <div className="ticket-barcode">
                <div className="barcode-lines" />
                <span className="barcode-number">REGISTER-EXP-PASS-2026</span>
              </div>
            </div>

            <div className="travel-quote">
              <Globe2 size={18} color="#34d399" />
              <span>"The world is a book and those who do not travel read only one page."</span>
            </div>
          </div>
        </div>

        {/* Right Side: Signup Form */}
        <div className="travel-form-panel">
          <div className="form-inner">
            <div className="form-brand-header">
              <div className="login-logo-pill">
                <Sparkles size={22} color="#00f59b" />
              </div>
              <h1 className="form-title">Create Traveler Passport</h1>
              <p className="form-subtitle">Fill in your explorer details to begin planning your adventures.</p>
            </div>

            {serverError && (
              <div className="alert alert-error auth-alert">
                <AlertCircle size={17} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label htmlFor="signup-name">
                  <User size={15} color="#00f59b" /> Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="e.g. Elena Rostova"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: null });
                  }}
                  className={`input-text ${errors.fullName ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.fullName && <span className="field-error">{errors.fullName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-email">
                  <Mail size={15} color="#00f59b" /> Email Address
                </label>
                <input
                  id="signup-email"
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
                {errors.email && <span className="field-error">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-password">
                  <Lock size={15} color="#ff007a" /> Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
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
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <span className="field-error">{errors.password}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="signup-confirm-password">
                  <Lock size={15} color="#ff6a00" /> Confirm Password
                </label>
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  className={`input-text ${errors.confirmPassword ? 'input-error' : ''}`}
                  disabled={loading}
                />
                {errors.confirmPassword && (
                  <span className="field-error">{errors.confirmPassword}</span>
                )}
              </div>

              <button type="submit" className="btn-glow-large" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Issuing Passport...
                  </>
                ) : (
                  <>
                    <span>Create Passport & Start</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer-notes">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-neon-link">
                  Sign In Here
                </Link>
              </p>
              <div className="security-guarantee">
                <ShieldCheck size={14} color="#00f59b" /> Secured with Supabase Cloud Authentication
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
