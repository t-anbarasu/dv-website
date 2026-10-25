'use client';

import React, { useState } from 'react';

interface DecodeModalProps {
  onClose: () => void;
  onSaveCheckin?: (word: string) => void;
}

export const DecodeModal: React.FC<DecodeModalProps> = ({ onClose, onSaveCheckin }) => {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [who, setWho] = useState('Colleague');
  const [actionText, setActionText] = useState('');
  const [myFeeling, setMyFeeling] = useState('');

  function handleDecode() {
    if (!actionText.trim()) return;
    setStep('result');
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow">Utility</span>
            <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Decode Someone Else</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {step === 'input' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
              When someone snaps, withdraws, or acts unpredictably, decode what unmet emotional need might be driving their behavior.
            </p>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                WHO WAS IT?
              </label>
              <select value={who} onChange={(e) => setWho(e.target.value)}>
                <option value="Colleague">Colleague / Peer</option>
                <option value="Manager">Manager / Senior</option>
                <option value="Direct Report">Direct Report</option>
                <option value="Partner">Partner / Spouse</option>
                <option value="Teenager">Teenager / Child</option>
                <option value="Parent">Parent / Relative</option>
                <option value="Client">Client</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                WHAT DID THEY DO OR SAY? (Facts only)
              </label>
              <textarea
                value={actionText}
                onChange={(e) => setActionText(e.target.value)}
                placeholder="e.g., In the review meeting, they rolled their eyes and abruptly said 'Fine, do whatever you want' then muted."
                rows={4}
                maxLength={1000}
              />
            </div>

            <button
              className="btn primary block"
              disabled={!actionText.trim()}
              onClick={handleDecode}
            >
              Decode Possibilities &rarr;
            </button>
          </div>
        )}

        {step === 'result' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="note" style={{ fontStyle: 'italic', background: 'var(--surface-2)', padding: '8px 12px', borderRadius: '8px' }}>
              💡 These are possibilities to check with curiosity, never a diagnosis or certainty.
            </div>

            <div className="card">
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>3 POSSIBLE FEELINGS</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13.5px' }}>
                <div>
                  <strong>1. Overwhelmed:</strong> Carrying multiple competing deadlines with fear of falling short.
                </div>
                <div>
                  <strong>2. Unheard:</strong> Feeling that their previous warnings or technical advice were dismissed.
                </div>
                <div>
                  <strong>3. Cornered:</strong> Defending against public embarrassment in front of other stakeholders.
                </div>
              </div>
            </div>

            <div className="card soft">
              <span className="eyebrow">WHAT THEY MIGHT NEED</span>
              <p style={{ fontSize: '13.5px', marginTop: '2px' }}>
                Psychological breathing room and reassurance that their competence is not under attack.
              </p>

              <div style={{ marginTop: '8px', borderTop: '1px solid var(--line)', paddingTop: '8px' }}>
                <b style={{ fontSize: '12px', color: 'var(--ok)' }}>ONE LINE TO CHECK IT:</b>
                <p style={{ fontSize: '13.5px', fontStyle: 'italic', marginTop: '2px' }}>
                  "Hey, that exchange earlier felt tense. It seems like you're balancing a huge load right now—is there something we're missing?"
                </p>
              </div>

              <div style={{ marginTop: '8px', borderTop: '1px dashed var(--line)', paddingTop: '8px' }}>
                <b style={{ fontSize: '12px', color: 'var(--crit)' }}>ONE THING TO AVOID:</b>
                <p style={{ fontSize: '13.5px', marginTop: '2px' }}>
                  Do not lecture them on "professional tone" while they are in emotional fight-or-flight.
                </p>
              </div>
            </div>

            <div className="card soft">
              <span className="eyebrow">AND YOU? HOW DID IT LEAVE YOU?</span>
              <div className="wrap-row" style={{ marginTop: '6px' }}>
                {['Frustrated', 'Confused', 'Stung', 'Tired', 'Neutral'].map((word) => (
                  <button
                    key={word}
                    className={`chip ${myFeeling === word ? 'on' : ''}`}
                    onClick={() => {
                      setMyFeeling(word);
                      if (onSaveCheckin) onSaveCheckin(word);
                    }}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn primary block" onClick={onClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
