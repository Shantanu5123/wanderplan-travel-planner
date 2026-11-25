import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Sparkles, 
  Edit3, 
  Check, 
  X, 
  RefreshCw, 
  BookmarkCheck, 
  Share2, 
  DollarSign, 
  Compass, 
  ChevronDown, 
  ChevronUp, 
  Download,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabaseClient';
import apiClient from '../services/api';
import { exportItineraryToPDF } from '../services/pdfExporter';

export default function ItineraryView({ tripData, onModify, onSaved }) {
  const { user } = useAuth();
  const { formatCost } = useCurrency();
  
  // Extract itinerary data safely
  const itinerary = tripData?.itinerary || tripData?.itinerary_data || tripData;
  const daysList = itinerary?.days || [];

  // Default: Expand ALL days by default so everything is immediately visible and scrollable!
  const [expandedDays, setExpandedDays] = useState(() => {
    const initial = {};
    if (daysList.length > 0) {
      daysList.forEach((d) => {
        initial[d.day_number] = true;
      });
    } else {
      initial[1] = true;
      initial[2] = true;
      initial[3] = true;
      initial[4] = true;
    }
    return initial;
  });

  const [currentItinerary, setCurrentItinerary] = useState(itinerary);
  const [editingActivity, setEditingActivity] = useState(null); // { dayIdx, actIdx }
  const [editForm, setEditForm] = useState({});
  const [regeneratingDay, setRegeneratingDay] = useState(null);
  const [tweakNote, setTweakNote] = useState('');
  const [activeTweakDay, setActiveTweakDay] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const toggleDay = (dayNum) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum]
    }));
  };

  const expandAll = () => {
    const all = {};
    (currentItinerary.days || []).forEach((d) => { all[d.day_number] = true; });
    setExpandedDays(all);
  };

  const collapseAll = () => {
    const none = {};
    (currentItinerary.days || []).forEach((d) => { none[d.day_number] = false; });
    setExpandedDays(none);
  };

  const startEdit = (dayIdx, actIdx, activity) => {
    setEditingActivity({ dayIdx, actIdx });
    setEditForm({ ...activity });
  };

  const cancelEdit = () => {
    setEditingActivity(null);
    setEditForm({});
  };

  const saveEdit = (dayIdx, actIdx) => {
    const updated = { ...currentItinerary };
    updated.days[dayIdx].activities[actIdx] = { ...editForm };
    setCurrentItinerary(updated);
    setEditingActivity(null);
    setEditForm({});
  };

  const handleRegenerateDay = async (dayNumber, dayIdx) => {
    setRegeneratingDay(dayNumber);
    try {
      const response = await apiClient.post('/itineraries/regenerate-day', {
        day_number: dayNumber,
        current_day: currentItinerary.days[dayIdx],
        feedback: tweakNote || 'Give alternative attractions and local hidden gems',
        trip_context: {
          destination: tripData.destination,
          budget: tripData.budget,
          travel_style: tripData.travel_style,
        },
      });

      if (response.data?.day) {
        const updated = { ...currentItinerary };
        updated.days[dayIdx] = response.data.day;
        setCurrentItinerary(updated);
        setActiveTweakDay(null);
        setTweakNote('');
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to regenerate day');
    } finally {
      setRegeneratingDay(null);
    }
  };

  const handleSaveTrip = async () => {
    setSaveLoading(true);
    setSaveError(null);

    const tripRecord = {
      id: 'trip_' + Date.now(),
      user_id: user?.id || 'guest',
      destination: tripData.destination,
      start_date: tripData.start_date,
      end_date: tripData.end_date,
      budget: tripData.budget,
      travel_style: tripData.travel_style,
      interests: tripData.interests,
      itinerary_data: currentItinerary,
      created_at: new Date().toISOString(),
    };

    // Helper to save to local storage as seamless fallback
    const saveToLocalStorage = (trip) => {
      try {
        const stored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
        const updated = [trip, ...stored.filter(t => t.id !== trip.id)];
        localStorage.setItem('wanderplan_local_trips', JSON.stringify(updated));
      } catch (err) {
        console.warn('LocalStorage save error:', err);
      }
    };

    // If user is guest or not logged in, save to local storage
    if (!user || user?.isGuest || user?.id?.startsWith('guest-')) {
      saveToLocalStorage(tripRecord);
      setSaveSuccess(true);
      setSaveLoading(false);
      setTimeout(() => {
        if (onSaved) onSaved(tripRecord);
      }, 600);
      return;
    }

    try {
      const { data, error } = await supabase.from('trips').insert([
        {
          user_id: user.id,
          destination: tripData.destination,
          start_date: tripData.start_date,
          end_date: tripData.end_date,
          budget: tripData.budget,
          travel_style: tripData.travel_style,
          interests: tripData.interests,
          itinerary_data: currentItinerary,
        },
      ]).select();

      if (error) {
        console.warn('Supabase trips insert error:', error.message);
        // Seamless fallback to local storage so the user NEVER loses their trip
        saveToLocalStorage(tripRecord);
        setSaveSuccess(true);
        if (onSaved) onSaved(tripRecord);
      } else {
        saveToLocalStorage(data?.[0] || tripRecord);
        setSaveSuccess(true);
        if (onSaved) onSaved(data?.[0] || tripRecord);
      }
    } catch (err) {
      console.warn('Error saving to supabase:', err);
      saveToLocalStorage(tripRecord);
      setSaveSuccess(true);
      if (onSaved) onSaved(tripRecord);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleExportPDF = () => {
    exportItineraryToPDF({ trip: tripData, itinerary: currentItinerary, formatCost });
  };

  const daysToRender = currentItinerary.days || [];

  return (
    <div className="itinerary-view-container">
      {/* Top Header Card */}
      <div className="itinerary-header-card glass-card">
        <div className="itinerary-banner">
          <div className="banner-badge">
            <Sparkles size={14} /> AI Tailored Itinerary
          </div>
          <h1>{tripData.destination}</h1>
          <p className="itinerary-summary">{currentItinerary.summary || 'Custom personalized day-by-day travel plan.'}</p>

          <div className="itinerary-meta-chips">
            <span><Calendar size={14} /> {tripData.start_date} → {tripData.end_date}</span>
            <span><DollarSign size={14} /> Budget: {tripData.budget}</span>
            <span><Compass size={14} /> Style: {tripData.travel_style}</span>
            {currentItinerary.estimated_total_cost && (
              <span>Estimated Cost: {formatCost(currentItinerary.estimated_total_cost)}</span>
            )}
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="itinerary-toolbar">
          <button
            onClick={handleSaveTrip}
            className={`btn-primary ${saveSuccess ? 'btn-saved' : ''}`}
            disabled={saveLoading || saveSuccess}
          >
            {saveLoading ? (
              <Loader2 size={16} className="spinner" />
            ) : saveSuccess ? (
              <Check size={16} />
            ) : (
              <BookmarkCheck size={16} />
            )}
            {saveSuccess ? 'Saved to My Trips!' : 'Save Trip'}
          </button>

          <button onClick={handleExportPDF} className="btn-secondary">
            <Download size={15} /> Download PDF Itinerary
          </button>

          <button onClick={onModify} className="btn-secondary">
            <Edit3 size={15} /> Change Details
          </button>

          {/* Quick Expand / Collapse All Toggles */}
          <div className="toolbar-right-toggles">
            <button onClick={expandAll} className="btn-text-sm">Expand All</button>
            <span className="dot-divider">•</span>
            <button onClick={collapseAll} className="btn-text-sm">Collapse All</button>
          </div>
        </div>

        {saveError && (
          <div className="alert alert-error" style={{ margin: '1rem 1.5rem' }}>
            <span>Notice: {saveError}</span>
          </div>
        )}
      </div>

      {/* Day by Day Cards */}
      <div className="days-stack">
        {daysToRender.length === 0 ? (
          <div className="empty-trips-card glass-card" style={{ padding: '3rem 1.5rem' }}>
            <p>No days generated yet. Try modifying your search or regenerating.</p>
          </div>
        ) : (
          daysToRender.map((day, dayIdx) => {
            const isExpanded = expandedDays[day.day_number] ?? true;
            const isRegen = regeneratingDay === day.day_number;

            return (
              <div key={day.day_number || dayIdx} className="day-card glass-card">
                {/* Day Header */}
                <div className="day-header" onClick={() => toggleDay(day.day_number)}>
                  <div className="day-title-wrap">
                    <span className="day-pill">Day {day.day_number}</span>
                    <div>
                      <h3>{day.theme}</h3>
                      {day.date && <span className="day-date">{day.date}</span>}
                    </div>
                  </div>

                  <div className="day-header-actions" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setActiveTweakDay(activeTweakDay === day.day_number ? null : day.day_number)}
                      className="btn-tweak"
                      title="Regenerate this specific day"
                    >
                      <RefreshCw size={14} className={isRegen ? 'spinner' : ''} />
                      Regenerate Day
                    </button>

                    <button 
                      className="btn-expand" 
                      onClick={() => toggleDay(day.day_number)}
                      aria-label="Toggle day view"
                    >
                      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                </div>

                {/* Tweak / Regenerate Drawer */}
                {activeTweakDay === day.day_number && (
                  <div className="tweak-drawer">
                    <input
                      type="text"
                      placeholder="e.g. More outdoor nature spots, less museums, local street food..."
                      value={tweakNote}
                      onChange={(e) => setTweakNote(e.target.value)}
                      className="input-text"
                      disabled={isRegen}
                    />
                    <div className="tweak-buttons">
                      <button
                        onClick={() => handleRegenerateDay(day.day_number, dayIdx)}
                        className="btn-primary"
                        disabled={isRegen}
                      >
                        {isRegen ? <Loader2 size={15} className="spinner" /> : <RefreshCw size={14} />}
                        Regenerate
                      </button>
                      <button onClick={() => setActiveTweakDay(null)} className="btn-secondary">
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Activities Timeline */}
                {isExpanded && (
                  <div className="activities-list">
                    {day.activities && day.activities.length > 0 ? (
                      day.activities.map((act, actIdx) => {
                        const isEditing = editingActivity?.dayIdx === dayIdx && editingActivity?.actIdx === actIdx;

                        return (
                          <div key={actIdx} className="activity-card">
                            <div className="activity-time-badge">{act.time_slot}</div>

                            {isEditing ? (
                              <div className="activity-edit-form">
                                <input
                                  type="text"
                                  value={editForm.title}
                                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                  className="input-text"
                                  placeholder="Activity title"
                                />
                                <textarea
                                  value={editForm.description}
                                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                  className="input-text"
                                  rows={2}
                                  placeholder="Description"
                                />
                                <div className="form-row">
                                  <input
                                    type="text"
                                    value={editForm.location}
                                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                                    className="input-text"
                                    placeholder="Location"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.cost_estimate || ''}
                                    onChange={(e) => setEditForm({ ...editForm, cost_estimate: e.target.value })}
                                    className="input-text"
                                    placeholder="Cost (e.g. Free, $15)"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={editForm.travel_tips || ''}
                                  onChange={(e) => setEditForm({ ...editForm, travel_tips: e.target.value })}
                                  className="input-text"
                                  placeholder="Travel tips"
                                />

                                <div className="edit-buttons">
                                  <button onClick={() => saveEdit(dayIdx, actIdx)} className="btn-save-sm">
                                    <Check size={14} /> Save
                                  </button>
                                  <button onClick={cancelEdit} className="btn-cancel-sm">
                                    <X size={14} /> Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="activity-content">
                                <div className="activity-main">
                                  <h4>{act.title}</h4>
                                  <p className="activity-desc">{act.description}</p>
                                  
                                  <div className="activity-details">
                                    {act.location && (
                                      <span className="detail-item">
                                        <MapPin size={13} /> {act.location}
                                      </span>
                                    )}
                                    {act.cost_estimate && (
                                      <span className="detail-item">
                                        <DollarSign size={13} /> {formatCost(act.cost_estimate)}
                                      </span>
                                    )}
                                  </div>

                                  {act.travel_tips && (
                                    <div className="activity-tip">
                                      <strong>Tip:</strong> {act.travel_tips}
                                    </div>
                                  )}
                                </div>

                                <button
                                  onClick={() => startEdit(dayIdx, actIdx, act)}
                                  className="btn-edit-act"
                                  title="Edit this activity"
                                >
                                  <Edit3 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No activities listed for this day.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
