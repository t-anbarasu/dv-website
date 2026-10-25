'use client';

import React, { useState } from 'react';

interface CheckInModalProps {
  onClose: () => void;
  onOpenAtlas: () => void;
  onSave: (word: string, intensity: number) => void;
}

const CHECKIN_WORDS = [
  'calm', 'content', 'grateful', 'stretched',
  'anxious', 'frustrated', 'resentful', 'hurt',
  'lonely', 'behind', 'guilty', 'low'
];

export const CheckInModal: React.FC<CheckInModalProps> = ({ onClose, onOpenAtlas, onSave }) => {
  const [selectedWord, setSelectedWord] = useState('behind');
  const [intensity, setIntensity] = useState(5);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    onSave(selectedWord, intensity);
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 900);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between">
          <div>
            <span className="eyebrow">QUICK CHECK-IN</span>
            <h3 style={{ fontSize: '20px', marginTop: '2px' }}>Check In</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
          One word and how strong it is. Thirty seconds.
        </p>

        {/* Word Chips */}
        <div className="wrap-row" role="group" aria-label="Feeling words">
          {CHECKIN_WORDS.map((w) => (
            <button
              key={w}
              className={`chip ${selectedWord === w ? 'on' : ''}`}
              onClick={() => setSelectedWord(w)}
            >
              {w}
            </button>
          ))}
        </div>

        <button 
          className="link" 
          onClick={() => {
            onClose();
            onOpenAtlas();
          }}
          style={{ textAlign: 'left', fontSize: '13px', fontWeight: 600 }}
        >
          More words in the Emotion Atlas &rarr;
        </button>

        {/* Intensity Slider Card */}
        <div className="card">
          <div className="row between">
            <span className="eyebrow">HOW STRONG?</span>
            <span className="big-num tnum" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent)' }}>
              {intensity}/10
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent)', marginTop: '8px' }}
            aria-label="Emotion intensity"
          />
          <div className="row between" style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px' }}>
            <span>1 Mild</span>
            <span>5 Moderate</span>
            <span>10 Acute</span>
          </div>
        </div>

        {saved ? (
          <div className="card accent" style={{ textAlign: 'center', padding: '12px' }}>
            <span style={{ fontWeight: 600, color: 'var(--ok)' }}>✓ Check-in logged</span>
          </div>
        ) : (
          <button 
            className="btn primary block"
            onClick={handleSave}
          >
            Save check-in
          </button>
        )}
      </div>
    </div>
  );
};
