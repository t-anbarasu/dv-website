'use client';

import React, { useState } from 'react';
import { CONVERSATION_SCRIPTS } from '@/lib/data';
import { ConversationScript } from '@/lib/types';

interface ScriptModalProps {
  onClose: () => void;
  initialScriptId?: string;
}

export const ScriptModal: React.FC<ScriptModalProps> = ({ onClose, initialScriptId }) => {
  const [selectedScript, setSelectedScript] = useState<ConversationScript>(
    CONVERSATION_SCRIPTS.find(s => s.id === initialScriptId) || CONVERSATION_SCRIPTS[0]
  );
  const [style, setStyle] = useState<'direct' | 'diplomatic'>('diplomatic');
  const [mode, setMode] = useState<'script' | 'rehearse' | 'feedback'>('script');
  const [mood, setMood] = useState<'calm' | 'defensive' | 'upset'>('defensive');
  const [rehearsalStep, setRehearsalStep] = useState(1);
  const [userReply, setUserReply] = useState('');
  const [chatLog, setChatLog] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);

  function startRehearsal() {
    setMode('rehearse');
    setRehearsalStep(1);
    const openingLine = mood === 'defensive' 
      ? "Look, we're all working hard here. Why are you bringing this up right now?"
      : mood === 'upset'
      ? "I can't believe you're saying this after everything I did this week!"
      : "Sure, let's talk. What did you want to discuss?";
    setChatLog([{ role: 'ai', text: openingLine }]);
  }

  function handleSendReply() {
    if (!userReply.trim()) return;

    const newLog = [...chatLog, { role: 'user' as const, text: userReply }];
    setChatLog(newLog);
    setUserReply('');

    if (rehearsalStep === 1) {
      setRehearsalStep(2);
      setTimeout(() => {
        const reply = mood === 'defensive'
          ? "I hear you, but from my side, the specs kept changing. You didn't give me enough buffer."
          : "Well, what do you expect me to do about it now?";
        setChatLog(prev => [...prev, { role: 'ai', text: reply }]);
      }, 700);
    } else {
      setTimeout(() => {
        setMode('feedback');
      }, 800);
    }
  }

  const currentWording = style === 'direct' ? selectedScript.direct : selectedScript.diplomatic;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div>
            <span className="eyebrow">Conversation Studio</span>
            <h3 style={{ fontSize: '18px', marginTop: '2px' }}>{selectedScript.title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {mode === 'script' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="row between">
              <span className="eyebrow">WORDING STYLE</span>
              <div className="seg">
                <button
                  className={style === 'diplomatic' ? 'on' : ''}
                  onClick={() => setStyle('diplomatic')}
                >
                  Diplomatic
                </button>
                <button
                  className={style === 'direct' ? 'on' : ''}
                  onClick={() => setStyle('direct')}
                >
                  Direct
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="script-step">
                <div className="n">1</div>
                <div>
                  <b>STEP 1: OPENING & GROUNDING</b>
                  <p>{currentWording.step_1}</p>
                </div>
              </div>

              <div className="script-step">
                <div className="n">2</div>
                <div>
                  <b>STEP 2: OBSERVATION & IMPACT</b>
                  <p>{currentWording.step_2}</p>
                </div>
              </div>

              <div className="script-step">
                <div className="n">3</div>
                <div>
                  <b>STEP 3: COLLABORATIVE INQUIRY</b>
                  <p>{currentWording.step_3}</p>
                </div>
              </div>

              <div className="script-step">
                <div className="n">4</div>
                <div>
                  <b>STEP 4: CLEAR BOUNDARY & NEXT STEP</b>
                  <p>{currentWording.step_4}</p>
                </div>
              </div>
            </div>

            <div className="card soft" style={{ marginTop: '8px' }}>
              <span className="eyebrow">REHEARSE WITH DRISHTI</span>
              <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 8px' }}>
                Practice delivering your lines before the real conversation. Choose their mood:
              </p>
              <div className="row wrap-row">
                {(['calm', 'defensive', 'upset'] as const).map((m) => (
                  <button
                    key={m}
                    className={`chip ${mood === m ? 'on' : ''}`}
                    onClick={() => setMood(m)}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <button 
                className="btn primary block" 
                style={{ marginTop: '12px' }}
                onClick={startRehearsal}
              >
                Start Rehearsal &rarr;
              </button>
            </div>
          </div>
        )}

        {mode === 'rehearse' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="row between">
              <span className="eyebrow">REHEARSAL (TURN {rehearsalStep}/2)</span>
              <span className="tag" style={{ textTransform: 'capitalize' }}>Mood: {mood}</span>
            </div>

            <div className="chat" style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {chatLog.map((msg, i) => (
                <div key={i} className={`msg ${msg.role === 'ai' ? 'them' : 'me'}`}>
                  <span className="who">{msg.role === 'ai' ? 'The Other Person' : 'You'}</span>
                  {msg.text}
                </div>
              ))}
            </div>

            <div className="composer">
              <textarea
                value={userReply}
                onChange={(e) => setUserReply(e.target.value)}
                placeholder="Type what you would say in response..."
                rows={2}
              />
              <button 
                className="btn primary" 
                disabled={!userReply.trim()}
                onClick={handleSendReply}
              >
                Send
              </button>
            </div>
          </div>
        )}

        {mode === 'feedback' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ textAlign: 'center' }}>
              <div className="drishti" style={{ margin: '0 auto 8px' }} />
              <h3 style={{ fontSize: '18px' }}>Rehearsal Feedback</h3>
              <p style={{ color: 'var(--muted)', fontSize: '13px' }}>
                How your responses landed with the other person:
              </p>
            </div>

            <div className="card soft">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Empathy</span>
                <strong style={{ color: 'var(--ok)' }}>4.5 / 5</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span>Clarity</span>
                <strong style={{ color: 'var(--accent)' }}>4.0 / 5</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                <span>Ownership</span>
                <strong style={{ color: 'var(--ok)' }}>5.0 / 5</strong>
              </div>
            </div>

            <div className="card accent">
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>ONE BETTER LINE:</span>
              <p style={{ fontSize: '13.5px', marginTop: '4px', fontStyle: 'italic' }}>
                "Instead of asking 'why didn't you finish?', try: 'Let's look at the bottleneck together so we protect tomorrow's delivery.'"
              </p>
            </div>

            <button className="btn primary block" onClick={() => setMode('script')}>
              Done Rehearsing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
