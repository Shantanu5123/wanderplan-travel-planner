import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from '../services/router';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  Compass, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialTab = 'signin' }) {
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();

  const [activeTab, setActiveTab] = useState(initialTab); // 'signin' | 'signup'
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [serverSuccess, setServerSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (activeTab === 'signup' && !fullName.trim()) {
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

    if (activeTab === 'signup' && password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!validate()) return;

    setLoading(true);
    try {
      if (activeTab === 'signin') {
        const { data, error } = await signIn(email.trim(), password);
        if (error) {
          setServerError(error.message || 'Invalid email or password');
        } else if (data?.user) {
          onClose();
          navigate('/dashboard');
        }
      } else {
        const { data, error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          setServerError(error.message || 'Failed to create account');
        } else if (data?.user) {
          setServerSuccess('Account created! Welcome to WanderPlan.');
          setTimeout(() => {
            onClose();
            navigate('/dashboard');
          }, 800);
        }
      }
    } catch (err) {
      setServerError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-window glass-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <X size={20} />
        </button>

        {/* Branded Header */}
        <div className="auth-modal-header">
          <div className="auth-brand-badge">
            <Compass className="brand-glow-icon" size={28} />
          </div>
          <h2>Welcome to WanderPlan</h2>
          <p>Your personalized AI travel companion</p>
        </div>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${activeTab === 'signin' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signin');
              setErrors({});
              setServerError(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`auth-tab ${activeTab === 'signup' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('signup');
              setErrors({});
              setServerError(null);
            }}
          >
            Create Account
          </button>
        </div>

        {/* Alerts */}
        {serverError && (
          <div className="alert alert-error auth-alert">
            <AlertCircle size={16} />
            <span>{serverError}</span>
          </div>
        )}
        {serverSuccess && (
          <div className="alert alert-success auth-alert">
            <CheckCircle2 size={16} />
            <span>{serverSuccess}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {activeTab === 'signup' && (
            <div className="form-group">
              <label htmlFor="modal-name">Full Name</label>
              <div className="input-with-icon">
                <User className="input-prefix-icon" size={16} />
                <input
                  id="modal-name"
                  type="text"
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors({ ...errors, fullName: null });
                  }}
                  className={`input-text icon-padding ${errors.fullName ? 'input-error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.fullName && <span className="field-error">{errors.fullName}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="modal-email">Email Address</label>
            <div className="input-with-icon">
              <Mail className="input-prefix-icon" size={16} />
              <input
                id="modal-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: null });
                }}
                className={`input-text icon-padding ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
            </div>
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="modal-password">Password</label>
            <div className="input-with-icon">
              <Lock className="input-prefix-icon" size={16} />
              <input
                id="modal-password"
                type={showPassword ? 'text' : 'password'}
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                className={`input-text icon-padding ${errors.password ? 'input-error' : ''}`}
                disabled={loading}
              />
              <button
                type="button"
                className="input-suffix-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {activeTab === 'signup' && (
            <div className="form-group">
              <label htmlFor="modal-confirm">Confirm Password</label>
              <div className="input-with-icon">
                <Lock className="input-prefix-icon" size={16} />
                <input
                  id="modal-confirm"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                  }}
                  className={`input-text icon-padding ${errors.confirmPassword ? 'input-error' : ''}`}
                  disabled={loading}
                />
              </div>
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {activeTab === 'signin' && (
            <div className="auth-extra-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset instructions will be sent to your email.');
                }}
                className="forgot-link"
              >
                Forgot password?
              </a>
            </div>
          )}

          <button type="submit" className="submit-btn auth-submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className="spinner" />
                {activeTab === 'signin' ? 'Signing In...' : 'Creating Account...'}
              </>
            ) : activeTab === 'signin' ? (
              'Sign In'
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        {/* Guest Mode Divider */}
        <div className="modal-divider">
          <span>or</span>
        </div>

        <button
          type="button"
          onClick={handleGuestContinue}
          className="btn-guest"
        >
          <Sparkles size={16} /> Continue as Guest (Plan without signing in)
        </button>
      </div>
    </div>
  );
}
