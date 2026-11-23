import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from '../services/router';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { supabase } from '../services/supabaseClient';
import apiClient from '../services/api';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Calendar, 
  Loader2, 
  Compass, 
  ArrowRight, 
  Navigation, 
  DollarSign, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Clock, 
  History, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

const INITIAL_WELCOME = {
  role: 'assistant',
  content: "👋 Hi there! I'm **WanderBot**, your intelligent travel concierge.\n\nTo get started, **where are you starting from or where would you like to travel?** (Click *Use My Location* to map nearby escapes!)",
};

export default function ChatbotPlanner() {
  const { navigate } = useRouter();
  const { user } = useAuth();
  const { formatCost } = useCurrency();

  // Multi-session history state
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem('wanderbot_saved_sessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {}
    }
    const defaultId = 'session_' + Date.now();
    return [
      {
        id: defaultId,
        title: 'New Trip Exploration',
        createdAt: new Date().toISOString(),
        messages: [INITIAL_WELCOME],
        plan: null,
      },
    ];
  });

  const [activeSessionId, setActiveSessionId] = useState(() => {
    return localStorage.getItem('wanderbot_active_session_id') || sessions[0]?.id;
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  const messagesEndRef = useRef(null);

  // Active session pointer
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [INITIAL_WELCOME];
  const generatedPlan = activeSession?.plan || null;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Persist sessions to localStorage
  useEffect(() => {
    localStorage.setItem('wanderbot_saved_sessions', JSON.stringify(sessions));
    if (activeSessionId) {
      localStorage.setItem('wanderbot_active_session_id', activeSessionId);
    }
  }, [sessions, activeSessionId]);

  // Create New Chat Session
  const handleNewChat = () => {
    const newId = 'session_' + Date.now();
    const newSession = {
      id: newId,
      title: 'New Trip Exploration',
      createdAt: new Date().toISOString(),
      messages: [INITIAL_WELCOME],
      plan: null,
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
  };

  // Switch Chat Session
  const handleSelectSession = (id) => {
    setActiveSessionId(id);
  };

  // Delete Chat Session
  const handleDeleteSession = (id, e) => {
    e.stopPropagation();
    if (sessions.length <= 1) {
      handleNewChat();
      return;
    }
    const filtered = sessions.filter((s) => s.id !== id);
    setSessions(filtered);
    if (activeSessionId === id) {
      setActiveSessionId(filtered[0].id);
    }
  };

  // Browser Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || 'my location';
          setInputText(`I am in ${city}. Please map out and plan a 3-day trip exploring this place and its surrounding gems!`);
        } catch {
          setInputText(`I am at coordinates (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Plan a 3-day trip exploring surrounding places!`);
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        alert('Could not access location: ' + err.message);
        setLocating(false);
      }
    );
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage = { role: 'user', content: text.trim(), timestamp: new Date().toISOString() };
    const updatedMessages = [...messages, userMessage];

    // Auto-generate session title based on first user question
    let updatedTitle = activeSession.title;
    if (activeSession.title === 'New Trip Exploration') {
      const words = text.trim().split(' ').slice(0, 5).join(' ');
      updatedTitle = words.charAt(0).toUpperCase() + words.slice(1);
    }

    // Update active session locally
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, title: updatedTitle, messages: updatedMessages }
          : s
      )
    );

    setInputText('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chat/message', {
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      let finalMessages = updatedMessages;
      let finalPlan = generatedPlan;

      if (response.data?.message) {
        finalMessages = [...updatedMessages, response.data.message];
      }

      if (response.data?.generated_itinerary) {
        finalPlan = response.data.generated_itinerary;
      }

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: finalMessages, plan: finalPlan }
            : s
        )
      );
    } catch (err) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? {
                ...s,
                messages: [
                  ...updatedMessages,
                  {
                    role: 'assistant',
                    content: '⚠️ I had trouble connecting to the AI engine. Please ensure your backend is running and try again!',
                  },
                ],
              }
            : s
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleViewPlan = () => {
    if (!generatedPlan) return;
    sessionStorage.setItem('viewing_trip', JSON.stringify({
      ...generatedPlan,
      itinerary_data: generatedPlan.itinerary || generatedPlan,
    }));
    navigate('/trip/new');
  };

  // Helper formatting for bold and lists
  const formatMessageText = (content) => {
    if (!content) return '';
    const paragraphs = content.split('\n\n');

    return paragraphs.map((para, pIdx) => {
      if (para.startsWith('### ') || para.startsWith('## ') || para.startsWith('# ')) {
        const title = para.replace(/^#+\s*/, '');
        return (
          <h4 key={pIdx} style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: '0.8rem 0 0.4rem 0' }}>
            {title}
          </h4>
        );
      }

      const lines = para.split('\n');
      const isBulletList = lines.some((l) => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()));

      if (isBulletList) {
        return (
          <ul key={pIdx} style={{ paddingLeft: '1.4rem', margin: '0.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {lines.map((line, lIdx) => {
              const clean = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
              return (
                <li key={lIdx} style={{ lineHeight: 1.6 }}>
                  {renderFormattedInline(clean)}
                </li>
              );
            })}
          </ul>
        );
      }

      return (
        <p key={pIdx} style={{ margin: '0 0 0.6rem 0', lineHeight: 1.65 }}>
          {renderFormattedInline(para)}
        </p>
      );
    });
  };

  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#0f172a', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', display: 'flex', gap: '1.25rem' }}>
      
      {/* 1. CHAT HISTORY SIDEBAR */}
      <div 
        style={{
          width: sidebarOpen ? '280px' : '0px',
          opacity: sidebarOpen ? 1 : 0,
          pointerEvents: sidebarOpen ? 'auto' : 'none',
          transition: 'all 0.25s ease',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: sidebarOpen ? '1px solid #e2e8f0' : 'none',
          boxShadow: '0 8px 30px -5px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          flexShrink: 0,
          height: '80vh',
        }}
      >
        {/* Sidebar Header */}
        <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '0.95rem', color: '#0f172a' }}>
              <History size={16} color="#2563eb" /> Chat History
            </span>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>{sessions.length} chats</span>
          </div>

          <button
            onClick={handleNewChat}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '0.65rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Plus size={16} /> New Trip Chat
          </button>
        </div>

        {/* Sessions List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {sessions.map((sess) => {
            const isActive = sess.id === activeSessionId;
            return (
              <div
                key={sess.id}
                onClick={() => handleSelectSession(sess.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem 0.85rem',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#f8fafc' : 'transparent',
                  border: isActive ? '1px solid #cbd5e1' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                  <MessageSquare size={16} color={isActive ? '#2563eb' : '#94a3b8'} style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.86rem', fontWeight: isActive ? 700 : 500, color: isActive ? '#0f172a' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {sess.title}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '0.15rem' }}>
                      {sess.messages?.length > 1 ? `${sess.messages.length - 1} messages` : 'Just started'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(sess.id, e)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: '0.25rem',
                    borderRadius: '4px',
                  }}
                  title="Delete chat"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div 
        style={{
          flex: 1,
          backgroundColor: '#ffffff',
          borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 15px 40px -10px rgba(0, 0, 0, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          height: '80vh',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '1.1rem 1.75rem',
            background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Toggle History Sidebar button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#ffffff',
                padding: '0.45rem',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={sidebarOpen ? 'Hide History' : 'View Chat History'}
            >
              <History size={16} />
            </button>

            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={22} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{activeSession.title}</h3>
              <span style={{ fontSize: '0.78rem', opacity: 0.9, display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.15rem' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                WanderBot Active • {messages.length - 1} messages
              </span>
            </div>
          </div>

          <button
            onClick={handleNewChat}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#ffffff',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <Plus size={14} /> New Chat
          </button>
        </div>

        {/* Message Thread */}
        <div 
          style={{
            flex: '1 1 auto',
            overflowY: 'auto',
            padding: '1.75rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            backgroundColor: '#f8fafc',
          }}
        >
          {messages.map((m, idx) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '0.85rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: isUser ? '75%' : '85%',
                }}
              >
                {!isUser && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #bfdbfe', marginTop: '0.2rem' }}>
                    <Bot size={18} color="#2563eb" />
                  </div>
                )}

                <div
                  style={{
                    backgroundColor: isUser ? '#2563eb' : '#ffffff',
                    color: isUser ? '#ffffff' : '#334155',
                    padding: '1.1rem 1.5rem',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    boxShadow: isUser ? '0 4px 14px rgba(37,99,235,0.2)' : '0 2px 10px rgba(0,0,0,0.03)',
                    border: isUser ? 'none' : '1px solid #e2e8f0',
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                  }}
                >
                  {isUser ? m.content : formatMessageText(m.content)}
                </div>

                {isUser && (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#ffffff', fontWeight: 700, fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.85rem', alignSelf: 'flex-start', alignItems: 'center' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #bfdbfe' }}>
                <Bot size={18} color="#2563eb" />
              </div>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', padding: '0.85rem 1.35rem', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.9rem' }}>
                <Loader2 size={16} className="spinner" color="#2563eb" /> WanderBot is thinking and planning...
              </div>
            </div>
          )}

          {/* Generated Itinerary Card */}
          {generatedPlan && (
            <div 
              style={{
                backgroundColor: '#ffffff',
                border: '2px solid #2563eb',
                borderRadius: '20px',
                padding: '1.75rem',
                margin: '1rem 0',
                boxShadow: '0 12px 30px -5px rgba(37, 99, 235, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.35rem 0.85rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.82rem' }}>
                    <Sparkles size={14} /> Customized Plan Ready!
                  </div>
                  <h3 style={{ margin: '0.5rem 0 0.25rem 0', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a' }}>
                    {generatedPlan.destination}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#475569' }}>
                    {generatedPlan.itinerary?.summary || 'Tailored day-by-day journey mapped with surrounding day trips.'}
                  </p>
                </div>

                <button
                  onClick={handleViewPlan}
                  className="btn-glow"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.8rem 1.5rem',
                    fontSize: '0.95rem',
                    borderRadius: '12px',
                  }}
                >
                  Open Full Itinerary View <ArrowRight size={16} />
                </button>
              </div>

              {/* Quick Snapshot Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid #f1f5f9', paddingTop: '0.85rem' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                  <Calendar size={13} color="#2563eb" /> {generatedPlan.itinerary?.days?.length || 'Multi'} Days Planned
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', color: '#334155', fontWeight: 600 }}>
                  <Compass size={13} color="#2563eb" /> {generatedPlan.travel_style || 'Balanced'} Pace
                </span>
                {generatedPlan.itinerary?.estimated_total_cost && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#ecfdf5', color: '#047857', padding: '0.35rem 0.75rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: 700 }}>
                    <DollarSign size={13} /> Est: {formatCost(generatedPlan.itinerary.estimated_total_cost)}
                  </span>
                )}
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div style={{ padding: '1.25rem 2rem', backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0', flexShrink: 0 }}>
          {/* Helper Chips */}
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '0.85rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
            <button
              onClick={handleUseMyLocation}
              disabled={locating || loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#2563eb',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {locating ? <Loader2 size={13} className="spinner" /> : <Navigation size={13} />}
              Use My Location
            </button>

            <button
              onClick={() => handleSendMessage('Plan a 3-day trip from Pune exploring surrounding hills like Lonavala.')}
              disabled={loading}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Pune + Lonavala Hills
            </button>

            <button
              onClick={() => handleSendMessage('Suggest top day trips and hidden spots within a 2-hour drive.')}
              disabled={loading}
              style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid #e2e8f0',
                color: '#475569',
                padding: '0.4rem 0.9rem',
                borderRadius: '9999px',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Nearby Day Trips (2 hrs)
            </button>
          </div>

          {/* Form Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            style={{ display: 'flex', gap: '0.85rem' }}
          >
            <input
              type="text"
              placeholder="Ask WanderBot anything about destinations, budget, or nearby spots..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={loading}
              className="input-text"
              style={{
                flex: 1,
                padding: '0.9rem 1.35rem',
                fontSize: '0.98rem',
                borderRadius: '14px',
                border: '1.5px solid #cbd5e1',
              }}
            />

            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="btn-glow"
              style={{
                padding: '0.9rem 1.6rem',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.98rem',
              }}
            >
              <Send size={16} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
