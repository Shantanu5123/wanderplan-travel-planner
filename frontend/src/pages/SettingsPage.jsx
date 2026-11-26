import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency, SUPPORTED_CURRENCIES } from '../context/CurrencyContext';
import { getUserPreferences, saveUserPreferences } from '../services/preferencesService';
import { 
  Settings, 
  Save, 
  Check, 
  DollarSign, 
  Compass, 
  Utensils, 
  Accessibility, 
  Sparkles, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const { changeCurrency } = useCurrency();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [form, setForm] = useState({
    default_currency: 'USD',
    default_pace: 'balanced',
    default_budget: 'moderate',
    dietary_notes: '',
    mobility_notes: '',
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const pref = await getUserPreferences(user);
      setForm(pref);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await saveUserPreferences(user, form);
    changeCurrency(form.default_currency);
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="spinner" style={{ color: '#38bdf8', marginBottom: '1rem' }} />
        <p style={{ color: '#cbd5e1' }}>Loading travel preferences...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: '85vh', padding: '3.5rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ maxWidth: '780px', margin: '0 auto' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <Settings size={14} /> Traveler Preferences
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 850, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Travel Settings & Defaults
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '0.5rem', lineHeight: 1.6 }}>
            Set your default currency, budget, travel pace, dietary requirements, and accessibility notes. These automatically personalize every new itinerary Groq generates for you!
          </p>
        </div>

        {/* Form Card */}
        <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            
            {/* Currency */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <DollarSign size={16} color="#38bdf8" /> Default Display Currency
              </label>
              <select
                value={form.default_currency}
                onChange={(e) => setForm({ ...form, default_currency: e.target.value })}
                className="input-text glow-focus"
                style={{ background: 'rgba(8, 14, 28, 0.75)' }}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} style={{ background: '#0b1324', color: '#ffffff' }}>
                    {c.code} ({c.symbol}) - {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Travel Pace */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Compass size={16} color="#6366f1" /> Default Travel Pace
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'relaxed', label: 'Relaxed', desc: '1-2 activities/day' },
                  { id: 'balanced', label: 'Balanced', desc: 'Even mix' },
                  { id: 'fast-paced', label: 'Fast-paced', desc: 'Packed highlights' },
                ].map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setForm({ ...form, default_pace: p.id })}
                    className={`radio-card ${form.default_pace === p.id ? 'active' : ''}`}
                    style={{ padding: '0.9rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{p.label}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '0.2rem' }}>{p.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Default Budget Tier */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Sparkles size={16} color="#f59e0b" /> Default Budget Tier
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {[
                  { id: 'budget', label: 'Budget', icon: '💰' },
                  { id: 'moderate', label: 'Moderate', icon: '✨' },
                  { id: 'luxury', label: 'Luxury', icon: '👑' },
                ].map((b) => (
                  <div
                    key={b.id}
                    onClick={() => setForm({ ...form, default_budget: b.id })}
                    className={`radio-card ${form.default_budget === b.id ? 'active' : ''}`}
                    style={{ padding: '0.9rem', cursor: 'pointer', textAlign: 'center' }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{b.icon}</span>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '0.25rem' }}>{b.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dietary Notes */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Utensils size={16} color="#34d399" /> Dietary Requirements & Food Preferences
              </label>
              <input
                type="text"
                placeholder="e.g. Vegetarian, Halal, Gluten-free, love street food, no seafood"
                value={form.dietary_notes}
                onChange={(e) => setForm({ ...form, dietary_notes: e.target.value })}
                className="input-text glow-focus"
              />
              <span style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem', display: 'block' }}>
                WanderPlan will factor this into lunch & dinner stops in every generated itinerary.
              </span>
            </div>

            {/* Mobility Notes */}
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Accessibility size={16} color="#a78bfa" /> Mobility & Accessibility Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Prefer stroller-friendly paths, wheelchair accessible, avoid steep hiking"
                value={form.mobility_notes}
                onChange={(e) => setForm({ ...form, mobility_notes: e.target.value })}
                className="input-text glow-focus"
              />
              <span style={{ fontSize: '0.76rem', color: '#94a3b8', marginTop: '0.3rem', display: 'block' }}>
                AI will prioritize accessible attractions and realistic walking distances.
              </span>
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" disabled={saving} className="btn-glow-large" style={{ minWidth: '180px', justifyContent: 'center' }}>
                {saving ? (
                  <>
                    <Loader2 size={16} className="spinner" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>

              {savedSuccess && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.9rem' }}>
                  <Check size={16} />
                  <span>Preferences saved & applied!</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.76rem', color: '#64748b', marginTop: '0.5rem' }}>
              <ShieldCheck size={14} color="#34d399" /> Saved preferences are securely stored in your account & local storage.
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
