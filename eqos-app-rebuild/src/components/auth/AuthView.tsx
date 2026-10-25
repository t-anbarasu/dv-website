'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { DEFAULT_PROFILES } from '@/lib/data';
import { AuthUser, setCurrentUser } from '@/lib/auth';

interface AuthViewProps {
  onAuthenticated: (user: AuthUser, profile: UserProfile) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [lang, setLang] = useState('ta');
  const [goal, setGoal] = useState('self');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!name.trim() || !email.trim() || !password) {
          setError('Please fill in your name, email, and password.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password,
            preferredLanguage: lang,
            goal
          })
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Signup failed. Please try again.');
          setLoading(false);
          return;
        }

        const authUser: AuthUser = data.user;
        setCurrentUser(authUser);

        // Build customized profile
        const newProfile: UserProfile = {
          ...DEFAULT_PROFILES.priya,
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          phone: authUser.phone || '',
          ini: authUser.name.charAt(0).toUpperCase(),
          lang: authUser.preferredLanguage || lang,
          languages: [lang, 'en'],
          goal
        };

        onAuthenticated(authUser, newProfile);
      } else {
        // Sign In
        if (!email.trim() || !password) {
          setError('Please enter your email or phone and password.');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/signin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: email.trim(),
            password
          })
        });

        const data = await res.json();
        if (!data.success) {
          setError(data.error || 'Invalid credentials.');
          setLoading(false);
          return;
        }

        const authUser: AuthUser = data.user;
        setCurrentUser(authUser);

        const loadedProfile: UserProfile = {
          ...DEFAULT_PROFILES.priya,
          id: authUser.id,
          name: authUser.name,
          email: authUser.email,
          phone: authUser.phone || '',
          ini: authUser.name.charAt(0).toUpperCase(),
          lang: authUser.preferredLanguage || 'ta'
        };

        onAuthenticated(authUser, loadedProfile);
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = (personaKey: string) => {
    const p = DEFAULT_PROFILES[personaKey] || DEFAULT_PROFILES.priya;
    const authUser: AuthUser = {
      id: p.id,
      name: p.name,
      email: p.email,
      phone: p.phone,
      role: 'user',
      preferredLanguage: p.lang
    };
    setCurrentUser(authUser);
    onAuthenticated(authUser, p);
  };

  return (
    <div className="screen" style={{ padding: '24px 20px', minHeight: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px', marginTop: '10px' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '54px',
          height: '54px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, var(--accent), #f97316)',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '22px',
          boxShadow: '0 8px 24px rgba(234, 88, 12, 0.25)',
          marginBottom: '12px'
        }}>
          EQ
        </div>
        <span className="eyebrow" style={{ letterSpacing: '0.12em' }}>
          DRISHTA VIDYA
        </span>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '4px 0 6px', letterSpacing: '-0.02em' }}>
          Welcome to EQ OS
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--muted)', margin: '0 auto', maxWidth: '320px', lineHeight: 1.4 }}>
          The operating system for emotional intelligence, calm communication, and psychological agility.
        </p>
      </div>

      {/* Auth Mode Toggle Pill */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--surface-sunken)',
        padding: '4px',
        borderRadius: '10px',
        border: '1px solid var(--line)',
        marginBottom: '20px'
      }}>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); }}
          style={{
            padding: '8px',
            fontSize: '13px',
            fontWeight: mode === 'signup' ? 700 : 500,
            color: mode === 'signup' ? 'var(--ink)' : 'var(--muted)',
            background: mode === 'signup' ? 'var(--surface)' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            boxShadow: mode === 'signup' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          First time? Sign up
        </button>
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null); }}
          style={{
            padding: '8px',
            fontSize: '13px',
            fontWeight: mode === 'signin' ? 700 : 500,
            color: mode === 'signin' ? 'var(--ink)' : 'var(--muted)',
            background: mode === 'signin' ? 'var(--surface)' : 'transparent',
            border: 'none',
            borderRadius: '7px',
            cursor: 'pointer',
            boxShadow: mode === 'signin' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
            transition: 'all 0.15s ease'
          }}
        >
          Returning user? Sign in
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: 'color-mix(in srgb, var(--crit) 12%, transparent)',
          color: 'var(--crit)',
          border: '1px solid var(--crit-soft)',
          padding: '10px 14px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {mode === 'signup' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Your Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Priya Raman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
            {mode === 'signup' ? 'Email Address *' : 'Email or Phone Number *'}
          </label>
          <input
            type={mode === 'signup' ? 'email' : 'text'}
            placeholder={mode === 'signup' ? 'priya@example.com' : 'priya@example.com or phone'}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {mode === 'signup' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Phone / WhatsApp
              </label>
              <input
                type="tel"
                placeholder="+91 98400 12345"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '13.5px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Preferred Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '13.5px'
                }}
              >
                <option value="ta">Tamil (வணக்கம்)</option>
                <option value="en">English (Welcome)</option>
                <option value="hi">Hindi (नमस्ते)</option>
                <option value="pt">Português (Olá)</option>
                <option value="es">Español (Hola)</option>
              </select>
            </div>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
            Password or Passcode *
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          className="btn primary"
          disabled={loading}
          style={{
            marginTop: '8px',
            padding: '12px',
            fontSize: '14px',
            fontWeight: 700,
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
          }}
        >
          {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account & Enter OS →' : 'Sign In to EQ OS →'}
        </button>
      </form>

      {/* Demo Persona Shortcuts */}
      <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
          <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Or try with sample persona
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            type="button"
            onClick={() => handleDemoSignIn('priya')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#f97316',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>P</span>
            <b style={{ fontSize: '12px', color: 'var(--ink)' }}>Priya</b>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Tamil · Tech</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSignIn('amit')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#3b82f6',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>A</span>
            <b style={{ fontSize: '12px', color: 'var(--ink)' }}>Amit</b>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Hindi · Founder</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoSignIn('lucas')}
            style={{
              padding: '8px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              cursor: 'pointer',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px'
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#10b981',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>L</span>
            <b style={{ fontSize: '12px', color: 'var(--ink)' }}>Lucas</b>
            <span style={{ fontSize: '10px', color: 'var(--muted)' }}>Português</span>
          </button>
        </div>
      </div>
    </div>
  );
};
