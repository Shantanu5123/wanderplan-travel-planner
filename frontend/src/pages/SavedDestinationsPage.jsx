import React, { useEffect, useState } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { getSavedDestinations, toggleSaveDestination } from '../services/preferencesService';
import { 
  Heart, 
  MapPin, 
  Clock, 
  Coins, 
  ArrowRight, 
  Compass, 
  Sparkles, 
  Trash2,
  BookmarkCheck,
  Globe2
} from 'lucide-react';

export default function SavedDestinationsPage() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { formatCost } = useCurrency();

  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const items = await getSavedDestinations(user);
      setSavedItems(items);
      setLoading(false);
    }
    load();
  }, [user]);

  const handleRemove = async (e, item) => {
    e.stopPropagation();
    await toggleSaveDestination(user, item);
    const key = item.slug || item.id;
    setSavedItems((prev) => prev.filter((it) => (it.slug || it.id) !== key));
  };

  const handleViewTrip = (item) => {
    sessionStorage.setItem('viewing_trip', JSON.stringify({
      ...item,
      itinerary_data: item.itinerary_data || {
        destination: item.destination,
        summary: item.summary,
        estimated_total_cost: item.estimated_total_cost,
        days: item.days,
      },
    }));
    navigate('/trip/new');
  };

  return (
    <div style={{ width: '100%', minHeight: '85vh', padding: '3rem 1.5rem 6rem 1.5rem' }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
        
        {/* Header Banner */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.45rem', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.85rem' }}>
            <Heart size={14} fill="#ef4444" /> Bookmarked Destinations
          </div>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 850, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Saved Destinations
          </h1>
          <p style={{ color: '#cbd5e1', fontSize: '1rem', marginTop: '0.5rem' }}>
            Your curated wishlist of dream destinations, inspiring regions, and travel ideas.
          </p>
        </div>

        {/* Loading state */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {[1, 2, 3].map((n) => (
              <div key={n} className="skeleton-shimmer" style={{ height: '360px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : savedItems.length === 0 ? (
          /* Empty state */
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '24px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <Heart size={28} color="#ef4444" />
            </div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
              No Saved Destinations Yet
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: '460px', margin: '0.65rem auto 1.75rem auto', lineHeight: 1.6 }}>
              Explore handpicked itineraries and tap the heart icon on any destination card to save it here for later.
            </p>
            <button onClick={() => navigate('/explore')} className="btn-glow" style={{ padding: '0.75rem 1.6rem' }}>
              <Compass size={16} /> Explore Destinations
            </button>
          </div>
        ) : (
          /* Saved Cards Grid */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
            {savedItems.map((item) => {
              const key = item.slug || item.id;
              return (
                <div 
                  key={key} 
                  className="glass-card interactive-hover"
                  style={{ borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
                >
                  {/* Card Cover */}
                  <div style={{ position: 'relative', height: '190px', overflow: 'hidden' }}>
                    <img 
                      src={item.cover_image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&auto=format&fit=crop&q=80'} 
                      alt={item.destination} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(10, 16, 32, 0.9) 100%)' }} />

                    {/* Remove Bookmark Button */}
                    <button
                      onClick={(e) => handleRemove(e, item)}
                      className="bookmark-heart-btn"
                      title="Remove bookmark"
                      style={{ position: 'absolute', top: '0.85rem', right: '0.85rem', zIndex: 2 }}
                    >
                      <Trash2 size={15} color="#f87171" />
                    </button>

                    <div style={{ position: 'absolute', bottom: '0.85rem', left: '1rem', right: '1rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                        📍 {item.destination}
                      </span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 850, color: '#ffffff', margin: '0.15rem 0 0 0' }}>
                        {item.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.9rem' }}>
                    <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.summary}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.82rem', color: '#94a3b8' }}>
                      {item.duration && <span>⏱️ {item.duration}</span>}
                      {item.estimated_total_cost && <span>💰 {formatCost(item.estimated_total_cost)}</span>}
                    </div>

                    <button 
                      onClick={() => handleViewTrip(item)} 
                      className="btn-primary" 
                      style={{ width: '100%', marginTop: 'auto', justifyContent: 'center', padding: '0.6rem 1rem' }}
                    >
                      <span>View Itinerary</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
