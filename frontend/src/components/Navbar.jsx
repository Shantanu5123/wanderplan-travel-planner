import React, { useState, useRef, useEffect } from 'react';
import { useRouter, Link } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  Compass, 
  Luggage, 
  LogIn, 
  User, 
  LogOut, 
  Globe, 
  ChevronDown, 
  Settings, 
  Heart 
} from 'lucide-react';
import AuthModal from './AuthModal';
import CurrencySelector from './CurrencySelector';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { currentPath, navigate } = useRouter();
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('signin');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openAuth = (tab) => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Traveler';

  return (
    <>
      <nav className="navbar glass-nav">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            <div className="logo-badge">
              <Compass className="logo-icon" size={22} />
            </div>
            <span className="logo-text">WanderPlan<span className="logo-dot">.</span></span>
          </Link>

          {/* Nav Links with Multilingual Support */}
          <div className="nav-links">
            <Link to="/plan" className={`nav-link ${currentPath === '/plan' ? 'active' : ''}`}>
              <Compass size={16} />
              {t('planTrip')}
            </Link>
            <Link
              to="/dashboard"
              className={`nav-link ${currentPath === '/dashboard' || currentPath.startsWith('/trip') ? 'active' : ''}`}
            >
              <Luggage size={16} />
              {t('myTrips')}
            </Link>
            <Link
              to="/explore"
              className={`nav-link ${currentPath === '/explore' ? 'active' : ''}`}
            >
              <Globe size={16} />
              {t('explore')}
            </Link>
          </div>

          {/* Right Actions: Currency, Language & User */}
          <div className="nav-actions">
            {/* Currency Selector */}
            <CurrencySelector />

            {/* Language Selector */}
            <LanguageSelector />

            {user ? (
              <div className="user-menu-wrapper" ref={dropdownRef}>
                <button
                  className="user-menu-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  <div className="avatar-circle">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="user-name">{displayName}</span>
                  <ChevronDown size={15} className={`chevron ${dropdownOpen ? 'rotate' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown-menu glass-card">
                    <div className="dropdown-user-info">
                      <strong>{displayName}</strong>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/dashboard');
                      }}
                    >
                      <Luggage size={16} /> {t('myTrips')}
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/saved');
                      }}
                    >
                      <Heart size={16} /> {t('savedDestinations')}
                    </button>
                    <button
                      className="dropdown-item"
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate('/settings');
                      }}
                    >
                      <Settings size={16} /> Preferences & Settings
                    </button>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item logout" onClick={handleLogout}>
                      <LogOut size={16} /> {t('signOut')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <button
                  onClick={() => openAuth('signin')}
                  className="btn-ghost"
                >
                  <LogIn size={15} />
                  {t('signIn')}
                </button>
                <button
                  onClick={() => openAuth('signup')}
                  className="btn-glow"
                >
                  {t('createAccount')}
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Reusable Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
