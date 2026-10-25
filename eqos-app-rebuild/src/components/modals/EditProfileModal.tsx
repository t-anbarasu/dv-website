'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { AVAILABLE_LANGUAGES, GOALS } from '@/lib/data';

interface EditProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: UserProfile) => Promise<void> | void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleLanguage = (code: string) => {
    const current = formData.languages || [];
    let updated: string[];
    if (current.includes(code)) {
      if (current.length === 1) return; // Keep at least one language
      updated = current.filter(c => c !== code);
    } else {
      updated = [...current, code];
    }

    // Auto-update langLabel
    const names = updated.map(c => {
      const match = AVAILABLE_LANGUAGES.find(l => l.code === c);
      return match ? match.name.split(' ')[0] : c;
    });

    setFormData(prev => ({
      ...prev,
      languages: updated,
      langLabel: names.join(' + ')
    }));
  };

  const handlePreferredLangChange = (code: string) => {
    // Ensure it's in languages list
    const current = formData.languages || [];
    const updatedLangs = current.includes(code) ? current : [...current, code];
    const names = updatedLangs.map(c => {
      const match = AVAILABLE_LANGUAGES.find(l => l.code === c);
      return match ? match.name.split(' ')[0] : c;
    });

    setFormData(prev => ({
      ...prev,
      lang: code,
      languages: updatedLangs,
      langLabel: names.join(' + ')
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);

    try {
      const updatedProfile: UserProfile = {
        ...formData,
        ini: formData.name.trim().charAt(0).toUpperCase() || 'U'
      };

      await onSave(updatedProfile);
      setStatusMessage('✓ Profile details saved successfully');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err) {
      setStatusMessage('Error saving changes. Saved locally.');
      setTimeout(() => {
        onClose();
      }, 1000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="Edit Profile Details">
      <div 
        className="modal-sheet" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <span className="eyebrow">YOUR PROFILE & ACCOUNT</span>
            <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Edit Details</h3>
          </div>
          <button 
            onClick={onClose} 
            className="icon-btn" 
            style={{ width: '32px', height: '32px' }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {statusMessage && (
          <div style={{ 
            padding: '8px 12px', 
            borderRadius: '8px', 
            background: 'var(--accent-soft)', 
            color: 'var(--accent)', 
            fontSize: '13px', 
            fontWeight: 600,
            marginBottom: '14px' 
          }}>
            {statusMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Priya"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Email Address *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="e.g. priya@example.com"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Phone / WhatsApp */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Phone / WhatsApp Number (for Daily Reminders)
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 98765 43210"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '2px', display: 'block' }}>
              Used strictly for optional WhatsApp reminders. Never shared or sold.
            </span>
          </div>

          {/* Preferred Language */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
              Preferred App & Greeting Language *
            </label>
            <select
              value={formData.lang}
              onChange={(e) => handlePreferredLangChange(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            >
              <option value="ta">Tamil (தமிழ்) - வணக்கம்</option>
              <option value="en">English - Good morning</option>
              <option value="hi">Hindi (हिन्दी) - नमस्ते</option>
              <option value="pt">Portuguese (Português) - Bom dia</option>
              <option value="es">Spanish (Español) - Buenos días</option>
            </select>
          </div>

          {/* Languages Spoken (Multi-select) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '6px' }}>
              All Languages You Speak
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {AVAILABLE_LANGUAGES.map(lang => {
                const active = (formData.languages || []).includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleLanguage(lang.code)}
                    className={`chip ${active ? 'on' : ''}`}
                    style={{ fontSize: '12.5px', padding: '4px 10px', minHeight: '30px' }}
                  >
                    {active ? '✓ ' : ''}{lang.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location: Country & City */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. India"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. Bengaluru"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Age Band & Main Goal */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Age Band
              </label>
              <select
                value={formData.band}
                onChange={(e) => setFormData({ ...formData, band: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px'
                }}
              >
                <option value="18–24">18–24</option>
                <option value="25–34">25–34</option>
                <option value="35–49">35–49</option>
                <option value="50–64">50–64</option>
                <option value="65+">65+</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
                Main Goal
              </label>
              <select
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px'
                }}
              >
                {Object.entries(GOALS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Role */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Role / Profession
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              placeholder="e.g. Software engineer"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Household Context */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--muted)', marginBottom: '4px' }}>
              Household Context
            </label>
            <input
              type="text"
              value={formData.household}
              onChange={(e) => setFormData({ ...formData, household: e.target.value })}
              placeholder="e.g. Shared hostel; family in Madurai"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              className="btn" 
              style={{ flex: 1 }}
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn primary" 
              style={{ flex: 1.5 }}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
