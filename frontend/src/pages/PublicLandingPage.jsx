import React, { useState, useEffect, useRef } from 'react';
import { 
  motion, 
  useScroll, 
  useTransform, 
  useSpring, 
  AnimatePresence 
} from 'framer-motion';
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
  Star,
  ChevronDown,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CloudSun,
  Layers,
  ArrowUpRight,
  Send,
  Check,
  Plane,
  Compass as CompassIcon,
  Coffee,
  Camera,
  Activity,
  Umbrella,
  CheckSquare,
  Shield,
  Zap,
  Sliders
} from 'lucide-react';

export default function PublicLandingPage({ onQuickStart }) {
  const { navigate } = useRouter();
  const { user, signIn, signUp, loginAsGuest } = useAuth();
  const { t } = useLanguage();

  // If already authenticated and visiting landing page, redirect straight to planner/dashboard
  useEffect(() => {
    if (user && !user.isGuest) {
      navigate('/plan');
    }
  }, [user, navigate]);

  // Overall page scroll progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Parallax Hero transforms
  const heroRef = useRef(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start']
  });

  const heroY = useTransform(heroProgress, [0, 1], ['0%', '35%']);
  const heroOpacity = useTransform(heroProgress, [0, 0.75], [1, 0]);
  const heroCard1Y = useTransform(heroProgress, [0, 1], ['0px', '-100px']);
  const heroCard2Y = useTransform(heroProgress, [0, 1], ['0px', '70px']);
  const heroCard3Y = useTransform(heroProgress, [0, 1], ['0px', '-60px']);
  const scrollIndicatorOpacity = useTransform(heroProgress, [0, 0.25], [1, 0]);

  // Destination quick input
  const [destinationInput, setDestinationInput] = useState('');

  const handleQuickStartSubmit = (e) => {
    e.preventDefault();
    const dest = destinationInput.trim();
    if (dest) {
      sessionStorage.setItem('prefill_planner', JSON.stringify({
        destination: dest,
        budget: 'moderate',
        travelStyle: 'balanced',
        interests: ['Food & Dining', 'History & Culture', 'Local Hidden Gems']
      }));
    }
    if (onQuickStart) {
      onQuickStart();
    } else {
      navigate('/plan');
    }
  };

  // Auth Form State inside Section 3
  const [authMode, setAuthMode] = useState('signin'); // 'signin' | 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail.trim() || !/\S+@\S+\.\S+/.test(authEmail)) {
      setAuthError('Please enter a valid email address');
      return;
    }
    if (!authPassword || authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'signin') {
        const { error } = await signIn(authEmail, authPassword);
        if (error) throw error;
        navigate('/plan');
      } else {
        const { error } = await signUp(authEmail, authPassword, authName);
        if (error) throw error;
        navigate('/plan');
      }
    } catch (err) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestLogin = () => {
    loginAsGuest();
    navigate('/plan');
  };

  const scrollToAuth = () => {
    const el = document.getElementById('auth-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToExplore = () => {
    const el = document.getElementById('explore-preview-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="scrolly-landing-root">
      {/* 1. Top Fixed Scroll Progress Bar */}
      <motion.div
        className="fixed-scroll-progress-bar"
        style={{ scaleX }}
      />

      {/* Fixed Sleek Glassmorphic Landing Navbar */}
      <nav className="scrolly-fixed-nav">
        <div className="scrolly-nav-inner">
          <div className="scrolly-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="logo-badge">
              <Compass className="logo-icon" size={20} />
            </div>
            <span className="logo-text">WanderPlan<span className="logo-dot">.</span></span>
          </div>

          <div className="scrolly-nav-actions">
            <button 
              onClick={() => navigate('/explore')} 
              className="scrolly-nav-link"
            >
              <Globe2 size={15} />
              <span>Explore Library</span>
            </button>
            <button 
              onClick={() => navigate('/plan')} 
              className="scrolly-nav-link"
            >
              <Sparkles size={15} />
              <span>AI Planner</span>
            </button>
            <button 
              onClick={scrollToAuth} 
              className="scrolly-nav-auth-btn"
            >
              <span>Sign In</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Section 1: Full-Screen Parallax Hero */}
      <section ref={heroRef} className="hero-parallax-section">
        <motion.div 
          className="hero-parallax-bg-glow"
          style={{
            background: 'radial-gradient(circle at 50% 30%, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.15) 35%, transparent 70%)'
          }}
        />

        <motion.div 
          className="hero-parallax-content"
          style={{ y: heroY, opacity: heroOpacity }}
        >
          {/* Social proof badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-pill-badge"
          >
            <Sparkles size={14} className="text-cyan-400" />
            <span>Next-Generation AI Travel Architect</span>
            <span className="pill-dot"></span>
            <span className="text-slate-400 text-xs font-normal">v2.4 Live</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hero-main-title"
          >
            Smarter Itineraries.<br />
            <span className="scrolly-gradient-text">Zero Effort. Infinite Wonder.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="hero-lead-text"
          >
            Craft day-by-day travel journeys in seconds with real GPS route maps, dynamic weather forecasts, automated packing checklists, and localized intelligence.
          </motion.p>

          {/* Quick Start Destination Bar */}
          <motion.form 
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hero-quick-form glass-card"
            onSubmit={handleQuickStartSubmit}
          >
            <div className="hero-input-wrap">
              <MapPin className="text-cyan-400 shrink-0" size={20} />
              <input
                type="text"
                placeholder="Where is your next escape? (e.g. Kyoto, Amalfi, Reykjavik...)"
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                className="hero-text-input"
              />
            </div>
            <button type="submit" className="hero-action-btn">
              <span>Start Planning</span>
              <ArrowRight size={16} />
            </button>
          </motion.form>

          {/* Quick highlight metrics */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="hero-metrics-row"
          >
            <div className="metric-chip">
              <CheckCircle2 size={15} className="text-emerald-400" />
              <span>100% Free Forever</span>
            </div>
            <div className="metric-chip">
              <Navigation size={15} className="text-blue-400" />
              <span>Interactive Leaflet GPS</span>
            </div>
            <div className="metric-chip">
              <Sun size={15} className="text-amber-400" />
              <span>Live Open-Meteo Data</span>
            </div>
            <div className="metric-chip">
              <Bot size={15} className="text-purple-400" />
              <span>WanderBot Companion</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating Parallax Destination Cards with 3D depth */}
        <motion.div 
          className="hero-float-card hero-float-card-1 glass-card"
          style={{ y: heroCard1Y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=360&q=80" 
            alt="Kyoto, Japan" 
            className="float-card-img" 
          />
          <div className="float-card-info">
            <span className="float-card-tag">Trending Destination</span>
            <h4 className="float-card-title">Kyoto, Japan</h4>
            <div className="float-card-sub">
              <span>⛩️ 4 Days</span>
              <span className="dot-sep">•</span>
              <span className="text-emerald-400 font-semibold">$850 est.</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-float-card hero-float-card-2 glass-card"
          style={{ y: heroCard2Y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=360&q=80" 
            alt="Santorini, Greece" 
            className="float-card-img" 
          />
          <div className="float-card-info">
            <span className="float-card-tag">Island Sunset</span>
            <h4 className="float-card-title">Santorini, Greece</h4>
            <div className="float-card-sub">
              <span>🇬🇷 5 Days</span>
              <span className="dot-sep">•</span>
              <span className="text-cyan-400 font-semibold">Scenic Views</span>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="hero-float-card hero-float-card-3 glass-card"
          style={{ y: heroCard3Y }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <img 
            src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=360&q=80" 
            alt="Swiss Alps" 
            className="float-card-img" 
          />
          <div className="float-card-info">
            <span className="float-card-tag">Alpine Escape</span>
            <h4 className="float-card-title">Swiss Alps, Zermatt</h4>
            <div className="float-card-sub">
              <span>🏔️ 3 Days</span>
              <span className="dot-sep">•</span>
              <span className="text-amber-400 font-semibold">Matterhorn</span>
            </div>
          </div>
        </motion.div>

        {/* Scroll To Explore Indicator */}
        <motion.div 
          className="scroll-indicator-wrap"
          style={{ opacity: scrollIndicatorOpacity }}
          onClick={() => {
            const el = document.getElementById('feature-scroll-track');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <span className="scroll-indicator-text">Scroll to explore 3D journey</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="scroll-indicator-icon"
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Section 2: 3D Scrollytelling Feature Walkthrough */}
      <section id="feature-scroll-track" className="scrolly-3d-section">
        <div className="section-title-wrap text-center">
          <span className="section-pill">Interactive 3D Stage</span>
          <h2 className="section-headline">Everything You Need To Wander Smarter</h2>
          <p className="section-subtitle">
            Explore the four pillars powering WanderPlan's next-generation travel engine.
          </p>
        </div>

        {/* FEATURE 1: AI ITINERARY BUILDER (3D CARD) */}
        <motion.div 
          className="feature-3d-row"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="feature-3d-text">
            <div className="step-tag-pill blue">
              <Sparkles size={14} /> Step 01 / Generation
            </div>
            <h3 className="feature-3d-title">AI Daily Itinerary Architect</h3>
            <span className="feature-3d-highlight text-cyan-400">Powered by LLaMA 3.3 70B</span>
            <p className="feature-3d-desc">
              Generate perfectly balanced morning, afternoon, and evening schedules with optimal routing, real ticket cost estimates, local cuisine recommendations, and walking times.
            </p>
            <div className="feature-badges-list">
              <span className="f-badge">✨ Pace Optimization</span>
              <span className="f-badge">🥗 Dietary Customization</span>
              <span className="f-badge">♿ Mobility Support</span>
            </div>
            <button onClick={() => navigate('/plan')} className="feature-action-btn blue-btn">
              <span>Launch Itinerary Architect</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="feature-3d-visual">
            <div className="card-3d-glass card-tilt-right">
              <div className="visual-window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="visual-title">Kyoto, Japan • Day 1 Itinerary</span>
              </div>
              <div className="mockup-cards-stack">
                <div className="mockup-activity-card">
                  <div className="slot-badge morning">Morning</div>
                  <div className="card-info">
                    <div className="font-semibold text-white text-sm">Fushimi Inari Torii Gate Hike</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>📍 Fushimi Ward</span> • <span className="text-emerald-400">Free admission</span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                </div>
                <div className="mockup-activity-card">
                  <div className="slot-badge afternoon">Afternoon</div>
                  <div className="card-info">
                    <div className="font-semibold text-white text-sm">Tofuku-ji Zen Rock Gardens</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>📍 Higashiyama</span> • <span className="text-cyan-400">¥500 ($3.50)</span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                </div>
                <div className="mockup-activity-card">
                  <div className="slot-badge evening">Evening</div>
                  <div className="card-info">
                    <div className="font-semibold text-white text-sm">Gion Lantern Walk & Kaiseki</div>
                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>📍 Gion District</span> • <span className="text-amber-400">Local Cuisine</span>
                    </div>
                  </div>
                  <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE 2: INTERACTIVE LEAFLET GPS MAP (3D CARD) */}
        <motion.div 
          className="feature-3d-row reverse"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="feature-3d-text">
            <div className="step-tag-pill green">
              <Navigation size={14} /> Step 02 / Navigation
            </div>
            <h3 className="feature-3d-title">Interactive Leaflet GPS Routes</h3>
            <span className="feature-3d-highlight text-emerald-400">OpenStreetMap & Live Polylines</span>
            <p className="feature-3d-desc">
              Experience responsive split-screen mapping with numbered stop markers, dashed travel routes, and interactive hover-fly zooms that take you directly to your destinations.
            </p>
            <div className="feature-badges-list">
              <span className="f-badge">🗺️ Real-world Coordinates</span>
              <span className="f-badge">📍 1-Click "Open in Maps"</span>
              <span className="f-badge">🧭 Sequence Routes</span>
            </div>
            <button onClick={() => navigate('/explore')} className="feature-action-btn green-btn">
              <span>Preview Map View</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="feature-3d-visual">
            <div className="card-3d-glass card-tilt-left">
              <div className="visual-window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="visual-title">Live GPS Waypoints Route</span>
              </div>
              <div className="mockup-map-viewport">
                <div className="map-grid-overlay"></div>
                <svg className="map-route-svg" viewBox="0 0 400 240">
                  <motion.path
                    d="M 60 180 Q 180 80 340 120"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3.5"
                    strokeDasharray="6 6"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 1.4, ease: 'easeInOut' }}
                  />
                </svg>
                <div className="map-pin pin-1">
                  <span className="pin-number">1</span>
                  <div className="pin-popup">Fushimi Inari</div>
                </div>
                <div className="map-pin pin-2">
                  <span className="pin-number">2</span>
                  <div className="pin-popup">Tofuku-ji</div>
                </div>
                <div className="map-pin pin-3">
                  <span className="pin-number">3</span>
                  <div className="pin-popup">Gion Kaiseki</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE 3: LIVE WEATHER & PACKING LIST (3D CARD) */}
        <motion.div 
          className="feature-3d-row"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="feature-3d-text">
            <div className="step-tag-pill amber">
              <Sun size={14} /> Step 03 / Intelligence
            </div>
            <h3 className="feature-3d-title">Live Weather & Smart Packing</h3>
            <span className="feature-3d-highlight text-amber-400">Open-Meteo & Multi-Currency</span>
            <p className="feature-3d-desc">
              Accurate 4-day weather forecasts tied to your travel window, dynamic multi-currency converter (USD, INR, EUR, JPY, GBP), and automated interactive packing checklists.
            </p>
            <div className="feature-badges-list">
              <span className="f-badge">☀️ 4-Day Forecasts</span>
              <span className="f-badge">🧳 Categorized Gear</span>
              <span className="f-badge">💱 8 Currency Conversions</span>
            </div>
            <button onClick={() => navigate('/plan')} className="feature-action-btn amber-btn">
              <span>Start Prepared Trip</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="feature-3d-visual">
            <div className="card-3d-glass card-tilt-right">
              <div className="visual-window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="visual-title">Open-Meteo Forecast & Checklist</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="mockup-weather-bar">
                  <div className="weather-day-box">
                    <span className="day-name">Thu</span>
                    <Sun size={18} className="text-amber-400 my-1" />
                    <span className="temp-range">22° / 14°</span>
                  </div>
                  <div className="weather-day-box active">
                    <span className="day-name">Fri</span>
                    <CloudSun size={18} className="text-cyan-400 my-1" />
                    <span className="temp-range">24° / 15°</span>
                  </div>
                  <div className="weather-day-box">
                    <span className="day-name">Sat</span>
                    <Sun size={18} className="text-amber-400 my-1" />
                    <span className="temp-range">21° / 13°</span>
                  </div>
                  <div className="weather-day-box">
                    <span className="day-name">Sun</span>
                    <CloudSun size={18} className="text-cyan-400 my-1" />
                    <span className="temp-range">19° / 12°</span>
                  </div>
                </div>

                <div className="mockup-packing-box">
                  <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                    <span>AI Packing Essentials</span>
                    <span className="text-emerald-400">3/4 Packed</span>
                  </div>
                  <div className="packing-items-grid">
                    <div className="packing-item checked">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Comfortable walking sneakers</span>
                    </div>
                    <div className="packing-item checked">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      <span>Type-A adapter & power bank</span>
                    </div>
                    <div className="packing-item">
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600"></div>
                      <span>Lightweight rain jacket</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FEATURE 4: ASK WANDERBOT COMPANION (3D CARD) */}
        <motion.div 
          className="feature-3d-row reverse"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
        >
          <div className="feature-3d-text">
            <div className="step-tag-pill purple">
              <Bot size={14} /> Step 04 / Collaboration
            </div>
            <h3 className="feature-3d-title">Ask WanderBot & Social Sharing</h3>
            <span className="feature-3d-highlight text-purple-400">Your 24/7 AI Travel Assistant</span>
            <p className="feature-3d-desc">
              Get immediate answers for local tipping customs, metro transit directions, and hidden neighborhood gems. Share read-only trip URLs or fork itineraries into your own dashboard in one click.
            </p>
            <div className="feature-badges-list">
              <span className="f-badge">💬 24/7 Conversational Help</span>
              <span className="f-badge">🔗 Read-only Public Links</span>
              <span className="f-badge">📑 Duplicate & Fork Trips</span>
            </div>
            <button onClick={() => navigate('/explore')} className="feature-action-btn purple-btn">
              <span>Explore Master Trips</span>
              <ArrowRight size={15} />
            </button>
          </div>

          <div className="feature-3d-visual">
            <div className="card-3d-glass card-tilt-left">
              <div className="visual-window-header">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
                <span className="visual-title">WanderBot Live Assistant</span>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div className="mockup-chat-feed">
                  <div className="chat-bubble user">
                    <p className="text-xs">How do I reach Arashiyama bamboo grove early?</p>
                  </div>
                  <div className="chat-bubble bot">
                    <div className="bot-avatar-mini">
                      <Bot size={12} />
                    </div>
                    <p className="text-xs leading-relaxed text-slate-200">
                      Take the JR San-in line from Kyoto Station to Saga-Arashiyama (15 mins). Arrive before 8:00 AM for tranquil photography without tour crowds!
                    </p>
                  </div>
                </div>
                <div className="mockup-chat-input-bar">
                  <input 
                    type="text" 
                    disabled 
                    placeholder="Ask about trains, local etiquette, or hidden food..." 
                    className="chat-mock-input" 
                  />
                  <button className="chat-mock-send">
                    <Send size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 4. Section 3: Curated Master Itineraries Preview */}
      <section id="explore-preview-section" className="landing-explore-preview-section">
        <div className="explore-header-row">
          <div>
            <span className="section-pill">Handcrafted Journeys</span>
            <h2 className="text-3xl font-extrabold text-white">Popular Master Itineraries</h2>
            <p className="text-slate-400 text-sm mt-1">
              Preview real-world itineraries created by local explorers and AI.
            </p>
          </div>
          <button onClick={() => navigate('/explore')} className="view-all-dest-btn">
            <span>View All Destinations</span>
            <ArrowRight size={15} />
          </button>
        </div>

        <div className="landing-trips-grid">
          {CURATED_ITINERARIES.slice(0, 3).map((trip) => (
            <motion.div 
              key={trip.id}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.25 }}
              className="landing-trip-card glass-card"
              onClick={() => {
                sessionStorage.setItem('viewing_trip', JSON.stringify({
                  id: trip.id,
                  fromExplore: true,
                  destination: trip.destination,
                  start_date: new Date().toISOString().split('T')[0],
                  end_date: new Date(Date.now() + (trip.days.length - 1) * 86400000).toISOString().split('T')[0],
                  budget: trip.budget,
                  travel_style: trip.travel_style,
                  interests: trip.interests,
                  itinerary_data: {
                    destination: trip.destination,
                    summary: trip.summary,
                    estimated_total_cost: trip.estimated_total_cost,
                    days: trip.days,
                  }
                }));
                navigate('/trip/new');
              }}
            >
              <div className="landing-trip-img-wrap">
                <img src={trip.cover_image} alt={trip.destination} className="landing-trip-img" />
                <span className="landing-badge-cat">{trip.category}</span>
                <span className="landing-badge-duration"><Clock size={11} /> {trip.duration}</span>
              </div>
              <div className="landing-trip-content">
                <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-semibold mb-1">
                  <MapPin size={12} /> {trip.destination}
                </div>
                <h4 className="landing-trip-title">{trip.title}</h4>
                <p className="landing-trip-summary">{trip.summary.slice(0, 110)}...</p>
                <div className="landing-trip-footer">
                  <span className="landing-trip-cost">{trip.estimated_total_cost}</span>
                  <span className="landing-trip-preview-link">
                    View Plan <ArrowUpRight size={13} />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. Section 4: Final Reveal — Glassmorphic Auth & Guest Access (`#auth-section`) */}
      <section id="auth-section" className="scrolly-auth-section">
        <motion.div 
          className="auth-reveal-card glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <div className="auth-card-header text-center">
            <div className="auth-logo-badge">
              <Compass size={24} className="text-cyan-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-3 mb-1">
              {authMode === 'signin' ? 'Welcome Back to WanderPlan' : 'Begin Your Travel Odyssey'}
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              {authMode === 'signin' 
                ? 'Sign in to access your saved trips, bookmarks, and personalized itineraries.'
                : 'Create your free account in seconds. No credit card required.'}
            </p>
          </div>

          {/* Mode Switch Tabs */}
          <div className="auth-tab-switch">
            <button
              type="button"
              className={`auth-tab ${authMode === 'signin' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signin');
                setAuthError(null);
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`auth-tab ${authMode === 'signup' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('signup');
                setAuthError(null);
              }}
            >
              Create Account
            </button>
          </div>

          {authError && (
            <div className="auth-error-banner">
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <span className="text-xs text-red-300">{authError}</span>
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="auth-input-form">
            {authMode === 'signup' && (
              <div className="auth-field-group">
                <label className="auth-label">Full Name</label>
                <div className="auth-field-wrap">
                  <User size={16} className="field-icon text-slate-400" />
                  <input
                    type="text"
                    placeholder="Amelia Earhart"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="auth-text-input"
                  />
                </div>
              </div>
            )}

            <div className="auth-field-group">
              <label className="auth-label">Email Address</label>
              <div className="auth-field-wrap">
                <Mail size={16} className="field-icon text-slate-400" />
                <input
                  type="email"
                  placeholder="traveler@wanderplan.ai"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="auth-text-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field-group">
              <label className="auth-label">Password</label>
              <div className="auth-field-wrap">
                <Lock size={16} className="field-icon text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="auth-text-input"
                  required
                />
                <button
                  type="button"
                  className="field-toggle-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="auth-submit-btn"
            >
              {authLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{authMode === 'signin' ? 'Sign In to WanderPlan' : 'Create Free Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="auth-divider-row">
            <span className="divider-line"></span>
            <span className="divider-text">OR EXPERIENCE AS GUEST</span>
            <span className="divider-line"></span>
          </div>

          {/* Prominent Continue as Guest Button */}
          <button
            type="button"
            onClick={handleGuestLogin}
            className="guest-access-btn"
          >
            <Sparkles size={16} className="text-cyan-400" />
            <span>Continue as Guest Explorer (Instant Access)</span>
          </button>
        </motion.div>
      </section>
    </div>
  );
}
