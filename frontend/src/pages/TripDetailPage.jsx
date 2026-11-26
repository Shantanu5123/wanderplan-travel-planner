import React, { useState, useEffect } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useCurrency } from '../context/CurrencyContext';
import { exportItineraryToPDF } from '../services/pdfExporter';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Compass, 
  Coins, 
  Download, 
  Share2, 
  Check, 
  Trash2, 
  Sparkles, 
  Clock, 
  Loader2,
  BookmarkCheck,
  FileText
} from 'lucide-react';

export default function TripDetailPage({ tripId }) {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { formatCost } = useCurrency();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDayTab, setActiveDayTab] = useState(1);
  const [copied, setCopied] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function loadTrip() {
      // 1. Check if viewing a newly generated chatbot plan or curated explore plan stored in cache
      const cached = sessionStorage.getItem('viewing_trip') || localStorage.getItem('wanderbot_last_plan');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!tripId || tripId === 'new' || parsed.id === tripId) {
            const normalized = {
              ...parsed,
              itinerary_data: parsed.itinerary_data || parsed.itinerary || parsed,
            };
            setTrip(normalized);
            if (normalized.itinerary_data?.days?.length > 0) {
              setActiveDayTab(normalized.itinerary_data.days[0].day_number || 1);
            }
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn('Cache parse error:', e);
        }
      }

      // 2. Check local trips list
      if (tripId && tripId !== 'new') {
        try {
          const localStored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
          const match = localStored.find((t) => t.id === tripId);
          if (match) {
            const normalized = {
              ...match,
              itinerary_data: match.itinerary_data || match.itinerary || match,
            };
            setTrip(normalized);
            if (normalized.itinerary_data?.days?.length > 0) {
              setActiveDayTab(normalized.itinerary_data.days[0].day_number || 1);
            }
            setLoading(false);
            return;
          }
        } catch (e) {}
      }

      // 3. Fetch from Supabase by tripId
      if (tripId && tripId !== 'new') {
        try {
          const { data, error } = await supabase
            .from('trips')
            .select('*')
            .eq('id', tripId)
            .single();

          if (!error && data) {
            setTrip(data);
            if (data.itinerary_data?.days?.length > 0) {
              setActiveDayTab(data.itinerary_data.days[0].day_number || 1);
            }
          }
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    }

    loadTrip();
  }, [tripId]);

  const handleSaveToDashboard = async () => {
    if (!user) {
      alert('Please sign in or create an account to save trips to your dashboard!');
      return;
    }
    if (!trip) return;

    setSaveLoading(true);

    const today = trip.start_date || new Date().toISOString().split('T')[0];
    const endDate = trip.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const tripRecord = {
      id: 'trip_' + Date.now(),
      user_id: user.id,
      destination: trip.destination,
      start_date: today,
      end_date: endDate,
      budget: trip.budget || 'moderate',
      travel_style: trip.travel_style || 'balanced',
      interests: trip.interests || [],
      itinerary_data: trip.itinerary_data,
      created_at: new Date().toISOString(),
    };

    // Save to local storage
    try {
      const stored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
      const updated = [tripRecord, ...stored.filter(item => item.id !== tripRecord.id)];
      localStorage.setItem('wanderplan_local_trips', JSON.stringify(updated));
    } catch (e) {}

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user.id);
    if (isUuid && !user.isGuest) {
      try {
        const { data } = await supabase.from('trips').insert([
          {
            user_id: user.id,
            destination: trip.destination,
            start_date: today,
            end_date: endDate,
            budget: trip.budget || 'moderate',
            travel_style: trip.travel_style || 'balanced',
            interests: trip.interests || [],
            itinerary_data: trip.itinerary_data,
          },
        ]).select();

        if (data?.[0]) {
          sessionStorage.setItem('viewing_trip', JSON.stringify(data[0]));
        }
      } catch (e) {
        console.warn('Supabase insert warning:', e);
      }
    }

    setSavedSuccess(true);
    setSaveLoading(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={36} className="spinner" style={{ color: '#3b82f6', marginBottom: '1rem' }} />
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>Loading itinerary details...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="glass-card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center', padding: '3rem 2rem' }}>
        <h2 style={{ color: '#ffffff', fontSize: '1.8rem' }}>Trip Not Found</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.65rem', lineHeight: 1.6 }}>We couldn't locate this trip in your records. It may have been removed or expired.</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ marginTop: '1.75rem' }}>
          <ArrowLeft size={16} /> Back to My Trips
        </button>
      </div>
    );
  }

  const itinerary = trip.itinerary_data || trip.itinerary || {};
  const days = itinerary.days || [];
  const activeDay = days.find((d) => (d.day_number || 1) === activeDayTab) || days[0];

  const handleExportPDF = () => {
    exportItineraryToPDF({ trip, itinerary, formatCost });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    setDeleteLoading(true);
    try {
      if (trip.id && trip.id !== 'new') {
        await supabase.from('trips').delete().eq('id', trip.id);
      }
      sessionStorage.removeItem('viewing_trip');
      navigate('/dashboard');
    } catch (err) {
      alert('Failed to delete trip');
    } finally {
      setDeleteLoading(false);
    }
  };

  const isExploreSample = Boolean(trip.fromExplore || (typeof trip.id === 'string' && trip.id.startsWith('curated_')));

  return (
    <div style={{ width: '100%', minHeight: '100vh', padding: '2.5rem 1rem 6rem 1rem' }}>
      <div style={{ maxWidth: '1040px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Navigation Breadcrumb / Back Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button 
            onClick={() => navigate(isExploreSample ? '/explore' : '/dashboard')} 
            className="btn-secondary"
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '12px',
            }}
          >
            <ArrowLeft size={16} color="#60a5fa" /> {isExploreSample ? 'Back to Explore' : 'Back to My Trips'}
          </button>

          <span style={{ fontSize: '0.88rem', color: '#cbd5e1', fontWeight: 600 }}>
            {days.length} Days Planned • {trip.travel_style || 'Balanced'} Pace
          </span>
        </div>

        {/* Hero Card with Frosted Glass & Ambient Banner */}
        <div className="glass-card" style={{ borderRadius: '24px', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, rgba(30, 41, 65, 0.85) 0%, rgba(15, 23, 42, 0.95) 100%)', padding: '3rem 2.5rem', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.16)', backdropFilter: 'blur(10px)', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '1rem', color: '#60a5fa' }}>
              <Sparkles size={14} /> Full Trip Itinerary
            </div>
            <h1 style={{ fontSize: '2.8rem', fontWeight: 850, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
              {trip.destination}
            </h1>
            <p style={{ marginTop: '0.85rem', fontSize: '1.08rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: '860px' }}>
              {itinerary.summary || 'Custom generated day-by-day travel itinerary.'}
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
              {trip.start_date && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                  <Calendar size={14} color="#60a5fa" /> {trip.start_date} {trip.end_date ? `→ ${trip.end_date}` : ''}
                </span>
              )}
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                <Compass size={14} color="#6366f1" /> {trip.travel_style || 'Balanced'} Pace
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.14)', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>
                <Coins size={14} color="#f59e0b" /> {trip.budget || 'Moderate'} Budget
              </span>
              {itinerary.estimated_total_cost && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(59, 130, 246, 0.18)', backdropFilter: 'blur(8px)', border: '1px solid rgba(59, 130, 246, 0.35)', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa' }}>
                  Est. Cost: {formatCost(itinerary.estimated_total_cost)}
                </span>
              )}
            </div>
          </div>

          {/* Action Toolbar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.15rem 2.5rem', background: 'rgba(13, 18, 32, 0.75)', backdropFilter: 'blur(20px)', flexWrap: 'wrap' }}>
            {/* If from chatbot or explore and not saved yet */}
            {(!trip.id || trip.id === 'new') && (
              <button 
                onClick={handleSaveToDashboard} 
                disabled={saveLoading || savedSuccess}
                className="btn-glow" 
                style={{ padding: '0.6rem 1.3rem' }}
              >
                {saveLoading ? <Loader2 size={15} className="spinner" /> : <BookmarkCheck size={15} />}
                {savedSuccess ? 'Saved to My Trips!' : 'Save Trip'}
              </button>
            )}

            <button onClick={handleExportPDF} className="btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
              <Download size={15} /> Download PDF Itinerary
            </button>
            <button onClick={handleShare} className="btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
              {copied ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
              {copied ? 'Link Copied!' : 'Share Trip'}
            </button>

            {!isExploreSample && trip.id && trip.id !== 'new' && (
              <button 
                onClick={handleDelete} 
                disabled={deleteLoading}
                style={{
                  marginLeft: 'auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  padding: '0.55rem 1.1rem',
                  borderRadius: '10px',
                  fontSize: '0.88rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {deleteLoading ? <Loader2 size={15} className="spinner" /> : <Trash2 size={15} />}
                Delete Trip
              </button>
            )}
          </div>
        </div>

        {/* Day Tabs Switcher */}
        <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.25rem 0 0.5rem 0' }}>
          {days.map((day, idx) => {
            const num = day.day_number || idx + 1;
            const isActive = activeDayTab === num;
            return (
              <button
                key={num}
                onClick={() => setActiveDayTab(num)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.6rem',
                  borderRadius: '14px',
                  border: isActive ? '1px solid #3b82f6' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isActive ? 'rgba(59, 130, 246, 0.2)' : 'rgba(22, 30, 49, 0.55)',
                  backdropFilter: 'blur(16px)',
                  color: isActive ? '#ffffff' : '#cbd5e1',
                  fontWeight: isActive ? 800 : 600,
                  fontSize: '0.98rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 4px 18px rgba(59, 130, 246, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)' : 'inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                }}
              >
                <span>Day {num}</span>
              </button>
            );
          })}
        </div>

        {/* Active Day Card (Frosted Glass Container) */}
        {activeDay ? (
          <div className="glass-card" style={{ padding: '2.5rem', borderRadius: '24px' }}>
            <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.5rem', marginBottom: '2rem' }}>
              <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', fontWeight: 800, fontSize: '0.82rem', padding: '0.4rem 0.9rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                Day {activeDay.day_number || activeDayTab} Schedule
              </span>
              <h2 style={{ fontSize: '1.9rem', fontWeight: 850, color: '#ffffff', marginTop: '0.85rem', letterSpacing: '-0.02em' }}>
                {activeDay.theme || 'Exploration & Activities'}
              </h2>
              {activeDay.date && (
                <span style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                  {activeDay.date}
                </span>
              )}
            </div>

            {/* Activities List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {activeDay.activities?.map((act, actIdx) => (
                <div 
                  key={actIdx} 
                  className="activity-card"
                  style={{
                    display: 'flex',
                    gap: '1.5rem',
                    padding: '1.5rem',
                  }}
                >
                  <div className="activity-time-badge">
                    {act.time_slot || 'Activity'}
                  </div>

                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 0.45rem 0', fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                      {act.title}
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.96rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                      {act.description}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                      {act.location && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0' }}>
                          <MapPin size={16} color="#60a5fa" /> {act.location}
                        </span>
                      )}
                      {act.cost_estimate && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#10b981' }}>
                          <Coins size={16} /> {formatCost(act.cost_estimate)}
                        </span>
                      )}
                    </div>

                    {act.travel_tips && (
                      <div className="activity-tip">
                        <strong>Local Tip:</strong> {act.travel_tips}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
