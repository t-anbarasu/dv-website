'use client';

import React, { useState, useEffect } from 'react';

interface ResetModalProps {
  onClose: () => void;
  onOpenAtlasWithName?: (word: string) => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({ onClose, onOpenAtlasWithName }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [promptText, setPromptText] = useState('Feet flat on the floor. Soften your jaw.');
  const [isFinished, setIsFinished] = useState(false);
  const [namedWord, setNamedWord] = useState('');

  // 10s cycles: 4s in, 6s out
  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setIsFinished(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isFinished]);

  // Breathing cycle animation & prompts
  useEffect(() => {
    if (isFinished) return;

    const elapsed = 60 - secondsLeft;
    const cyclePos = elapsed % 10;

    if (cyclePos < 4) {
      setPhase('in');
    } else {
      setPhase('out');
    }

    if (elapsed < 10) {
      setPromptText('Feet flat on the floor. Soften your jaw.');
    } else if (elapsed < 30) {
      setPromptText(phase === 'in' ? 'Breathe in through nose for 4...' : 'Exhale slowly through mouth for 6...');
    } else if (elapsed < 50) {
      setPromptText('Notice the weight of your body supported by the ground.');
    } else {
      setPromptText('You are steady. You are right here.');
    }
  }, [secondsLeft, phase, isFinished]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow">60-Second Reset</span>
            <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Guided Breathing</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {!isFinished ? (
          <div className="player">
            <div className="orb-wrap">
              <div className="orb-ring" />
              <div 
                className={`orb ${phase === 'in' ? 'in' : 'out'}`} 
                style={{
                  transitionDuration: phase === 'in' ? '4s' : '6s'
                }}
              />
            </div>

            <div className="phase">
              {phase === 'in' ? 'Breathe in' : 'Breathe out slowly'}
            </div>

            <div className="say">
              {promptText}
            </div>

            <div style={{ fontFamily: 'var(--display)', fontSize: '24px', fontWeight: 700, color: 'var(--muted)' }}>
              {secondsLeft}s
            </div>

            <button 
              className="btn ghost small"
              onClick={() => setIsFinished(true)}
              style={{ marginTop: '8px' }}
            >
              Skip to finish
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBlock: '8px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '42px', marginBottom: '8px' }}>🌱</div>
              <h2 style={{ fontSize: '22px' }}>Feeling a bit steadier?</h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
                Naming what happened helps your brain process the emotion without reactivity.
              </p>
            </div>

            <div className="card soft">
              <b style={{ fontSize: '13px', color: 'var(--muted)' }}>WHAT WAS AT THE CORE?</b>
              <div className="wrap-row" style={{ marginTop: '4px' }}>
                {['Frustrated', 'Cornered', 'Anxious', 'Hurt', 'Overwhelmed', 'Disappointed'].map((word) => (
                  <button
                    key={word}
                    className={`chip ${namedWord === word ? 'on' : ''}`}
                    onClick={() => setNamedWord(word)}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn primary block"
                onClick={() => {
                  if (namedWord && onOpenAtlasWithName) {
                    onOpenAtlasWithName(namedWord);
                  }
                  onClose();
                }}
              >
                {namedWord ? `Explore ${namedWord} in Atlas` : 'Finish'}
              </button>
              <button className="btn ghost" onClick={onClose}>
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
