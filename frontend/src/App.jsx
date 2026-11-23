import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { LanguageProvider } from './context/LanguageContext';
import { HashRouter, useRouter } from './services/router';
import Navbar from './components/Navbar';
import TripPlanningForm from './components/TripPlanningForm';
import FloatingChatbot from './components/FloatingChatbot';
import CursorGlow from './components/CursorGlow';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import TripDetailPage from './pages/TripDetailPage';
import { Sparkles, Loader2 } from 'lucide-react';

function HomePlanner() {
  return (
    <div className="container home-container" style={{ maxWidth: '1040px', margin: '0 auto', padding: '3rem 1rem' }}>
      <header className="home-hero">
        <div className="hero-badge">
          <Sparkles size={15} /> AI-Powered Travel Generator
        </div>
        <h1>Your Next Adventure, Perfectly Planned</h1>
        <p>
          Tell us your dream destination, dates, budget, and travel style. We craft high-energy, customized day-by-day itineraries with surrounding hidden gems!
        </p>
      </header>

      <main>
        <TripPlanningForm />
      </main>
    </div>
  );
}

function RouterOutlet() {
  const { currentPath } = useRouter();
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

  // When opening the website without being logged in, show the Login page first!
  if (!user && (currentPath === '/' || currentPath === '/login')) {
    return <LoginPage />;
  }

  if (currentPath === '/signup') {
    return <SignupPage />;
  }

  if (currentPath === '/login') {
    return <LoginPage />;
  }

  if (currentPath === '/dashboard') {
    return <DashboardPage />;
  }

  if (currentPath === '/explore') {
    return <ExplorePage />;
  }

  if (currentPath.startsWith('/trip')) {
    const parts = currentPath.split('/');
    const tripId = parts[2] || null;
    return <TripDetailPage tripId={tripId} />;
  }

  // Logged-in Home
  return <HomePlanner />;
}

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <LanguageProvider>
          <HashRouter>
            <div className="app-shell">
              {/* Interactive Cursor Spotlight Glow */}
              <CursorGlow />

              <Navbar />
              <RouterOutlet />

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
