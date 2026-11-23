import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  MapPin, 
  Navigation, 
  Calendar, 
  Compass, 
  Coins, 
  ArrowRight, 
  X, 
  Trash2, 
  Loader2,
  Clock,
  ExternalLink
} from 'lucide-react';
import apiClient from '../services/api';
import { useRouter } from '../services/router';
import { useCurrency } from '../context/CurrencyContext';

const INITIAL_WELCOME = {
  role: 'assistant',
  content: "👋 Hey explorer! Where are you planning to travel, or would you like me to detect your current location and suggest scenic surrounding getaways?",
  timestamp: new Date().toISOString(),
};

export default function FloatingChatbot() {
  const { navigate } = useRouter();
  const { formatCost } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('wanderbot_floating_chat');
    return saved ? JSON.parse(saved) : [INITIAL_WELCOME];
  });
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('wanderbot_floating_chat', JSON.stringify(messages));
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          const city = data.address?.city || data.address?.town || data.address?.county || data.address?.state || 'my current location';
          const promptMsg = `I am currently in ${city}. Recommend the best 2-3 day nature and weekend road trips in the surrounding areas within a 2-3 hour drive!`;
          handleSendMessage(promptMsg);
        } catch {
          handleSendMessage(`My coordinates are (${latitude.toFixed(2)}, ${longitude.toFixed(2)}). Suggest top surrounding weekend trips!`);
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

    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      const response = await apiClient.post('/chat/message', {
        messages: updatedMessages.map((m) => ({ role: m.role, content: m.content })),
      });

      if (response.data?.message) {
        setMessages((prev) => [...prev, response.data.message]);
      }

      if (response.data?.generated_itinerary) {
        setGeneratedPlan(response.data.generated_itinerary);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '⚠️ I had trouble connecting. Please check if your FastAPI backend is running!',
        },
      ]);
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
    setIsOpen(false);
    navigate('/trip/new');
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME]);
    setGeneratedPlan(null);
    localStorage.removeItem('wanderbot_floating_chat');
  };

  // Cleans out raw code blocks, JSON tags, or trailing system phrases
  const sanitizeMessage = (text) => {
    if (!text) return '';
    return text
      .replace(/```itinerary_json[\s\S]*?```/gi, '')
      .replace(/```json[\s\S]*?```/gi, '')
      .replace(/```[\s\S]*?```/gi, '')
      .replace(/Below is the complete day[‑\-]by[‑\-]day plan.*/gi, '')
      .replace(/###\s*📋\s*Final Itinerary.*/gi, '')
      .trim();
  };

  const renderFormattedInline = (str) => {
    const parts = str.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: '#60a5fa', fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  const formatMessageText = (rawContent) => {
    const content = sanitizeMessage(rawContent);
    if (!content) return null;

    const paragraphs = content.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      if (para.startsWith('### ') || para.startsWith('## ') || para.startsWith('# ')) {
        const title = para.replace(/^#+\s*/, '');
        return (
          <h4 key={pIdx} style={{ fontSize: '1rem', fontWeight: 800, color: '#ffffff', margin: '0.6rem 0 0.3rem 0' }}>
            {title}
          </h4>
        );
      }
      const lines = para.split('\n');
      const isBulletList = lines.some((l) => l.trim().startsWith('- ') || l.trim().startsWith('* ') || /^\d+\.\s/.test(l.trim()));
      if (isBulletList) {
        return (
          <ul key={pIdx} style={{ paddingLeft: '1.2rem', margin: '0.4rem 0', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {lines.map((line, lIdx) => {
              const clean = line.replace(/^[-*•]\s*/, '').replace(/^\d+\.\s*/, '');
              return <li key={lIdx} style={{ lineHeight: 1.5, color: '#cbd5e1' }}>{renderFormattedInline(clean)}</li>;
            })}
          </ul>
        );
      }
      return (
        <p key={pIdx} style={{ margin: '0 0 0.5rem 0', lineHeight: 1.6, color: '#f1f5f9' }}>
          {renderFormattedInline(para)}
        </p>
      );
    });
  };

  return (
    <>
      {/* 1. FLOATING CHAT WIDGET WINDOW */}
      {isOpen && (
        <div className="floating-chat-window">
          {/* Header */}
          <div className="chat-window-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="chat-avatar-badge">
                <Bot size={18} color="#ffffff" />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', letterSpacing: '0.01em' }}>
                  Ask WanderBot <span className="neon-pulse-dot" />
                </h4>
                <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>
                  AI Location & Surrounding Scout
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button onClick={handleClearChat} className="chat-header-btn" title="Clear chat">
                <Trash2 size={14} />
              </button>
              <button onClick={() => setIsOpen(false)} className="chat-header-btn" title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="chat-messages-container">
            {messages.map((m, idx) => {
              const isUser = m.role === 'user';
              const formattedBotText = !isUser ? formatMessageText(m.content) : null;

              // If a bot message was only a JSON block that was extracted, don't show an empty bubble
              if (!isUser && !formattedBotText && generatedPlan) return null;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                    alignSelf: isUser ? 'flex-end' : 'flex-start',
                    maxWidth: isUser ? '82%' : '90%',
                  }}
                >
                  {!isUser && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.2rem', boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)' }}>
                      <Bot size={14} color="#fff" />
                    </div>
                  )}

                  <div className={isUser ? 'user-chat-bubble' : 'bot-chat-bubble'}>
                    {isUser ? m.content : formattedBotText}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', gap: '0.65rem', alignSelf: 'flex-start', alignItems: 'center' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bot size={14} color="#fff" />
                </div>
                <div className="bot-chat-bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600 }}>
                  <Loader2 size={15} className="spinner" /> WanderBot is scouting surrounding spots...
                </div>
              </div>
            )}

            {/* Structured Itinerary Visual Card */}
            {generatedPlan && (
              <div className="chat-plan-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Sparkles size={14} /> Itinerary Ready!
                </div>
                <h4 style={{ margin: '0.35rem 0 0.2rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                  {generatedPlan.destination}
                </h4>
                <p style={{ margin: '0 0 0.85rem 0', fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                  {generatedPlan.itinerary?.summary}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem', marginBottom: '0.9rem' }}>
                  <span className="neon-pill-sm"><Calendar size={12} color="#60a5fa" /> {generatedPlan.itinerary?.days?.length || 'Multi'} Days</span>
                  <span className="neon-pill-sm"><Compass size={12} color="#6366f1" /> {generatedPlan.travel_style || 'Balanced'}</span>
                  {generatedPlan.itinerary?.estimated_total_cost && (
                    <span className="neon-pill-sm" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.35)' }}>
                      <Coins size={12} /> {formatCost(generatedPlan.itinerary.estimated_total_cost)}
                    </span>
                  )}
                </div>

                <button onClick={handleViewPlan} className="btn-glow" style={{ width: '100%', justifyContent: 'center', padding: '0.65rem 1rem' }}>
                  <span>View Full Schedule & Days</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Footer Input */}
          <div className="chat-input-bar">
            {/* Quick Chips */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.6rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
              <button onClick={handleUseMyLocation} disabled={locating || loading} className="chat-chip glow-chip-green">
                {locating ? <Loader2 size={12} className="spinner" /> : <Navigation size={12} />}
                Use My Location
              </button>
              <button onClick={() => handleSendMessage('Suggest surrounding day trips within 2 hours')} className="chat-chip">
                Nearby Trips (2 hrs)
              </button>
              <button onClick={() => handleSendMessage('3-day weekend exploring nature and food')} className="chat-chip">
                Weekend Nature & Food
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              style={{ display: 'flex', gap: '0.5rem' }}
            >
              <input
                type="text"
                placeholder="Ask about spots, routes, budget..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="chat-neon-input"
              />
              <button
                type="submit"
                disabled={loading || !inputText.trim()}
                className="btn-chat-send"
                aria-label="Send message"
              >
                {loading ? <Loader2 size={16} className="spinner" /> : <Send size={16} />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 2. FLOATING TRIGGER BUTTON (Always visible at bottom right) */}
      <div className="floating-trigger-container">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="ask-ai-pill"
          aria-label="Ask WanderBot AI Travel Scout"
        >
          <div className="pill-ai-icon">
            <Bot size={20} />
          </div>
          <div className="pill-text-wrap">
            <span className="pill-title">Ask WanderBot</span>
            <span className="pill-tagline">AI Scout & Plan</span>
          </div>
        </button>
      </div>
    </>
  );
}
