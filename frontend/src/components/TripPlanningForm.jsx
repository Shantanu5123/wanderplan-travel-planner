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
  const [apiError, setApiError] = useState(null);
  const [generatedTrip, setGeneratedTrip] = useState(null);
  const [userPrefs, setUserPrefs] = useState(null);
  const [showPreferences, setShowPreferences] = useState(false);

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
      setGeneratedTrip(result?.data || payload);
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

          {/* Loading state indicator */}
          {loading && (
            <div className="alert alert-info">
              <Loader2 size={18} className="spinner" />
              <div>
                <strong>AI is crafting your customized itinerary...</strong>
                <p>Generating personalized day-by-day schedules, realistic travel times, and local tips with Groq.</p>
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
