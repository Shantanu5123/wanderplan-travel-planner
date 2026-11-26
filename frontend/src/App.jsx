import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { HashRouter, useRouter } from './services/router';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TripPlanningForm from './components/TripPlanningForm';
import FloatingChatbot from './components/FloatingChatbot';
import CursorGlow from './components/CursorGlow';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import TripDetailPage from './pages/TripDetailPage';
import SavedDestinationsPage from './pages/SavedDestinationsPage';
import SettingsPage from './pages/SettingsPage';
import PublicLandingPage from './pages/PublicLandingPage';
import { Sparkles, Loader2 } from 'lucide-react';

function HomePlanner() {
  const { t } = useLanguage();
  return (
    <div className="container home-container" style={{ maxWidth: '1040px', margin: '0 auto', padding: '3rem 1rem' }}>
      <header className="home-hero">
        <div className="hero-badge">
          <Sparkles size={15} /> {t('heroTag')}
        </div>
        <h1>{t('heroTitle')}</h1>
        <p>
          {t('heroSubtitle')}
        </p>
      </header>

      <main>
        <TripPlanningForm />
      </main>
    </div>
  );
}

function RouterOutlet() {
  const { currentPath, navigate } = useRouter();
  const { user, loading } = useAuth();

  // If auth state is still initializing
  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="spinner" style={{ color: '#00f59b', marginBottom: '1rem' }} />
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Loading WanderPlan...</p>
      </div>
    );
  }

  // Explicit Authentication Routes
  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/signup') {
    return <SignupPage />;
  }

  // Public Landing Page at root `/`
  if (currentPath === '/') {
    return <PublicLandingPage onQuickStart={() => navigate('/plan')} />;
  }

  // Planner page (accessible publicly or when logged in)
  if (currentPath === '/plan') {
    return <HomePlanner />;
  }

  if (currentPath === '/dashboard') {
    // If not logged in, prompt user to log in or guest explore
    if (!user) {
      return <LoginPage />;
    }
    return <DashboardPage />;
  }

  if (currentPath === '/explore') {
    return <ExplorePage />;
  }

  if (currentPath === '/saved') {
    return <SavedDestinationsPage />;
  }

  if (currentPath === '/settings') {
    return <SettingsPage />;
  }

  if (currentPath.startsWith('/trip')) {
    const parts = currentPath.split('/');
    const tripId = parts[2] || null;
    return <TripDetailPage tripId={tripId} />;
  }

  // Fallback to Public Landing Page
  return <PublicLandingPage onQuickStart={() => navigate('/plan')} />;
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <HashRouter>
            <div className="app-shell flex flex-col min-h-screen">
              {/* Interactive Cursor Spotlight Glow */}
              <CursorGlow />

              <Navbar />
              <div className="flex-grow">
                <RouterOutlet />
              </div>

              {/* Global Responsive Minimal Footer */}
              <Footer />

              {/* Persistent Bottom-Right "Ask WanderBot" Floating AI Widget */}
              <FloatingChatbot />
            </div>
          </HashRouter>
        </LanguageProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;
