import React, { useState } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { CURATED_ITINERARIES } from './ExplorePage';
import { 
  Sparkles, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Compass, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Heart, 
  Globe2, 
  ShieldCheck, 
  Luggage, 
  Bot, 
  Navigation,
  Sun,
  Flame,
  Star
} from 'lucide-react';

export default function PublicLandingPage({ onQuickStart }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [destinationInput, setDestinationInput] = useState('');

  const handleQuickStartSubmit = (e) => {
    e.preventDefault();
    const dest = destinationInput.trim();
    if (!dest) {
      if (onQuickStart) onQuickStart();
      return;
    }
    // Store quick destination in session storage so planner picks it up
    sessionStorage.setItem('prefill_planner', JSON.stringify({
      destination: dest,
      budget: 'moderate',
      travelStyle: 'balanced',
      interests: ['Food & Dining', 'History & Culture', 'Local Hidden Gems']
    }));
    if (onQuickStart) {
      onQuickStart();
    } else {
      navigate('/plan');
    }
  };

  const sampleTrips = CURATED_ITINERARIES.slice(0, 3);

  return (
    <div className="public-landing-container">
      {/* Hero Section */}
      <section className="landing-hero-section">
        <div className="landing-hero-content">
          <div className="landing-badge">
            <Sparkles size={14} className="text-cyan-400" />
            <span>Next-Gen AI Travel Architect</span>
          </div>

          <h1 className="landing-headline">
            Design Your Dream Journey in <span className="gradient-text">Seconds</span>
          </h1>

          <p className="landing-subhead">
            Experience intelligent itinerary generation powered by LLaMA 3.3. Tailored day-by-day stops, interactive Leaflet maps, live weather forecasts, and customized dietary preferences — free for every traveler.
          </p>

          {/* Quick-Start Destination Input */}
          <form className="quick-planner-card glass-card" onSubmit={handleQuickStartSubmit}>
            <div className="quick-input-group">
              <MapPin className="quick-input-icon text-cyan-400" size={20} />
              <input
                type="text"
                placeholder="Where to? (e.g. Kyoto, Amalfi Coast, Paris...)"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="quick-input"
              />
            </div>
            <button type="submit" className="quick-submit-btn">
              <span>Start Planning</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Stats / Trust chips */}
          <div className="landing-trust-row">
            <div className="trust-item">
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>100% Free to Use</span>
            </div>
            <div className="trust-item">
              <Navigation size={16} className="text-blue-400" />
              <span>Interactive Leaflet Map</span>
            </div>
            <div className="trust-item">
              <Sun size={16} className="text-amber-400" />
              <span>Live Open-Meteo Weather</span>
            </div>
            <div className="trust-item">
              <Bot size={16} className="text-purple-400" />
              <span>Ask WanderBot Assistant</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works: 3-Step Interactive Section */}
      <section className="landing-how-it-works">
        <div className="section-header text-center">
          <span className="section-pill">Effortless Flow</span>
          <h2 className="section-title">How WanderPlan Works</h2>
          <p className="section-desc">From idea to full actionable itinerary in three simple steps.</p>
        </div>

        <div className="how-steps-grid">
          <div className="step-card glass-card">
            <div className="step-number">01</div>
            <div className="step-icon-box bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Compass size={28} />
            </div>
            <h3 className="step-title">Choose Your Vibe & Dates</h3>
            <p className="step-text">
              Enter your dream destination, travel dates, pacing style, and interests like food, architecture, or adventure.
            </p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">02</div>
            <div className="step-icon-box bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles size={28} />
            </div>
            <h3 className="step-title">AI Crafts Your Schedule</h3>
            <p className="step-text">
              Groq (LLaMA 3.3) analyzes thousands of route combinations to generate optimized morning, afternoon, and evening stops with geo-coordinates.
            </p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">03</div>
            <div className="step-icon-box bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Luggage size={28} />
            </div>
            <h3 className="step-title">Explore, Customize & Travel</h3>
            <p className="step-text">
              Drag-and-drop activities, swap stops with instant AI alternatives, check packing lists, open GPS routes, and share with friends.
            </p>
          </div>
        </div>
      </section>

      {/* Explore Preview Cards Section */}
      <section className="landing-explore-preview">
        <div className="section-header-row">
          <div>
            <span className="section-pill">Sample Itineraries</span>
            <h2 className="section-title">Popular Handcrafted Journeys</h2>
            <p className="section-desc">Try ready-to-go itineraries curated by travel experts and wanderers.</p>
          </div>
          <button 
            onClick={() => navigate('/explore')} 
            className="explore-more-btn"
          >
            <span>View All Destinations</span>
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="explore-preview-grid">
          {sampleTrips.map((trip) => (
            <div 
              key={trip.id} 
              className="preview-trip-card glass-card"
              onClick={() => navigate(`/trip/${trip.id}`)}
            >
              <div className="preview-image-wrap">
                <img src={trip.cover_image} alt={trip.destination} className="preview-card-img" />
                <div className="preview-badge-row">
                  <span className="preview-badge">{trip.badge || trip.category}</span>
                  <span className="preview-duration"><Clock size={12} /> {trip.duration}</span>
                </div>
              </div>

              <div className="preview-card-body">
                <div className="preview-dest-meta">
                  <MapPin size={14} className="text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-300">{trip.destination}</span>
                </div>

                <h3 className="preview-card-title">{trip.title}</h3>
                <p className="preview-card-summary">{trip.summary.slice(0, 110)}...</p>

                <div className="preview-card-footer">
                  <div className="preview-cost">
                    <span className="text-xs text-slate-400">Est. Total:</span>
                    <span className="text-sm font-semibold text-emerald-400 ml-1">{trip.estimated_total_cost}</span>
                  </div>
                  <span className="preview-action-link">
                    Preview Itinerary <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Immediate Call to Action Banner */}
      <section className="landing-cta-banner glass-card">
        <div className="cta-content">
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Ready to Plan Your Next Great Escape?
          </h2>
          <p className="text-slate-300 max-w-xl mb-6">
            No credit card needed. Start creating your custom itinerary immediately or create a free account to save your trips.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => {
                if (onQuickStart) onQuickStart();
                else navigate('/plan');
              }} 
              className="cta-primary-btn"
            >
              <Sparkles size={18} /> Launch AI Trip Planner
            </button>
            {!user && (
              <button 
                onClick={() => navigate('/login')} 
                className="cta-secondary-btn"
              >
                Sign In to Save Trips
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
