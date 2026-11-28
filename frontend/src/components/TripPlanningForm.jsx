import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Compass, 
  Heart, 
  Loader2, 
  AlertCircle, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { generateItinerary } from '../services/api';
import ItineraryView from './ItineraryView';
import { useRouter } from '../services/router';
import { useLanguage } from '../context/LanguageContext';
import { getUserPreferences } from '../services/preferencesService';

const AVAILABLE_INTERESTS = [
  'History & Culture',
  'Food & Dining',
  'Nature & Outdoors',
  'Art & Museums',
  'Beaches & Relaxation',
  'Shopping',
  'Adventure & Sports',
  'Nightlife',
  'Local Hidden Gems',
  'Photography',
];

const BUDGET_OPTIONS = [
  { id: 'budget', label: 'Budget', description: 'Hostels, local food, transit', icon: '💰' },
  { id: 'moderate', label: 'Moderate', description: 'Comfortable hotels, casual dining', icon: '✨' },
  { id: 'luxury', label: 'Luxury', description: 'Premium stays, fine dining, private tours', icon: '👑' },
];

const STYLE_OPTIONS = [
  { id: 'relaxed', label: 'Relaxed', description: '1-2 activities/day, slow pace' },
  { id: 'balanced', label: 'Balanced', description: 'Good mix of sights and downtime' },
  { id: 'fast-paced', label: 'Fast-paced', description: 'Pack in every top highlight' },
];

export default function TripPlanningForm() {
  const { navigate } = useRouter();
  const { t } = useLanguage();

  const [formData, setFormData] = useState(() => {
    // Check if user came from Explore page "Customize" action
    const prefill = sessionStorage.getItem('prefill_planner');
    if (prefill) {
      try {
        const parsed = JSON.parse(prefill);
        sessionStorage.removeItem('prefill_planner');
        return {
          destination: parsed.destination || '',
          startDate: '',
          endDate: '',
          budget: parsed.budget || 'moderate',
          interests: parsed.interests || ['Food & Dining', 'History & Culture'],
          travelStyle: parsed.travelStyle || 'balanced',
        };
      } catch (e) {
        console.warn('Error reading prefill_planner:', e);
      }
    }
    return {
      destination: '',
      startDate: '',
      endDate: '',
      budget: 'moderate',
      interests: ['Food & Dining', 'History & Culture'],
      travelStyle: 'balanced',
    };
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [apiError, setApiError] = useState(null);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [userPrefs, setUserPrefs] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);

  const LOADING_STAGES = [
    { title: 'Connecting to Groq AI Engine...', desc: 'Analyzing destination highlights, optimal travel paces, and local secrets.' },
    { title: 'Synthesizing GPS Coordinates & OpenStreetMap Routes...', desc: 'Pinpointing accurate latitudes, longitudes, and walking directions.' },
    { title: 'Forecasting Open-Meteo Weather & Smart Packing...', desc: 'Checking seasonal temperatures, rain probability, and essentials.' },
    { title: 'Finalizing Day-by-Day Schedules & Budget Estimates...', desc: 'Assembling morning, afternoon, and evening timelines with verified costs.' },
  ];

  // Multi-stage progress indicator effect
  useEffect(() => {
    let interval;
    if (loading) {
      setLoadingStage(0);
      interval = setInterval(() => {
        setLoadingStage((prev) => (prev < LOADING_STAGES.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load user saved preferences on mount
  useEffect(() => {
    async function loadPrefs() {
      try {
        const prefs = await getUserPreferences();
        if (prefs) {
          setUserPrefs(prefs);
          setFormData((prev) => ({
            ...prev,
            budget: prev.budget === 'moderate' && prefs.default_budget ? prefs.default_budget : prev.budget,
            travelStyle: prev.travelStyle === 'balanced' && prefs.default_pace ? prefs.default_pace : prev.travelStyle,
          }));
        }
      } catch (err) {
        console.warn('Could not load preferences:', err);
      }
    }
    loadPrefs();
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!formData.destination.trim()) {
      newErrors.destination = 'Please enter a destination';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Select a start date';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Select an end date';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }

    if (!formData.budget) {
      newErrors.budget = 'Please select a budget level';
    }

    if (formData.interests.length === 0) {
      newErrors.interests = 'Select at least one interest';
    }

    if (!formData.travelStyle) {
      newErrors.travelStyle = 'Please choose a travel style';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInterestToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      const newInterests = exists
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest];
      
      if (errors.interests && newInterests.length > 0) {
        setErrors((prevErr) => ({ ...prevErr, interests: null }));
      }
      return { ...prev, interests: newInterests };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setLoading(true);

    try {
      const payload = {
        destination: formData.destination.trim(),
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: formData.budget,
        interests: formData.interests,
        travel_style: formData.travelStyle,
        dietary_notes: (showPreferences && userPrefs?.dietary_notes?.trim()) ? userPrefs.dietary_notes.trim() : undefined,
        mobility_notes: (showPreferences && userPrefs?.mobility_notes?.trim()) ? userPrefs.mobility_notes.trim() : undefined,
      };

      const result = await generateItinerary(payload);
      const tripObj = {
        id: 'new',
        destination: formData.destination.trim(),
        start_date: formData.startDate,
        end_date: formData.endDate,
        budget: formData.budget,
        travel_style: formData.travelStyle,
        interests: formData.interests,
        itinerary_data: result?.data?.itinerary || result?.data || payload,
        created_at: new Date().toISOString(),
      };
      // Save directly into session and navigate to the rich Trip View with Map & Weather
      sessionStorage.setItem('viewing_trip', JSON.stringify(tripObj));
      navigate('/trip/new');
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.message ||
        'Failed to connect to backend service. Please ensure the FastAPI server is running.';
      setApiError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="planner-wrapper">
      {generatedTrip ? (
        <ItineraryView
          tripData={generatedTrip}
          onModify={() => setGeneratedTrip(null)}
          onSaved={() => navigate('/dashboard')}
        />
      ) : (
        <div className="form-card glass-card">
          <div className="card-top-decoration" />
          
          <form onSubmit={handleSubmit} className="form-grid" noValidate>
            {/* Destination */}
            <div className="form-group">
              <label htmlFor="destination">
                <MapPin size={16} className="label-icon" /> Where are you traveling? *
              </label>
              <input
                id="destination"
                type="text"
                className={`input-text glow-focus ${errors.destination ? 'input-error' : ''}`}
                placeholder="e.g. Kyoto, Japan or Florence, Italy"
                value={formData.destination}
                onChange={(e) => {
                  setFormData({ ...formData, destination: e.target.value });
                  if (errors.destination) setErrors({ ...errors, destination: null });
                }}
                disabled={loading}
              />
              {errors.destination && <span className="field-error">{errors.destination}</span>}
            </div>

            {/* Travel Dates */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">
                  <Calendar size={16} className="label-icon" /> Start Date *
                </label>
                <input
                  id="startDate"
                  type="date"
                  className={`input-text glow-focus ${errors.startDate ? 'input-error' : ''}`}
                  value={formData.startDate}
                  onChange={(e) => {
                    setFormData({ ...formData, startDate: e.target.value });
                    if (errors.startDate) setErrors({ ...errors, startDate: null });
                  }}
                  disabled={loading}
                />
                {errors.startDate && <span className="field-error">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">
                  <Calendar size={16} className="label-icon" /> End Date *
                </label>
                <input
                  id="endDate"
                  type="date"
                  className={`input-text glow-focus ${errors.endDate ? 'input-error' : ''}`}
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={(e) => {
                    setFormData({ ...formData, endDate: e.target.value });
                    if (errors.endDate) setErrors({ ...errors, endDate: null });
                  }}
                  disabled={loading}
                />
                {errors.endDate && <span className="field-error">{errors.endDate}</span>}
              </div>
            </div>

            {/* Budget Selection */}
            <div className="form-group">
              <label>
                <DollarSign size={16} className="label-icon" /> {t('selectBudget')} *
              </label>
              <div className="radio-cards">
                {BUDGET_OPTIONS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`radio-card interactive-hover ${formData.budget === tier.id ? 'active' : ''}`}
                    onClick={() => !loading && setFormData({ ...formData, budget: tier.id })}
                  >
                    <span className="radio-emoji">{tier.icon}</span>
                    <div className="radio-title">{t(`${tier.id}Label`) || tier.label}</div>
                    <div className="radio-desc">{t(`${tier.id}Desc`) || tier.description}</div>
                  </div>
                ))}
              </div>
              {errors.budget && <span className="field-error">{errors.budget}</span>}
            </div>

            {/* Travel Pace & Style */}
            <div className="form-group">
              <label>
                <Compass size={16} className="label-icon" /> {t('travelStyleLabel')} *
              </label>
              <div className="radio-cards">
                {STYLE_OPTIONS.map((style) => {
                  const styleKey = style.id === 'fast-paced' ? 'fastPaced' : style.id;
                  return (
                    <div
                      key={style.id}
                      className={`radio-card interactive-hover ${formData.travelStyle === style.id ? 'active' : ''}`}
                      onClick={() => !loading && setFormData({ ...formData, travelStyle: style.id })}
                    >
                      <div className="radio-title">{t(`${styleKey}Label`) || style.label}</div>
                      <div className="radio-desc">{t(`${styleKey}Desc`) || style.description}</div>
                    </div>
                  );
                })}
              </div>
              {errors.travelStyle && <span className="field-error">{errors.travelStyle}</span>}
            </div>

            {/* Interests & Activities */}
            <div className="form-group">
              <label>
                <Heart size={16} className="label-icon" /> {t('interestsLabel')} *
              </label>
              <div className="chips-container">
                {AVAILABLE_INTERESTS.map((interest) => {
                  const selected = formData.interests.includes(interest);
                  return (
                    <button
                      type="button"
                      key={interest}
                      className={`chip-btn ${selected ? 'active' : ''}`}
                      onClick={() => !loading && handleInterestToggle(interest)}
                      disabled={loading}
                    >
                      {selected ? '✓ ' : '+ '}
                      {interest}
                    </button>
                  );
                })}
              </div>
              {errors.interests && <span className="field-error">{errors.interests}</span>}
            </div>

            {/* Optional Dietary & Mobility Preferences (Toggleable Accordion) */}
            <div className="form-group" style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setShowPreferences(prev => !prev)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#f1f5f9',
                  cursor: 'pointer',
                  padding: 0,
                  fontSize: '0.92rem',
                  fontWeight: 700,
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sliders size={15} color="#38bdf8" />
                  <span>Dietary & Accessibility Preferences</span>
                  <span style={{ fontSize: '0.72rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>
                    {showPreferences ? 'Active' : 'Optional'}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                  {showPreferences ? '▲ Hide' : '▼ Add Preferences'}
                </span>
              </button>

              {showPreferences && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.85rem', marginTop: '1rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div>
                    <label htmlFor="dietary_notes" style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      🥗 Dietary Notes (e.g. Vegetarian, Halal, Gluten-Free)
                    </label>
                    <input
                      id="dietary_notes"
                      type="text"
                      className="input-text glow-focus"
                      placeholder="e.g. Vegetarian, no shellfish"
                      value={userPrefs?.dietary_notes || ''}
                      onChange={(e) => setUserPrefs(prev => ({ ...prev, dietary_notes: e.target.value }))}
                      disabled={loading}
                      style={{ fontSize: '0.86rem', padding: '0.55rem 0.85rem' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="mobility_notes" style={{ fontSize: '0.82rem', color: '#94a3b8', display: 'block', marginBottom: '0.35rem' }}>
                      🚶 Mobility & Pace Needs
                    </label>
                    <input
                      id="mobility_notes"
                      type="text"
                      className="input-text glow-focus"
                      placeholder="e.g. Avoid steep stairs, wheelchair accessible"
                      value={userPrefs?.mobility_notes || ''}
                      onChange={(e) => setUserPrefs(prev => ({ ...prev, mobility_notes: e.target.value }))}
                      disabled={loading}
                      style={{ fontSize: '0.86rem', padding: '0.55rem 0.85rem' }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn btn-glow-large" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Generating Itinerary with Groq AI...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> {t('generateBtn')}
                </>
              )}
            </button>
          </form>

          {/* Multi-Stage Animated AI Loading State */}
          {loading && (
            <div 
              style={{ 
                marginTop: '1.75rem', 
                padding: '1.5rem', 
                borderRadius: '16px', 
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 58, 138, 0.4) 100%)', 
                border: '1px solid rgba(56, 189, 248, 0.3)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={20} color="#38bdf8" className="spinner" />
                </div>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    {LOADING_STAGES[loadingStage].title}
                  </h4>
                  <p style={{ fontSize: '0.84rem', color: '#94a3b8', margin: '0.2rem 0 0 0' }}>
                    {LOADING_STAGES[loadingStage].desc}
                  </p>
                </div>
              </div>

              {/* Stage Progress Bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
                <div 
                  style={{ 
                    height: '100%', 
                    width: `${((loadingStage + 1) / LOADING_STAGES.length) * 100}%`, 
                    background: 'linear-gradient(90deg, #38bdf8 0%, #3b82f6 50%, #8b5cf6 100%)',
                    borderRadius: '999px',
                    transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                  }} 
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.65rem', fontSize: '0.74rem', color: '#64748b', fontWeight: 600 }}>
                <span>Phase {loadingStage + 1} of {LOADING_STAGES.length}</span>
                <span>Optimizing with Groq LLaMA</span>
              </div>
            </div>
          )}

          {/* Error state display */}
          {apiError && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              <div>
                <strong>Generation Error:</strong>
                <p>{apiError}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
