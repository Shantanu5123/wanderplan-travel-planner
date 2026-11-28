import React, { useState, useEffect } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useCurrency } from '../context/CurrencyContext';
import { exportItineraryToPDF } from '../services/pdfExporter';
import { swapActivity } from '../services/api';
import ItineraryInteractiveMap from '../components/ItineraryInteractiveMap';
import LiveWeatherBar from '../components/LiveWeatherBar';
import PackingListDrawer from '../components/PackingListDrawer';
import SortableActivityCard from '../components/SortableActivityCard';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
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
  FileText,
  Plane,
  Building,
  ExternalLink
} from 'lucide-react';
import { buildGoogleFlightsUrl, buildBookingHotelsUrl, buildGoogleHotelsUrl } from '../services/bookingLinks';

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
  const [hoveredActivityIndex, setHoveredActivityIndex] = useState(null);
  const [swappingIndex, setSwappingIndex] = useState(null);
  const [shareToast, setShareToast] = useState(null);
  const [forkLoading, setForkLoading] = useState(false);
  const [forkSuccess, setForkSuccess] = useState(false);

  // Setup sensors for DND-kit with pointer tolerance so clicks still work seamlessly
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Helper function to recalculate estimated trip cost from current itinerary activities
  const recalculateTotalCost = (daysList) => {
    let totalLow = 0;
    let totalHigh = 0;
    let count = 0;

    daysList.forEach((day) => {
      day.activities?.forEach((act) => {
        if (!act.cost_estimate) return;
        const str = act.cost_estimate;
        // Prioritize explicit USD matches ($15, $20 - $35)
        const dollarMatches = str.match(/\$\s*(\d+[\d,]*(\.\d+)?)/g);
        if (dollarMatches && dollarMatches.length > 0) {
          const numbers = dollarMatches
            .map((m) => parseFloat(m.replace(/[^\d.]/g, '')))
            .filter((n) => !isNaN(n));
          if (numbers.length === 1) {
            totalLow += numbers[0];
            totalHigh += numbers[0];
            count++;
          } else if (numbers.length >= 2) {
            const sorted = [...numbers].sort((a, b) => a - b);
            totalLow += sorted[0];
            totalHigh += sorted[sorted.length - 1];
            count++;
          }
          return;
        }

        // Fallback: match plain digits only if no local currency symbol (¥, ₹, €) precedes it
        if (!/^[¥€£₹]/.test(str)) {
          const matches = str.match(/\d+[\d,]*/g);
          if (matches && matches.length > 0) {
            const numbers = matches.map((m) => parseFloat(m.replace(/,/g, ''))).filter((n) => !isNaN(n));
            if (numbers.length === 1) {
              totalLow += numbers[0];
              totalHigh += numbers[0];
              count++;
            } else if (numbers.length >= 2) {
              const sorted = [...numbers].sort((a, b) => a - b);
              totalLow += sorted[0];
              totalHigh += sorted[sorted.length - 1];
              count++;
            }
          }
        }
      });
    });

    if (count === 0) return null;
    const roundedLow = Math.round(totalLow);
    const roundedHigh = Math.round(totalHigh);
    return roundedLow === roundedHigh ? `$${roundedLow}` : `$${roundedLow} - $${roundedHigh}`;
  };

  // Persist updated trip state to local cache & Supabase
  const persistTripUpdate = async (updatedTrip) => {
    setTrip(updatedTrip);
    sessionStorage.setItem('viewing_trip', JSON.stringify(updatedTrip));

    // Update in localStorage if saved locally
    try {
      const localStored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
      const updatedLocal = localStored.map((t) => (t.id === updatedTrip.id ? updatedTrip : t));
      localStorage.setItem('wanderplan_local_trips', JSON.stringify(updatedLocal));
    } catch (e) {}

    // Update in Supabase if real user & saved trip
    if (user && !user.isGuest && updatedTrip.id && !updatedTrip.id.startsWith('curated_') && updatedTrip.id !== 'new') {
      try {
        await supabase
          .from('trips')
          .update({
            itinerary_data: updatedTrip.itinerary_data,
          })
          .eq('id', updatedTrip.id);
      } catch (e) {
        console.warn('Supabase trip update error:', e);
      }
    }
  };

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

  // 1. Share flow: Set is_public = true, build clean URL, copy to clipboard, and trigger toast
  const handleShare = async () => {
    let cleanUrl = window.location.href;

    // If trip exists in Supabase, ensure is_public is set to true
    if (trip.id && trip.id !== 'new' && !trip.id.startsWith('curated_')) {
      try {
        await supabase
          .from('trips')
          .update({ is_public: true })
          .eq('id', trip.id);

        setTrip((prev) => ({ ...prev, is_public: true }));
      } catch (err) {
        console.warn('Supabase share update notice:', err);
      }
      const baseUrl = window.location.origin + window.location.pathname;
      cleanUrl = `${baseUrl}#/trip/${trip.id}`;
    }

    try {
      await navigator.clipboard.writeText(cleanUrl);
      setCopied(true);
      setShareToast('Public share link copied to clipboard! Anyone with this link can view this itinerary.');
      setTimeout(() => setCopied(false), 2500);
      setTimeout(() => setShareToast(null), 4000);
    } catch (e) {
      alert('Share link: ' + cleanUrl);
    }
  };

  // 2. Forking: Copy shared itinerary to visitor's own dashboard
  const handleCopyToMyTrips = async () => {
    if (!user) {
      alert('Please sign in to copy this itinerary to your personal trips!');
      navigate('/login');
      return;
    }

    setForkLoading(true);
    const newTripId = 'trip_' + Date.now();
    const today = trip.start_date || new Date().toISOString().split('T')[0];
    const endDate = trip.end_date || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0];

    const forkedTrip = {
      id: newTripId,
      user_id: user.id,
      destination: trip.destination,
      start_date: today,
      end_date: endDate,
      budget: trip.budget || 'moderate',
      travel_style: trip.travel_style || 'balanced',
      interests: trip.interests || [],
      itinerary_data: trip.itinerary_data,
      is_public: false,
      created_at: new Date().toISOString(),
    };

    // Save in local trips storage
    try {
      const stored = JSON.parse(localStorage.getItem('wanderplan_local_trips') || '[]');
      localStorage.setItem('wanderplan_local_trips', JSON.stringify([forkedTrip, ...stored]));
    } catch (e) {}

    // Save to Supabase if logged-in real user
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
            is_public: false,
          },
        ]).select();

        if (data?.[0]) {
          forkedTrip.id = data[0].id;
        }
      } catch (err) {
        console.warn('Supabase fork notice:', err);
      }
    }

    setForkSuccess(true);
    setForkLoading(false);
    sessionStorage.setItem('viewing_trip', JSON.stringify(forkedTrip));
    setTimeout(() => {
      navigate('/dashboard');
    }, 1200);
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

  // 1. Drag and Drop reorder handling
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !activeDay) return;

    const oldIndex = activeDay.activities.findIndex((_, idx) => `act-${activeDayTab}-${idx}` === active.id);
    const newIndex = activeDay.activities.findIndex((_, idx) => `act-${activeDayTab}-${idx}` === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(activeDay.activities, oldIndex, newIndex);
      // Re-assign appropriate time slot based on position
      const slots = ['Morning', 'Afternoon', 'Evening'];
      const adjusted = reordered.map((item, idx) => ({
        ...item,
        time_slot: idx < slots.length ? slots[idx] : item.time_slot,
      }));

      const newDays = days.map((d) =>
        (d.day_number || 1) === activeDayTab ? { ...d, activities: adjusted } : d
      );

      const newEstCost = recalculateTotalCost(newDays) || itinerary.estimated_total_cost;
      const updatedTrip = {
        ...trip,
        itinerary_data: {
          ...itinerary,
          days: newDays,
          estimated_total_cost: newEstCost,
        },
      };

      persistTripUpdate(updatedTrip);
    }
  };

  // 2. AI Swap Stop handler
  const handleSwapActivity = async (actIndex, activityToSwap) => {
    setSwappingIndex(actIndex);
    try {
      const res = await swapActivity({
        destination: trip.destination,
        current_activity: activityToSwap,
        day_theme: activeDay?.theme || '',
        budget: trip.budget || 'moderate',
        interests: trip.interests || [],
      });

      if (res.activity) {
        const updatedActivities = [...activeDay.activities];
        updatedActivities[actIndex] = {
          ...res.activity,
          personal_note: activityToSwap.personal_note || '',
        };

        const newDays = days.map((d) =>
          (d.day_number || 1) === activeDayTab ? { ...d, activities: updatedActivities } : d
        );

        const newEstCost = recalculateTotalCost(newDays) || itinerary.estimated_total_cost;
        const updatedTrip = {
          ...trip,
          itinerary_data: {
            ...itinerary,
            days: newDays,
            estimated_total_cost: newEstCost,
          },
        };

        persistTripUpdate(updatedTrip);
      }
    } catch (err) {
      console.error('Swap error:', err);
      alert('Unable to swap activity right now. Please try again.');
    } finally {
      setSwappingIndex(null);
    }
  };

  // 3. Delete activity stop & recalculate cost
  const handleDeleteActivity = (actIndex) => {
    if (!confirm('Remove this activity from Day ' + activeDayTab + '?')) return;
    const updatedActivities = activeDay.activities.filter((_, idx) => idx !== actIndex);

    const newDays = days.map((d) =>
      (d.day_number || 1) === activeDayTab ? { ...d, activities: updatedActivities } : d
    );

    const newEstCost = recalculateTotalCost(newDays) || itinerary.estimated_total_cost;
    const updatedTrip = {
      ...trip,
      itinerary_data: {
        ...itinerary,
        days: newDays,
        estimated_total_cost: newEstCost,
      },
    };

    persistTripUpdate(updatedTrip);
  };

  // 4. Save personal note
  const handleSaveNote = (actIndex, note) => {
    const updatedActivities = [...activeDay.activities];
    updatedActivities[actIndex] = {
      ...updatedActivities[actIndex],
      personal_note: note,
    };

    const newDays = days.map((d) =>
      (d.day_number || 1) === activeDayTab ? { ...d, activities: updatedActivities } : d
    );

    const updatedTrip = {
      ...trip,
      itinerary_data: {
        ...itinerary,
        days: newDays,
      },
    };

    persistTripUpdate(updatedTrip);
  };

  const isExploreSample = Boolean(trip.fromExplore || (typeof trip.id === 'string' && trip.id.startsWith('curated_')));
  // Determine if viewing a shared trip owned by another user
  const isOwner = Boolean(user && trip?.user_id && user.id === trip.user_id);
  // Only consider it a shared read-only view if user is definitely NOT the owner and trip wasn't created by this guest/user
  const isSharedTripView = Boolean(trip?.is_public && trip?.user_id && user && user.id !== trip.user_id && !isExploreSample);

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

            {/* Practical Action Bar: Book This Trip deep links */}
            <div className="book-trip-action-bar">
              <span className="book-bar-label">
                <Sparkles size={14} color="#38bdf8" /> Book This Trip:
              </span>
              <a
                href={buildGoogleFlightsUrl(trip.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="booking-action-btn"
                title={`Search flights to ${trip.destination} on Google Flights`}
              >
                <Plane size={14} color="#38bdf8" />
                <span>Search Flights</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={buildBookingHotelsUrl(trip.destination, trip.start_date, trip.end_date)}
                target="_blank"
                rel="noopener noreferrer"
                className="booking-action-btn"
                title={`Find hotels in ${trip.destination} on Booking.com`}
              >
                <Building size={14} color="#34d399" />
                <span>Find Hotels</span>
                <ExternalLink size={12} />
              </a>

              <a
                href={buildGoogleHotelsUrl(trip.destination)}
                target="_blank"
                rel="noopener noreferrer"
                className="booking-action-btn"
                title={`Explore hotels in ${trip.destination} on Google Hotels`}
              >
                <Building size={14} color="#a78bfa" />
                <span>Google Hotels</span>
                <ExternalLink size={12} />
              </a>
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

            {/* Public Shared Trip: Forking / Copy to My Trips button */}
            {isSharedTripView && (
              <button
                onClick={handleCopyToMyTrips}
                disabled={forkLoading || forkSuccess}
                className="btn-glow"
                style={{ padding: '0.6rem 1.3rem', background: 'linear-gradient(135deg, #38bdf8 0%, #34d399 100%)', color: '#030712', fontWeight: 800 }}
              >
                {forkLoading ? <Loader2 size={15} className="spinner" /> : (forkSuccess ? <Check size={15} /> : <BookmarkCheck size={15} />)}
                {forkSuccess ? 'Copied to Your Trips!' : 'Copy to My Trips'}
              </button>
            )}

            <button onClick={handleExportPDF} className="btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
              <Download size={15} /> Download PDF Itinerary
            </button>
            <button onClick={handleShare} className="btn-secondary" style={{ padding: '0.55rem 1.15rem' }}>
              {copied ? <Check size={15} color="#10b981" /> : <Share2 size={15} />}
              {copied ? 'Link Copied!' : 'Share Trip'}
            </button>

            {!isSharedTripView && !isExploreSample && trip.id && trip.id !== 'new' && (
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

        {/* Toast Alert for Public Share */}
        {shareToast && (
          <div className="alert alert-info" style={{ animation: 'fadeIn 0.25s ease', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Share2 size={16} color="#38bdf8" />
              <span>{shareToast}</span>
            </div>
            <button 
              onClick={() => setShareToast(null)} 
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.2rem' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Live Weather Forecast Bar (Open-Meteo) */}
        <LiveWeatherBar
          latitude={activeDay?.activities?.[0]?.latitude || 48.8566}
          longitude={activeDay?.activities?.[0]?.longitude || 2.3522}
          startDate={trip.start_date}
          endDate={trip.end_date}
          destination={trip.destination}
        />

        {/* AI Packing List Interactive Drawer */}
        <PackingListDrawer
          packingList={itinerary.packing_list || trip.packing_list}
          tripId={trip.id}
          destination={trip.destination}
        />

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

        {/* Split Layout: Day Itinerary Cards on Left, Sticky Interactive Map on Right */}
        {activeDay ? (
          <div className="split-itinerary-layout">
            {/* Left Column: Itinerary Details */}
            <div className="glass-card" style={{ padding: '2.25rem', borderRadius: '24px' }}>
              <div style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
                <span style={{ backgroundColor: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 800, fontSize: '0.82rem', padding: '0.4rem 0.9rem', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.06em', border: '1px solid rgba(56, 189, 248, 0.3)' }}>
                  Day {activeDay.day_number || activeDayTab} Schedule
                </span>
                <h2 style={{ fontSize: '1.85rem', fontWeight: 850, color: '#ffffff', marginTop: '0.85rem', letterSpacing: '-0.02em' }}>
                  {activeDay.theme || 'Exploration & Activities'}
                </h2>
                {activeDay.date && (
                  <span style={{ fontSize: '0.92rem', color: '#94a3b8', marginTop: '0.35rem', display: 'block' }}>
                    {activeDay.date}
                  </span>
                )}
              </div>

              {/* Sortable & Editable Activities List with Drag-and-Drop */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={(activeDay.activities || []).map((_, idx) => `act-${activeDayTab}-${idx}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {activeDay.activities?.map((act, actIdx) => {
                      const id = `act-${activeDayTab}-${actIdx}`;
                      const isHovered = hoveredActivityIndex === actIdx;
                      return (
                        <SortableActivityCard
                          key={id}
                          id={id}
                          activity={act}
                          index={actIdx}
                          destination={trip.destination || ''}
                          isHovered={isHovered}
                          onMouseEnter={() => setHoveredActivityIndex(actIdx)}
                          onMouseLeave={() => setHoveredActivityIndex(null)}
                          onSwap={handleSwapActivity}
                          onDelete={handleDeleteActivity}
                          onSaveNote={handleSaveNote}
                          isSwapping={swappingIndex === actIdx}
                        />
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            </div>

            {/* Right Column: Sticky Interactive Leaflet Map */}
            <div className="map-sticky-sidebar">
              <ItineraryInteractiveMap
                activities={activeDay.activities || []}
                destination={trip.destination || ''}
                hoveredIndex={hoveredActivityIndex}
                onMarkerClick={(idx) => setHoveredActivityIndex(idx)}
                activeDayNumber={activeDay.day_number || activeDayTab}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
