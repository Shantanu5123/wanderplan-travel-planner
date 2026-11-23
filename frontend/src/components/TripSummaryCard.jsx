import React from 'react';
import { 
  MapPin, 
  Calendar, 
  DollarSign, 
  Compass, 
  Clock, 
  Sparkles, 
  Check, 
  Share2, 
  BookmarkCheck,
  RotateCcw
} from 'lucide-react';

export default function TripSummaryCard({ tripData, onReset, onSave }) {
  if (!tripData) return null;

  const { destination, start_date, end_date, budget, travel_style, interests } = tripData;

  // Calculate day difference
  let daysCount = 'Multi-Day';
  if (start_date && end_date) {
    const diff = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)) + 1;
    if (diff > 0) daysCount = `${diff} Days`;
  }

  return (
    <div className="trip-summary-card glass-card">
      <div className="summary-banner">
        <div className="summary-badge">
          <Sparkles size={14} /> Ready to Plan
        </div>
        <h2>{destination}</h2>
        <p className="summary-dates">
          <Calendar size={14} /> {start_date} → {end_date} ({daysCount})
        </p>
      </div>

      <div className="summary-body">
        <div className="summary-stat-grid">
          <div className="summary-stat">
            <span className="stat-label"><DollarSign size={13} /> Budget</span>
            <strong className="stat-value">{budget ? budget.charAt(0).toUpperCase() + budget.slice(1) : 'Moderate'}</strong>
          </div>
          <div className="summary-stat">
            <span className="stat-label"><Compass size={13} /> Pace</span>
            <strong className="stat-value">{travel_style ? travel_style.charAt(0).toUpperCase() + travel_style.slice(1) : 'Balanced'}</strong>
          </div>
          <div className="summary-stat">
            <span className="stat-label"><Clock size={13} /> Duration</span>
            <strong className="stat-value">{daysCount}</strong>
          </div>
        </div>

        {interests && interests.length > 0 && (
          <div className="summary-interests">
            <span className="interests-title">Selected Highlights:</span>
            <div className="chips-container mini">
              {interests.map((item, idx) => (
                <span key={idx} className="chip-tag">
                  <Check size={12} /> {item}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="summary-actions">
          {onSave && (
            <button onClick={onSave} className="btn-primary">
              <BookmarkCheck size={16} /> Save to My Trips
            </button>
          )}
          {onReset && (
            <button onClick={onReset} className="btn-secondary">
              <RotateCcw size={15} /> Modify Search
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
