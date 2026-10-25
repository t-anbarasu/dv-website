'use client';

import React, { useState } from 'react';

interface CalmReplyModalProps {
  onClose: () => void;
  onOpenCrisis: () => void;
}

export const CalmReplyModal: React.FC<CalmReplyModalProps> = ({ onClose, onOpenCrisis }) => {
  const [step, setStep] = useState<'draft' | 'feeling' | 'result'>('draft');
  const [draft, setDraft] = useState('');
  const [recipient, setRecipient] = useState('Colleague');
  const [feeling, setFeeling] = useState('');
  const [copied, setCopied] = useState(false);
  const [waitTimerStarted, setWaitTimerStarted] = useState(false);

  // Safety filter check
  function handleAnalyze() {
    const lower = draft.toLowerCase();
    const crisisTriggers = ['kill myself', 'end it all', 'hurt myself', 'suicide', 'die', 'can’t take this life'];
    if (crisisTriggers.some(t => lower.includes(t))) {
      onClose();
      onOpenCrisis();
      return;
    }

    if (!draft.trim()) return;
    setStep('feeling');
  }

  function handleGenerate(selectedFeeling?: string) {
    if (selectedFeeling) setFeeling(selectedFeeling);
    setStep('result');
  }

  // Sample calm rewrite generator
  function getCalmRewrite() {
    if (draft.toLowerCase().includes('you always') || draft.toLowerCase().includes('never listen')) {
      return `Hi ${recipient}, I wanted to touch base on our current project flow. In our recent sync, I felt some key points were missed which impacted the timeline. Could we set aside 10 minutes to align on next steps together?`;
    }
    return `Hi ${recipient}, thanks for following up. Regarding this request, I want to ensure we maintain our committed quality standards. Taking this on immediately would impact our QA schedule for Friday. Could we prioritize the core deliverables first, or look at Tuesday for delivery?`;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow">Utility</span>
            <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Calm My Reply</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'draft' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
              Paste your raw, heated draft. We will rewrite it to keep your point firm while stripping out the blame that triggers defensiveness.
            </p>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                WHO IS THIS FOR?
              </label>
              <select 
                value={recipient} 
                onChange={(e) => setRecipient(e.target.value)}
              >
                <option value="Colleague">Colleague / Peer</option>
                <option value="Manager">Manager / Senior</option>
                <option value="Client">Client / External</option>
                <option value="Direct Report">Direct Report</option>
                <option value="Partner">Partner / Spouse</option>
                <option value="Family Member">Family Member</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                YOUR DRAFT ({draft.length}/2000)
              </label>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Paste what you want to fire back right now..."
                rows={4}
                maxLength={2000}
              />
            </div>

            <button
              className="btn primary block"
              disabled={!draft.trim()}
              onClick={handleAnalyze}
            >
              Calm it down &rarr;
            </button>
          </div>
        )}

        {step === 'feeling' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="drishti" style={{ margin: '0 auto 10px' }} />
              <h3 style={{ fontSize: '18px' }}>What word is driving this draft?</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13.5px', marginTop: '4px' }}>
                Naming it helps Drishti protect what you actually care about.
              </p>
            </div>

            <div className="wrap-row" style={{ justifyContent: 'center' }}>
              {['Frustrated', 'Cornered', 'Urgent', 'Hurt', 'Tired'].map((word) => (
                <button
                  key={word}
                  className="chip"
                  onClick={() => handleGenerate(word)}
                  style={{ padding: '8px 16px', fontSize: '14px' }}
                >
                  {word}
                </button>
              ))}
            </div>

            <button 
              className="btn ghost small"
              onClick={() => handleGenerate('Skip')}
              style={{ marginTop: '8px' }}
            >
              Skip naming & rewrite now
            </button>
          </div>
        )}

        {step === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="card accent">
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>CALMED VERSION</span>
              <p style={{ fontSize: '15px', lineHeight: 1.5, marginTop: '2px' }}>
                {getCalmRewrite()}
              </p>
            </div>

            <div className="card soft">
              <span className="eyebrow">WHAT CHANGED & WHY</span>
              <ul style={{ margin: '4px 0 0', paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.6 }}>
                <li>Replaced accusations with a concrete boundary.</li>
                <li>Preserved your core request without inflammatory adjectives.</li>
                <li>Ended with an open collaborative choice instead of an ultimatum.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className="btn primary block"
                onClick={() => {
                  navigator.clipboard.writeText(getCalmRewrite());
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? '✓ Copied to clipboard' : 'Copy Message'}
              </button>

              <button
                className={`btn ${waitTimerStarted ? 'primary' : 'ghost'}`}
                onClick={() => setWaitTimerStarted(!waitTimerStarted)}
                title="Wait 10 minutes before sending"
              >
                {waitTimerStarted ? '⏱️ Waiting 10m' : 'Wait 10m'}
              </button>
            </div>

            <p style={{ fontSize: '12px', color: 'var(--faint)', textAlign: 'center' }}>
              Drafts are not stored after this session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
