import { useState } from 'react';
import { Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const API_BASE = 'https://cachepilot-api.admorandom.workers.dev';

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'improvement', label: 'Improvement' },
  { value: 'other', label: 'Other' },
];

function sanitizeClient(str: string): string {
  return str.replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '').trim();
}

export function Feedback() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');

    const cleanName = sanitizeClient(name);
    const cleanEmail = sanitizeClient(email);
    const cleanMessage = sanitizeClient(message);

    if (cleanMessage.length < 10) {
      setErrorMsg('Message must be at least 10 characters.');
      setStatus('error');
      return;
    }

    if (cleanEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName || undefined,
          email: cleanEmail || undefined,
          category: sanitizeClient(category),
          message: cleanMessage,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Something went wrong.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setName('');
      setEmail('');
      setCategory('bug');
      setMessage('');
    } catch {
      setErrorMsg('Network error. Please try again.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        borderRadius: 16,
        padding: '48px 32px',
        textAlign: 'center',
        maxWidth: 480,
        margin: '0 auto',
      }}>
        <CheckCircle size={48} style={{ color: '#10b981', marginBottom: 16 }} />
        <h3 style={{ fontSize: 20, fontWeight: 700, color: '#E8EDF5', marginBottom: 8 }}>
          Thank you for your feedback!
        </h3>
        <p style={{ fontSize: 14, color: '#8A94A6', marginBottom: 24 }}>
          We read every submission and it helps us improve CachePilot.
        </p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            padding: '10px 24px',
            borderRadius: 10,
            border: '1px solid rgba(43, 52, 65, 0.8)',
            background: 'transparent',
            color: '#8A94A6',
            fontSize: 14,
            cursor: 'pointer',
          }}
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(77, 163, 255, 0.15), rgba(77, 163, 255, 0.05))',
          border: '1px solid rgba(77, 163, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <MessageSquare size={24} style={{ color: '#49A3FF' }} />
        </div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: '#E8EDF5', marginBottom: 8 }}>
          Send Us Feedback
        </h3>
        <p style={{ fontSize: 14, color: '#8A94A6' }}>
          Found a bug? Have a feature idea? Let us know.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8A94A6', marginBottom: 6 }}>
              Name <span style={{ color: '#555e6e' }}>(optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 100))}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(43, 52, 65, 0.8)',
                background: 'rgba(11, 13, 17, 0.6)',
                color: '#E8EDF5',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(77, 163, 255, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(43, 52, 65, 0.8)'}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 13, color: '#8A94A6', marginBottom: 6 }}>
              Email <span style={{ color: '#555e6e' }}>(optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value.slice(0, 254))}
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 10,
                border: '1px solid rgba(43, 52, 65, 0.8)',
                background: 'rgba(11, 13, 17, 0.6)',
                color: '#E8EDF5',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(77, 163, 255, 0.5)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(43, 52, 65, 0.8)'}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#8A94A6', marginBottom: 6 }}>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(43, 52, 65, 0.8)',
              background: 'rgba(11, 13, 17, 0.6)',
              color: '#E8EDF5',
              fontSize: 14,
              outline: 'none',
              cursor: 'pointer',
              boxSizing: 'border-box',
            }}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 13, color: '#8A94A6', marginBottom: 6 }}>
            Message <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, 2000))}
            placeholder="Tell us what you think..."
            rows={5}
            required
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              border: '1px solid rgba(43, 52, 65, 0.8)',
              background: 'rgba(11, 13, 17, 0.6)',
              color: '#E8EDF5',
              fontSize: 14,
              outline: 'none',
              resize: 'vertical',
              minHeight: 120,
              boxSizing: 'border-box',
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'rgba(77, 163, 255, 0.5)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(43, 52, 65, 0.8)'}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#555e6e', marginTop: 4 }}>
            {message.length}/2000
          </div>
        </div>

        {status === 'error' && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 14px',
            borderRadius: 10,
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            marginBottom: 16,
          }}>
            <AlertCircle size={16} style={{ color: '#ef4444', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#fca5a5' }}>{errorMsg}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={status === 'submitting' || message.trim().length < 10}
          style={{
            width: '100%',
            padding: '12px 24px',
            borderRadius: 10,
            border: 'none',
            background: status === 'submitting' || message.trim().length < 10
              ? 'rgba(77, 163, 255, 0.3)'
              : 'linear-gradient(135deg, #3b82f6, #2563eb)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: status === 'submitting' || message.trim().length < 10 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: status === 'submitting' || message.trim().length < 10
              ? 'none'
              : '0 4px 14px rgba(37, 99, 235, 0.3)',
            transition: 'all 0.2s',
          }}
        >
          {status === 'submitting' ? 'Sending...' : (
            <>
              <Send size={16} />
              Send Feedback
            </>
          )}
        </button>
      </form>
    </div>
  );
}
