'use client';

import React, { useState } from 'react';

interface CrisisModalProps {
  onClose: () => void;
}

export const CrisisModal: React.FC<CrisisModalProps> = ({ onClose }) => {
  const [followUpRequested, setFollowUpRequested] = useState(false);
  const [contactInfo, setContactInfo] = useState('');

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet crisis" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--crit-soft)', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow" style={{ color: 'var(--crit)' }}>URGENT SUPPORT</span>
            <h3 style={{ fontSize: '19px', marginTop: '2px', color: 'var(--crit)' }}>Crisis & Helpline Route</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p style={{ fontSize: '14px', lineHeight: 1.5 }}>
          If you or someone close to you is in acute emotional crisis, experiencing thoughts of self-harm, or in danger, please reach out to professional human support immediately.
        </p>

        <div className="card" style={{ background: 'var(--surface)', border: '1px solid var(--crit)' }}>
          <span className="eyebrow" style={{ color: 'var(--crit)' }}>INDIA NATIONAL HELPLINE (FREE · 24/7)</span>
          <div className="number" style={{ color: 'var(--crit)', margin: '4px 0' }}>
            14416
          </div>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Tele-MANAS (National Tele Mental Health Programme of India). Free, confidential, and available in Tamil, English, Hindi, and 20+ languages.
          </p>
          <div className="row" style={{ marginTop: '10px' }}>
            <a 
              href="tel:14416" 
              className="btn primary" 
              style={{ background: 'var(--crit)', borderColor: 'var(--crit)', flex: 1 }}
            >
              📞 Call 14416 Now
            </a>
            <a 
              href="tel:18008914416" 
              className="btn ghost small"
            >
              1-800-891-4416
            </a>
          </div>
        </div>

        <div className="card soft">
          <span className="eyebrow">OUTSIDE INDIA?</span>
          <a 
            href="https://findahelpline.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="link"
            style={{ fontSize: '14px', marginTop: '4px' }}
          >
            Find A Helpline in 175+ countries &rarr;
          </a>
        </div>

        {!followUpRequested ? (
          <div className="card soft">
            <span className="eyebrow">DRISHTA VIDYA COACH FOLLOW-UP</span>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 8px' }}>
              Want a member of our coaching team to reach out to you today?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Your phone number or email..."
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                className="btn primary"
                disabled={!contactInfo.trim()}
                onClick={() => setFollowUpRequested(true)}
              >
                Request
              </button>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--faint)', marginTop: '4px' }}>
              Only your contact info and time are sent; your private entries are never shared.
            </span>
          </div>
        ) : (
          <div className="card" style={{ background: 'var(--surface)', textAlign: 'center', padding: '16px' }}>
            <span style={{ fontSize: '24px' }}>🤝</span>
            <b style={{ display: 'block', fontSize: '14.5px', marginTop: '4px' }}>Follow-Up Alert Sent</b>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
              An on-call coach has been notified to connect with you. Please take slow breaths.
            </p>
          </div>
        )}

        <button className="btn block" onClick={onClose} style={{ marginTop: '4px' }}>
          Close
        </button>
      </div>
    </div>
  );
};
