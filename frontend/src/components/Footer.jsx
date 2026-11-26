import React, { useState } from 'react';
import { useRouter, Link } from '../services/router';
import { 
  Compass, 
  Heart, 
  Luggage, 
  Globe, 
  Github, 
  Mail, 
  ShieldCheck, 
  FileText, 
  X,
  ExternalLink,
  Sparkles
} from 'lucide-react';

export default function Footer() {
  const { navigate } = useRouter();
  const [modalContent, setModalContent] = useState(null); // 'privacy' | 'terms' | null

  return (
    <>
      <footer className="wanderplan-footer">
        <div className="footer-container">
          {/* Brand Column */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              <div className="logo-badge">
                <Compass className="logo-icon" size={20} />
              </div>
              <span className="logo-text">WanderPlan<span className="logo-dot">.</span></span>
            </Link>
            <p className="footer-tagline">
              Your AI-powered personal travel architect. Instant hyper-personalized daily itineraries, live weather, interactive maps, and budget intelligence in seconds.
            </p>
            <div className="footer-socials">
              <a 
                href="https://github.com/Shantanu5123/wanderplan-travel-planner" 
                target="_blank" 
                rel="noopener noreferrer"
                className="social-link"
                title="GitHub Repository"
              >
                <Github size={18} />
              </a>
              <a 
                href="mailto:contact@wanderplan.ai" 
                className="social-link"
                title="Contact Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li>
                <button onClick={() => navigate('/')} className="footer-link-btn">
                  <Compass size={14} /> Plan a Trip
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/explore')} className="footer-link-btn">
                  <Globe size={14} /> Explore Destinations
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/dashboard')} className="footer-link-btn">
                  <Luggage size={14} /> My Saved Trips
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/saved')} className="footer-link-btn">
                  <Heart size={14} /> Bookmarks
                </button>
              </li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="footer-col">
            <h4 className="footer-heading">Trust & Legal</h4>
            <ul className="footer-links">
              <li>
                <button 
                  onClick={() => setModalContent('privacy')} 
                  className="footer-link-btn"
                >
                  <ShieldCheck size={14} /> Privacy Policy
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setModalContent('terms')} 
                  className="footer-link-btn"
                >
                  <FileText size={14} /> Terms of Service
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('/settings')} 
                  className="footer-link-btn"
                >
                  <Sparkles size={14} /> Traveler Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* About / Tech */}
          <div className="footer-col">
            <h4 className="footer-heading">Architecture</h4>
            <p className="footer-tech-note">
              Engineered with Groq (LLaMA 3.3 70B), FastAPI, React, Leaflet & OpenStreetMap, Supabase, and Open-Meteo.
            </p>
            <div className="footer-badge-pill">
              <span className="status-indicator"></span> 100% Free & Open Access
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p className="copyright-text">
              © {new Date().getFullYear()} WanderPlan AI. Built for travelers worldwide.
            </p>
            <div className="footer-bottom-links">
              <span className="build-ver">v2.4 Production</span>
              <a 
                href="https://github.com/Shantanu5123/wanderplan-travel-planner" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="repo-link"
              >
                Open Source GitHub <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Modal (Privacy Policy & Terms of Service) */}
      {modalContent && (
        <div className="legal-modal-overlay" onClick={() => setModalContent(null)}>
          <div className="legal-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="legal-modal-header">
              <div className="flex items-center gap-2">
                {modalContent === 'privacy' ? <ShieldCheck className="text-emerald-400" size={22} /> : <FileText className="text-cyan-400" size={22} />}
                <h3 className="text-lg font-bold text-white">
                  {modalContent === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
                </h3>
              </div>
              <button 
                onClick={() => setModalContent(null)}
                className="legal-modal-close"
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="legal-modal-body">
              {modalContent === 'privacy' ? (
                <div className="legal-text-content">
                  <p className="text-sm text-slate-300 mb-3">
                    <strong>Last Updated: November 2026</strong>
                  </p>
                  <h4 className="text-white font-semibold mb-1">1. Information We Collect</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    WanderPlan collects only the necessary information required to generate and save your itineraries (travel destination, dates, budget preferences, dietary and mobility notes). When signing up, your email is managed securely via Supabase Auth with encrypted tokens.
                  </p>
                  <h4 className="text-white font-semibold mb-1">2. AI Data Usage</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Your trip search parameters are processed using the Groq AI inference engine strictly for generating your personalized travel schedule. We do not sell your personal trip data to third-party advertisers or brokers.
                  </p>
                  <h4 className="text-white font-semibold mb-1">3. Storage & Security</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    Your saved trips, bookmarked destinations, and preferences are protected with Row Level Security (RLS) policies. You have full control to view or delete your trips and account at any time.
                  </p>
                </div>
              ) : (
                <div className="legal-text-content">
                  <p className="text-sm text-slate-300 mb-3">
                    <strong>Last Updated: November 2026</strong>
                  </p>
                  <h4 className="text-white font-semibold mb-1">1. Acceptance of Terms</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    By accessing or using WanderPlan, you agree to be bound by these Terms of Service. WanderPlan provides AI-generated travel itineraries and estimates for informational and planning purposes only.
                  </p>
                  <h4 className="text-white font-semibold mb-1">2. Travel Accuracy Disclaimer</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    While our AI strives for high accuracy in activity recommendations, pricing, weather forecasts, and opening hours, actual conditions at your destination may vary. Travelers are advised to independently verify hours, ticket availability, and local travel advisories before departing.
                  </p>
                  <h4 className="text-white font-semibold mb-1">3. External Links</h4>
                  <p className="text-sm text-slate-300 mb-3">
                    WanderPlan provides convenience deep links to external services (e.g., Google Flights, Google Hotels, Google Maps). WanderPlan is not affiliated with or responsible for transactions conducted on third-party provider websites.
                  </p>
                </div>
              )}
            </div>

            <div className="legal-modal-footer">
              <button 
                onClick={() => setModalContent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
