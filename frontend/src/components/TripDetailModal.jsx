import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Compass, 
  Download, 
  Share2, 
  Check, 
  Trash2,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TripDetailModal({ trip, isOpen, onClose, onDelete }) {
  const [copied, setCopied] = useState(false);

  // Extract itinerary and ensure days array exists
  const itinerary = trip?.itinerary_data || {};
  const days = itinerary.days || [];

  // Initialize ALL days as expanded so they show their sub-activities immediately
  const [expandedDays, setExpandedDays] = useState({});

  useEffect(() => {
    if (days && days.length > 0) {
      const allOpen = {};
      days.forEach((d, idx) => {
        allOpen[d.day_number ?? idx + 1] = true;
      });
      setExpandedDays(allOpen);
    }
  }, [trip]);

  if (!isOpen || !trip) return null;

  const toggleDay = (key) => {
    setExpandedDays((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const expandAll = () => {
    const all = {};
    days.forEach((d, idx) => { all[d.day_number ?? idx + 1] = true; });
    setExpandedDays(all);
  };

  const collapseAll = () => {
    const none = {};
    days.forEach((d, idx) => { none[d.day_number ?? idx + 1] = false; });
    setExpandedDays(none);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(itinerary, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute('href', dataStr);
    dl.setAttribute('download', `${trip.destination.replace(/[^a-z0-9]/gi, '_')}_itinerary.json`);
    dl.click();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/#/dashboard`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.7)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '850px',
          height: '88vh',
          maxHeight: '88vh',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 25px 60px -15px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'rgba(255,255,255,0.25)',
            border: 'none',
            color: '#ffffff',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Modal Header Banner (Fixed height, does not scroll) */}
        <div 
          style={{
            flexShrink: 0,
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            padding: '1.75rem 2rem',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            <Sparkles size={14} /> Saved Itinerary
          </div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: 800, margin: 0 }}>{trip.destination}</h2>
          <p style={{ marginTop: '0.4rem', fontSize: '0.92rem', opacity: 0.95, lineHeight: 1.4, margin: '0.4rem 0 0 0' }}>
            {itinerary.summary || 'Custom generated day-by-day travel plan.'}
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: '0.85rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem' }}>
              <Calendar size={13} /> {trip.start_date} → {trip.end_date}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem' }}>
              <Compass size={13} /> {trip.travel_style}
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem' }}>
              <DollarSign size={13} /> {trip.budget}
            </span>
            {itinerary.estimated_total_cost && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: 'rgba(255,255,255,0.2)', padding: '0.25rem 0.65rem', borderRadius: '9999px', fontSize: '0.78rem' }}>
                Est. {itinerary.estimated_total_cost}
              </span>
            )}
          </div>
        </div>

        {/* Action Toolbar (Fixed, does not scroll) */}
        <div 
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 2rem',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <button onClick={handleExportJSON} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
            <Download size={14} /> Export JSON
          </button>
          <button onClick={handleShare} className="btn-secondary" style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}>
            {copied ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
            {copied ? 'Link Copied!' : 'Share Trip'}
          </button>

          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button onClick={expandAll} className="btn-text-sm" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600 }}>
              Expand All
            </button>
            <span style={{ color: '#cbd5e1' }}>|</span>
            <button onClick={collapseAll} className="btn-text-sm" style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#2563eb', fontWeight: 600 }}>
              Collapse All
            </button>

            {onDelete && (
              <button 
                onClick={() => {
                  onDelete(trip.id);
                  onClose();
                }} 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  background: 'transparent',
                  border: '1px solid #fecaca',
                  color: '#ef4444',
                  padding: '0.4rem 0.8rem',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: '0.5rem',
                }}
              >
                <Trash2 size={14} /> Delete Trip
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Day-by-Day Content - PURE NATIVE SCROLL */}
        <div 
          style={{
            flex: '1 1 auto',
            minHeight: 0,
            overflowY: 'scroll',
            WebkitOverflowScrolling: 'touch',
            padding: '1.5rem 2rem 3rem 2rem',
            backgroundColor: '#f8fafc',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {days.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
              No detailed schedule recorded for this trip.
            </p>
          ) : (
            days.map((day, dayIndex) => {
              const dayKey = day.day_number ?? dayIndex + 1;
              const isExpanded = expandedDays[dayKey] ?? true;

              return (
                <div 
                  key={dayKey} 
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                  }}
                >
                  {/* Click header to toggle open/closed */}
                  <div 
                    onClick={() => toggleDay(dayKey)}
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: '#ffffff',
                      borderBottom: isExpanded ? '1px solid #e2e8f0' : 'none',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span 
                        style={{
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '9999px',
                        }}
                      >
                        Day {dayKey}
                      </span>
                      <h4 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                        {day.theme || 'Scheduled Activities'}
                      </h4>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', color: '#64748b' }}>
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {/* Sub-activities: Rendered when expanded */}
                  {isExpanded && (
                    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#ffffff' }}>
                      {day.activities && day.activities.length > 0 ? (
                        day.activities.map((act, actIdx) => (
                          <div 
                            key={actIdx} 
                            style={{
                              display: 'flex',
                              gap: '1rem',
                              padding: '1rem',
                              borderRadius: '8px',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                            }}
                          >
                            <div 
                              style={{
                                backgroundColor: '#e2e8f0',
                                color: '#334155',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                padding: '0.3rem 0.6rem',
                                borderRadius: '4px',
                                height: 'fit-content',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {act.time_slot || 'Activity'}
                            </div>

                            <div style={{ flex: 1 }}>
                              <h5 style={{ margin: '0 0 0.3rem 0', fontSize: '0.98rem', fontWeight: 700, color: '#0f172a' }}>
                                {act.title}
                              </h5>
                              <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                                {act.description}
                              </p>
                              
                              <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.8rem', color: '#64748b' }}>
                                {act.location && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <MapPin size={13} /> {act.location}
                                  </span>
                                )}
                                {act.cost_estimate && (
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <DollarSign size={13} /> {act.cost_estimate}
                                  </span>
                                )}
                              </div>

                              {act.travel_tips && (
                                <div 
                                  style={{
                                    marginTop: '0.5rem',
                                    fontSize: '0.8rem',
                                    color: '#92400e',
                                    backgroundColor: '#fffbeb',
                                    padding: '0.4rem 0.65rem',
                                    borderRadius: '4px',
                                    borderLeft: '3px solid #f59e0b',
                                  }}
                                >
                                  <strong>Tip:</strong> {act.travel_tips}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
                          No sub-activities found for Day {dayKey}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
