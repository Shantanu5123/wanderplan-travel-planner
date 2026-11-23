import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useRouter, Link } from '../services/router';
import { supabase } from '../services/supabaseClient';
import { 
  PlusCircle, 
  Calendar, 
  Compass, 
  ShieldAlert, 
  Sparkles, 
  Trash2, 
  Eye, 
  Loader2, 
  DollarSign, 
  ArrowRight, 
  Luggage,
  Clock,
  Plus
} from 'lucide-react';

const CITY_IMAGES = {
  tokyo: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=700&q=80',
  kyoto: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=700&q=80',
  paris: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=700&q=80',
  rome: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=700&q=80',
  florence: 'https://images.unsplash.com/photo-1543429776-2782fc8e1acd?auto=format&fit=crop&w=700&q=80',
  london: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=700&q=80',
  default: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=700&q=80',
};

function getDestinationImage(destination = '') {
  const lower = destination.toLowerCase();
  for (const [key, url] of Object.entries(CITY_IMAGES)) {
    if (lower.includes(key)) return url;
  }
  return CITY_IMAGES.default;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const { navigate } = useRouter();

  const [trips, setTrips] = useState([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (!user) {
      setLoadingTrips(false);
      return;
    }

    async function fetchUserTrips() {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setTrips(data);
        }
      } catch (err) {
        console.error('Error fetching trips:', err);
      } finally {
        setLoadingTrips(false);
      }
    }

    fetchUserTrips();
  }, [user]);

  const handleOpenTrip = (trip) => {
    sessionStorage.setItem('viewing_trip', JSON.stringify(trip));
    navigate(`/trip/${trip.id}`);
  };

  const handleDelete = async (tripId, e) => {
    if (e) e.stopPropagation();
    if (!confirm('Are you sure you want to delete this trip itinerary?')) return;
    setDeleteId(tripId);

    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripId);
      if (!error) {
        setTrips((prev) => prev.filter((t) => t.id !== tripId));
      }
    } catch (err) {
      alert('Failed to delete trip');
    } finally {
      setDeleteId(null);
    }
  };

  if (authLoading || loadingTrips) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '6rem 1rem' }}>
        <Loader2 size={36} className="spinner" style={{ margin: '0 auto 1rem auto', color: '#3b82f6' }} />
        <p style={{ color: '#cbd5e1', fontSize: '1.05rem' }}>Loading your itineraries...</p>
      </div>
    );
  }

  // Protected Route Guard
  if (!user) {
    return (
      <div className="container">
        <div className="protected-card glass-card" style={{ padding: '3.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '4rem auto' }}>
          <div className="protected-icon-wrap" style={{ marginBottom: '1.25rem' }}>
            <ShieldAlert size={40} color="#ef4444" style={{ margin: '0 auto' }} />
          </div>
          <h2 style={{ fontSize: '1.8rem', color: '#ffffff', fontWeight: 800 }}>Protected Access</h2>
          <p style={{ color: '#94a3b8', margin: '0.85rem 0 2rem 0', lineHeight: 1.6 }}>
            Your saved itineraries are protected and accessible only by you.
            Please sign in to view, edit, and access your planned trips.
          </p>
          <div className="protected-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/login" className="btn-glow">
              Sign In to Your Account
            </Link>
            <Link to="/signup" className="btn-secondary">
              Create an Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Traveler';

  return (
    <div className="container dashboard-container" style={{ maxWidth: '1140px', margin: '0 auto', padding: '2.5rem 1rem 6rem 1rem' }}>
      {/* Top Banner with Clean Polished Layout */}
      <div className="dashboard-hero-banner glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2.5rem', borderRadius: '24px', flexWrap: 'wrap', gap: '2rem' }}>
        <div className="hero-content" style={{ flex: '1 1 340px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            <Luggage size={14} /> Traveler Portfolio
          </div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 850, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            My Planned Journeys
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.05rem', marginTop: '0.65rem', lineHeight: 1.6 }}>
            {t('welcomeBack')}, <strong style={{ color: '#ffffff' }}>{userName}</strong>. Here are all your saved, AI-crafted itineraries.
          </p>
        </div>

        {/* Right Side: Clean Stat Box + Styled Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.85rem',
              background: 'rgba(255, 255, 255, 0.06)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.14)',
              padding: '0.65rem 1.25rem',
              borderRadius: '16px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#60a5fa', lineHeight: 1 }}>
              {trips.length}
            </span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 700, lineHeight: 1.2 }}>
                {t('savedTrips')}
              </span>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>
                {trips.length === 1 ? '1 journey' : `${trips.length} journeys`}
              </span>
            </div>
          </div>

          <Link 
            to="/" 
            className="btn-glow" 
            style={{ 
              padding: '0.75rem 1.4rem', 
              borderRadius: '14px',
              fontSize: '0.94rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              textDecoration: 'none',
              fontWeight: 700,
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.35)'
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>{t('planNewAdventure')}</span>
          </Link>
        </div>
      </div>

      {/* Trips Grid or Empty State */}
      {trips.length === 0 ? (
        <div className="empty-trips-card glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', marginTop: '2rem', borderRadius: '24px' }}>
          <div className="empty-icon-wrap" style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <Compass size={36} color="#60a5fa" />
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff' }}>Your passport is waiting!</h3>
          <p style={{ color: '#94a3b8', maxWidth: '520px', margin: '0.75rem auto 1.75rem auto', lineHeight: 1.6, fontSize: '0.96rem' }}>
            You haven't saved any trips yet. Generate your first day-by-day plan with AI
            and click <strong>"Save Trip"</strong> to see it here anytime.
          </p>
          <Link to="/" className="btn-glow" style={{ padding: '0.75rem 1.5rem', borderRadius: '12px' }}>
            <Sparkles size={16} /> Plan Your First Trip
          </Link>
        </div>
      ) : (
        <div className="trips-showcase-grid" style={{ marginTop: '2rem' }}>
          {trips.map((trip) => {
            const daysCount = trip.itinerary_data?.days?.length || 'Multi';
            const bgImage = getDestinationImage(trip.destination);

            return (
              <div 
                key={trip.id} 
                className="trip-showcase-card glass-card interactive-hover"
                onClick={() => handleOpenTrip(trip)}
              >
                {/* Media Image Banner */}
                <div className="card-cover">
                  <img src={bgImage} alt={trip.destination} loading="lazy" />
                  <div className="cover-overlay" />
                  <span className="cover-badge">{trip.travel_style || 'Balanced'}</span>
                  <div className="cover-title-group">
                    <h3>{trip.destination}</h3>
                    <span className="cover-dates">
                      <Calendar size={13} /> {trip.start_date} → {trip.end_date}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-info">
                  <p className="card-summary-snippet">
                    {trip.itinerary_data?.summary || 'Personalized AI day-by-day travel plan.'}
                  </p>

                  <div className="card-meta-pills">
                    <span><Clock size={12} /> {daysCount} Days</span>
                    <span><DollarSign size={12} /> {trip.budget}</span>
                    {trip.itinerary_data?.estimated_total_cost && (
                      <span>Est. {trip.itinerary_data.estimated_total_cost}</span>
                    )}
                  </div>

                  {/* Highlights / Interests */}
                  {trip.interests && trip.interests.length > 0 && (
                    <div className="card-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.85rem' }}>
                      {trip.interests.slice(0, 3).map((tag, i) => (
                        <span key={i} className="neon-pill-sm" style={{ fontSize: '0.72rem' }}>#{tag}</span>
                      ))}
                      {trip.interests.length > 3 && (
                        <span className="neon-pill-sm" style={{ fontSize: '0.72rem' }}>+{trip.interests.length - 3}</span>
                      )}
                    </div>
                  )}

                  {/* Actions Footer */}
                  <div className="card-footer-actions">
                    <button 
                      onClick={() => handleOpenTrip(trip)} 
                      className="btn-view-itinerary"
                    >
                      <Eye size={15} /> View Full Itinerary <ArrowRight size={14} />
                    </button>

                    <button
                      onClick={(e) => handleDelete(trip.id, e)}
                      className="btn-card-delete"
                      disabled={deleteId === trip.id}
                      title="Delete trip"
                    >
                      {deleteId === trip.id ? (
                        <Loader2 size={15} className="spinner" />
                      ) : (
                        <Trash2 size={15} />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
