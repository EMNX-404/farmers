import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, X, Send, Loader2, MessageSquare, ArrowUpRight, HelpCircle } from 'lucide-react';
import aiService from '../../services/aiService';

const DEFAULT_SUGGESTIONS = [
  'What markets are open this Saturday?',
  'Where can I find fresh tomatoes?',
  'Which farmers are registered near me?',
  'How do in-person cash pre-orders work?',
  'What are the pickup hours for Downtown Market?',
];

export function MarketLinkAIAssistant({ isOpen: controlledOpen, onOpenChange }) {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const setIsOpen = (next) => {
    const value = typeof next === 'function' ? next(isOpen) : next;
    if (!isControlled) {
      setInternalOpen(value);
    }
    if (onOpenChange) {
      onOpenChange(value);
    }
  };
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Hello! I am your MarketLink AI Assistant. I can help you find fresh produce, discover market operating hours, and answer questions grounded in our live market catalog. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend || !textToSend.trim() || loading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.text }));

      const res = await aiService.askAssistant(userMsg.text, history);

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: res.message || res.answer || res.data?.message || 'I have checked the market records for you.',
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: `I had trouble connecting to the catalog: ${err.message}. Please try asking about available markets or products.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary"
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 900,
          borderRadius: '50px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: 'var(--shadow-lg)',
          border: '2px solid rgba(236, 243, 158, 0.4)',
        }}
        aria-label="Open MarketLink AI Assistant"
      >
        <Sparkles size={18} color="var(--color-leaf)" />
        <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>MarketLink AI</span>
      </button>

      {/* Floating Chat Drawer / Panel */}
      {isOpen && (
        <div
          className="card animate-slide-up"
          style={{
            position: 'fixed',
            bottom: '84px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 32px)',
            height: '540px',
            maxHeight: 'calc(100vh - 120px)',
            zIndex: 901,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--shadow-hover)',
            border: '1px solid rgba(64, 105, 28, 0.25)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem 1.25rem',
              background: 'var(--color-forest)',
              color: 'var(--color-white)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(236, 243, 158, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-leaf)',
                }}
              >
                <Bot size={18} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', color: '#faf9f6' }}>
                  MarketLink Assistant
                </h4>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-leaf)' }}>
                  Grounded in Live Catalog
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ color: 'rgba(250, 249, 246, 0.8)', cursor: 'pointer' }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              backgroundColor: 'var(--color-white)',
            }}
          >
            {messages.map((m) => {
              const isAssistant = m.role === 'assistant';
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                    maxWidth: '85%',
                    padding: '0.75rem 1rem',
                    borderRadius: isAssistant ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
                    backgroundColor: isAssistant ? '#ffffff' : 'var(--color-grass)',
                    color: isAssistant ? 'var(--text-primary)' : '#ffffff',
                    border: isAssistant ? '1px solid var(--color-border)' : 'none',
                    boxShadow: 'var(--shadow-subtle)',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.text}
                </div>
              );
            })}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '16px 16px 16px 4px',
                  backgroundColor: '#ffffff',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                }}
              >
                <Loader2 size={14} className="animate-spin" color="var(--color-grass)" />
                Checking market database...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Queries Chips */}
          <div
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--color-border-subtle)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap',
            }}
          >
            {DEFAULT_SUGGESTIONS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(s)}
                style={{
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  backgroundColor: 'var(--color-leaf-soft)',
                  border: '1px solid rgba(144,169,85,0.3)',
                  fontSize: '0.72rem',
                  fontWeight: '600',
                  color: 'var(--color-forest)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              gap: '8px',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about markets, farmers, products..."
              className="form-input"
              style={{ padding: '0.5rem 0.8rem', fontSize: '0.85rem' }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.5rem 0.75rem' }}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
export default MarketLinkAIAssistant;
