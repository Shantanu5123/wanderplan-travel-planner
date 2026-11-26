import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, 
  MapPin, 
  Coins, 
  RefreshCw, 
  MessageSquare, 
  Trash2, 
  Loader2, 
  Save, 
  X 
} from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';

export default function SortableActivityCard({
  id,
  activity,
  index,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onSwap,
  onDelete,
  onSaveNote,
  isSwapping,
}) {
  const { formatCost } = useCurrency();
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState(activity.personal_note || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 999 : 1,
  };

  const handleNoteSubmit = (e) => {
    e.preventDefault();
    if (onSaveNote) onSaveNote(index, noteText);
    setShowNoteInput(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`activity-card activity-card-interactive ${isHovered ? 'active-hover' : ''}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Drag handle */}
      <div 
        {...attributes} 
        {...listeners} 
        className="drag-handle-grip" 
        title="Drag to reorder activity"
      >
        <GripVertical size={18} />
      </div>

      <div className="activity-time-badge" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>STOP #{index + 1}</span>
        <span>{activity.time_slot || 'Stop'}</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1.18rem', fontWeight: 700, color: '#ffffff' }}>
            {activity.title}
          </h3>

          {/* Action buttons: Swap & Add Note & Delete */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => onSwap(index, activity)}
              disabled={isSwapping}
              className="act-action-pill swap-btn"
              title="AI Swap with a fresh alternative attraction"
            >
              {isSwapping ? <Loader2 size={12} className="spinner" /> : <RefreshCw size={12} />}
              <span>{isSwapping ? 'Swapping...' : 'Swap'}</span>
            </button>

            <button
              onClick={() => setShowNoteInput(!showNoteInput)}
              className="act-action-pill note-btn"
              title="Add personal traveler note"
            >
              <MessageSquare size={12} />
              <span>{activity.personal_note ? 'Edit Note' : 'Add Note'}</span>
            </button>

            <button
              onClick={() => onDelete(index)}
              className="act-action-pill delete-btn"
              title="Remove activity"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        <p style={{ margin: '0.5rem 0 0.85rem 0', fontSize: '0.94rem', color: '#cbd5e1', lineHeight: 1.55 }}>
          {activity.description}
        </p>

        {/* Metadata info */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.88rem', color: '#94a3b8' }}>
          {activity.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#e2e8f0' }}>
              <MapPin size={14} color="#38bdf8" /> {activity.location}
            </span>
          )}
          {activity.cost_estimate && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, color: '#34d399' }}>
              <Coins size={14} /> {formatCost(activity.cost_estimate)}
            </span>
          )}
        </div>

        {activity.travel_tips && (
          <div className="activity-tip" style={{ marginTop: '0.75rem' }}>
            <strong>Local Tip:</strong> {activity.travel_tips}
          </div>
        )}

        {/* Personal note preview */}
        {activity.personal_note && !showNoteInput && (
          <div className="activity-personal-note-display">
            <span>📝 <strong>Your Note:</strong> {activity.personal_note}</span>
          </div>
        )}

        {/* Personal note edit box */}
        {showNoteInput && (
          <form onSubmit={handleNoteSubmit} className="activity-note-form">
            <input
              type="text"
              placeholder="e.g. Book sunset tickets in advance, wear sneakers..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="note-input-field"
              autoFocus
            />
            <button type="submit" className="note-save-btn">
              <Save size={13} /> Save
            </button>
            <button type="button" onClick={() => setShowNoteInput(false)} className="note-cancel-btn">
              <X size={13} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
