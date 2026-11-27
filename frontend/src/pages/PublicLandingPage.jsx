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
  Check
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

  // Sticky Feature Container transforms & auto-cycling when not scrolled
  const featureContainerRef = useRef(null);
  const { scrollYProgress: featureProgress } = useScroll({
    target: featureContainerRef,
    offset: ['start start', 'end end']
  });

  // Active step (0, 1, 2, 3) derived from scroll progress or manual click
  const [activeStep, setActiveStep] = useState(0);

  // Auto-cycle through the feature stages every 4.5 seconds if user is viewing the stage
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  // Feature steps definition
  const featureSteps = [
    {
      id: '01',
      title: 'AI Daily Itinerary Architect',
      subtitle: 'Powered by LLaMA 3.3 70B',
      desc: 'Smart, balanced daily schedules featuring morning sights, hidden culinary spots, and twilight highlights customized to your travel style and budget.',
      accent: 'from-blue-500/20 to-cyan-500/10',
      glowColor: 'rgba(56, 189, 248, 0.25)',
      badge: 'Step 01 / Generation'
    },
    {
      id: '02',
      title: 'Interactive Leaflet GPS Routes',
      subtitle: 'OpenStreetMap & Smart Coordinates',
      desc: 'Visual split-screen mapping with numbered stops, connected travel polylines, clickable location cards, and instant directions to navigate with confidence.',
      accent: 'from-emerald-500/20 to-teal-500/10',
      glowColor: 'rgba(52, 211, 153, 0.25)',
      badge: 'Step 02 / Navigation'
    },
    {
      id: '03',
      title: 'Live Weather, Currency & Packing',
      subtitle: 'Open-Meteo & Intelligent Prep',
      desc: 'Real-time forecasts, multi-currency live conversions (USD, INR, EUR, JPY, GBP), and dynamic smart packing checklists sorted by clothing, gear, and essentials.',
      accent: 'from-amber-500/20 to-orange-500/10',
      glowColor: 'rgba(251, 191, 36, 0.25)',
      badge: 'Step 03 / Intelligence'
    },
    {
      id: '04',
      title: 'Ask WanderBot & Social Forking',
      subtitle: 'Persistent Travel Assistant',
      desc: 'Your on-demand conversational guide for local etiquette, emergency advice, and hidden gems. Share read-only trip URLs or fork itineraries into your own dashboard.',
      accent: 'from-purple-500/20 to-pink-500/10',
      glowColor: 'rgba(192, 132, 252, 0.25)',
      badge: 'Step 04 / Collaboration'
    }
  ];

  const ambientGlowColors = [
    'radial-gradient(circle at 65% 50%, rgba(56, 189, 248, 0.16) 0%, transparent 60%)',
    'radial-gradient(circle at 65% 50%, rgba(52, 211, 153, 0.16) 0%, transparent 60%)',
    'radial-gradient(circle at 65% 50%, rgba(251, 191, 36, 0.14) 0%, transparent 60%)',
    'radial-gradient(circle at 65% 50%, rgba(192, 132, 252, 0.16) 0%, transparent 60%)'
  ];

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
              <span>Explore</span>
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

        {/* Floating Parallax Destination Cards */}
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
            if (featureContainerRef.current) {
              featureContainerRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }}
        >
          <span className="scroll-indicator-text">Scroll to experience the journey</span>
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="scroll-indicator-icon"
          >
            <ChevronDown size={18} />
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Section 2: Sticky Scroll-Morphing Feature Stage */}
      <section ref={featureContainerRef} className="scrolly-feature-container">
        {/* Dynamic ambient background glow that shifts with activeStep */}
        <div 
          className="scrolly-ambient-glow"
          style={{
            backgroundImage: ambientGlowColors[activeStep]
          }}
        />

        <div className="scrolly-sticky-viewport">
          <div className="scrolly-stage-grid">
            
            {/* Left Column: Active Step Details & Step Tracker */}
            <div className="scrolly-left-col">
              <div className="step-counter-track">
                {featureSteps.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`step-track-node ${activeStep === idx ? 'active' : ''} ${activeStep > idx ? 'completed' : ''}`}
                    onClick={() => setActiveStep(idx)}
                  >
                    <div className="node-indicator">
                      {activeStep > idx ? <Check size={12} /> : step.id}
                    </div>
                    <span className="node-label">{step.title.split(' ')[0]}</span>
                  </div>
                ))}
              </div>

              <div className="scrolly-text-content">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                    className="step-text-block"
                  >
                    <span className="step-badge-pill">
                      {featureSteps[activeStep].badge}
                    </span>
                    <h2 className="step-main-title">
                      {featureSteps[activeStep].title}
                    </h2>
                    <h4 className="step-sub-title">
                      {featureSteps[activeStep].subtitle}
                    </h4>
                    <p className="step-description">
                      {featureSteps[activeStep].desc}
                    </p>

                    <div className="step-cta-row">
                      <button 
                        onClick={() => navigate('/plan')}
                        className="step-primary-btn"
                      >
                        <span>Try Feature Now</span>
                        <ArrowRight size={15} />
                      </button>
                      <button 
                        onClick={scrollToAuth}
                        className="step-secondary-btn"
                      >
                        <span>Sign In</span>
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Dynamic Morphing Glassmorphic UI Frame */}
            <div className="scrolly-right-col">
              <div className="scrolly-ui-frame glass-card">
                {/* Browser-like window header */}
                <div className="ui-frame-header">
                  <div className="ui-frame-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                  </div>
                  <div className="ui-frame-title">
                    <Compass size={13} className="text-cyan-400" />
                    <span>WanderPlan Interactive Stage</span>
                  </div>
                  <div className="ui-frame-badge">
                    <span className="status-ping"></span> Live Simulation
                  </div>
                </div>

                {/* Morphing Window Body */}
                <div className="ui-frame-body">
                  <AnimatePresence mode="wait">
                    {activeStep === 0 && (
                      <motion.div
                        key="step-0-itinerary"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        className="stage-mockup-wrapper"
                      >
                        <div className="mockup-header-row">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-cyan-400 font-bold">Generated Itinerary</span>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                              Kyoto, Japan <span className="text-xs text-slate-400 font-normal">Day 1 of 4</span>
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            Balanced Pace
                          </span>
                        </div>

                        <div className="mockup-cards-stack">
                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="mockup-activity-card"
                          >
                            <div className="slot-badge morning">Morning</div>
                            <div className="card-info">
                              <div className="font-semibold text-white text-sm">Fushimi Inari Torii Gate Hike</div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>📍 Fushimi Ward</span>
                                <span>•</span>
                                <span className="text-emerald-400">Free admission</span>
                              </div>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                          </motion.div>

                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mockup-activity-card"
                          >
                            <div className="slot-badge afternoon">Afternoon</div>
                            <div className="card-info">
                              <div className="font-semibold text-white text-sm">Tofuku-ji Zen Rock Gardens</div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>📍 Higashiyama</span>
                                <span>•</span>
                                <span className="text-cyan-400">¥500 ($3.50)</span>
                              </div>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                          </motion.div>

                          <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mockup-activity-card"
                          >
                            <div className="slot-badge evening">Evening</div>
                            <div className="card-info">
                              <div className="font-semibold text-white text-sm">Gion Lantern Walk & Kaiseki Dinner</div>
                              <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>📍 Gion District</span>
                                <span>•</span>
                                <span className="text-amber-400">Local Cuisine</span>
                              </div>
                            </div>
                            <ArrowUpRight size={14} className="text-slate-500 ml-auto" />
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 1 && (
                      <motion.div
                        key="step-1-map"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        className="stage-mockup-wrapper"
                      >
                        <div className="mockup-header-row">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Interactive Route</span>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                              Leaflet GPS Polyline <span className="text-xs text-slate-400 font-normal">3 Stops Plotted</span>
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            OSM Satellite
                          </span>
                        </div>

                        {/* Interactive map mock visualization */}
                        <div className="mockup-map-viewport">
                          <div className="map-grid-overlay"></div>
                          
                          {/* Animated SVG polyline connecting pins */}
                          <svg className="map-route-svg" viewBox="0 0 400 240">
                            <motion.path
                              d="M 60 180 Q 180 80 340 120"
                              fill="none"
                              stroke="#34d399"
                              strokeWidth="3"
                              strokeDasharray="6 6"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.2, ease: 'easeInOut' }}
                            />
                          </svg>

                          {/* Pin 1 */}
                          <motion.div 
                            className="map-pin pin-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="pin-number">1</span>
                            <div className="pin-popup">Fushimi Inari</div>
                          </motion.div>

                          {/* Pin 2 */}
                          <motion.div 
                            className="map-pin pin-2"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            <span className="pin-number">2</span>
                            <div className="pin-popup">Tofuku-ji</div>
                          </motion.div>

                          {/* Pin 3 */}
                          <motion.div 
                            className="map-pin pin-3"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6 }}
                          >
                            <span className="pin-number">3</span>
                            <div className="pin-popup">Gion Kaiseki</div>
                          </motion.div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 2 && (
                      <motion.div
                        key="step-2-weather-packing"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        className="stage-mockup-wrapper"
                      >
                        <div className="mockup-header-row">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">Smart Trip Prep</span>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                              Open-Meteo & Multi-Currency
                            </h3>
                          </div>
                          <div className="flex gap-1.5">
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300">USD</span>
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">INR</span>
                            <span className="px-2 py-0.5 rounded text-xs font-semibold bg-slate-800 text-slate-300">EUR</span>
                          </div>
                        </div>

                        {/* Weather forecast bar preview */}
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

                        {/* Dynamic packing checklist mock */}
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
                              <span>Japan Rail Pass & Suica card</span>
                            </div>
                            <div className="packing-item checked">
                              <CheckCircle2 size={14} className="text-emerald-400" />
                              <span>Type-A power adapter & power bank</span>
                            </div>
                            <div className="packing-item">
                              <div className="w-3.5 h-3.5 rounded-full border border-slate-600"></div>
                              <span>Lightweight rain jacket</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {activeStep === 3 && (
                      <motion.div
                        key="step-3-wanderbot"
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.4 }}
                        className="stage-mockup-wrapper"
                      >
                        <div className="mockup-header-row">
                          <div>
                            <span className="text-xs uppercase tracking-wider text-purple-400 font-bold">Instant Companion</span>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
                              Ask WanderBot AI
                            </h3>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1.5">
                            <Bot size={12} /> Online 24/7
                          </span>
                        </div>

                        {/* WanderBot Chat preview */}
                        <div className="mockup-chat-feed">
                          <div className="chat-bubble user">
                            <p className="text-xs">What is the best way to get to Arashiyama bamboo grove early?</p>
                          </div>
                          <div className="chat-bubble bot">
                            <div className="bot-avatar-mini">
                              <Bot size={12} />
                            </div>
                            <p className="text-xs leading-relaxed text-slate-200">
                              Take the JR San-in line from Kyoto Station to Saga-Arashiyama (15 mins). Arrive before 8:00 AM to enjoy tranquil photography without tour crowds!
                            </p>
                          </div>
                        </div>

                        <div className="mockup-chat-input-bar">
                          <input 
                            type="text" 
                            disabled 
                            placeholder="Ask about local trains, currency, or hidden ramen shops..." 
                            className="chat-mock-input" 
                          />
                          <button className="chat-mock-send">
                            <Send size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Fallback: Vertical Animated Cards (< 768px) */}
        <div className="scrolly-mobile-cards">
          {featureSteps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="mobile-feature-card glass-card"
            >
              <div className="mobile-step-header">
                <span className="mobile-step-num">{step.id}</span>
                <span className="mobile-step-badge">{step.badge}</span>
              </div>
              <h3 className="mobile-step-title">{step.title}</h3>
              <p className="mobile-step-desc">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. Section 3: Final Reveal — Glassmorphic Auth & Guest Access (`#auth-section`) */}
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
