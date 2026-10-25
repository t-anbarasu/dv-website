'use client';

import React, { useState } from 'react';

interface DrishtiModalProps {
  onClose: () => void;
  onOpenReset: () => void;
  onOpenCalmReply: () => void;
  onOpenCrisis: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  text: string;
  toolAction?: { label: string; action: () => void };
}

export const DrishtiModal: React.FC<DrishtiModalProps> = ({
  onClose,
  onOpenReset,
  onOpenCalmReply,
  onOpenCrisis
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: "Hello Priya. I'm Drishti, your skills companion. What is happening right now in your day?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim()) return;

    // Safety check
    const lower = text.toLowerCase();
    const crisisTriggers = ['kill myself', 'end it all', 'hurt myself', 'suicide', 'die', 'can’t take this life'];
    if (crisisTriggers.some(t => lower.includes(t))) {
      onClose();
      onOpenCrisis();
      return;
    }

    const newMsgs = [...messages, { role: 'user' as const, text }];
    setMessages(newMsgs);
    setInput('');
    setIsTyping(true);

    // Contextual intelligent responses matching Drishta Vidya frameworks
    setTimeout(() => {
      let replyText = "I hear you. When things hit all at once, the nervous system enters tunnel vision. Let's separate what you can control right now from what must wait.";
      let toolAction: { label: string; action: () => void } | undefined = undefined;

      if (lower.includes('slack') || lower.includes('email') || lower.includes('message') || lower.includes('reply')) {
        replyText = "Before replying while heat is in your chest, let's craft a response that protects your boundaries without escalating tension.";
        toolAction = {
          label: '✍️ Open Calm My Reply',
          action: () => {
            onClose();
            onOpenCalmReply();
          }
        };
      } else if (lower.includes('stress') || lower.includes('overwhelm') || lower.includes('heart') || lower.includes('panic') || lower.includes('anger')) {
        replyText = "Your body is carrying high adrenaline right now. Advice won't land until we down-regulate your breath. Let's do a 60-second reset together.";
        toolAction = {
          label: '🫁 Start 60-Second Reset',
          action: () => {
            onClose();
            onOpenReset();
          }
        };
      } else if (lower.includes('meeting') || lower.includes('tomorrow') || lower.includes('prep')) {
        replyText = "For high-stakes meetings, walk in with a plan for your feelings, not just the slides. What is the single outcome that matters most to you?";
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        text: replyText,
        toolAction
      }]);
      setIsTyping(false);
    }, 900);
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" style={{ height: '82vh' }} onClick={(e) => e.stopPropagation()}>
        <div className="row between" style={{ borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
          <div className="row" style={{ gap: '10px' }}>
            <div className="drishti" />
            <div>
              <h3 style={{ fontSize: '17px' }}>Drishti</h3>
              <span className="eyebrow" style={{ fontSize: '11px' }}>AI Skills Coach</span>
            </div>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="chat" style={{ flex: 1, overflowY: 'auto', paddingRight: '4px' }}>
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role === 'user' ? 'me' : 'ai'}`}>
              <span className="who">{m.role === 'user' ? 'You' : 'Drishti'}</span>
              <div>{m.text}</div>
              {m.toolAction && (
                <div style={{ marginTop: '10px' }}>
                  <button 
                    className="btn primary small" 
                    onClick={m.toolAction.action}
                  >
                    {m.toolAction.label} &rarr;
                  </button>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="msg ai">
              <span className="who">Drishti</span>
              <div className="thinking">
                <i /><i /><i />
              </div>
            </div>
          )}
        </div>

        {/* Starter Prompt Chips */}
        {messages.length <= 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span className="eyebrow" style={{ fontSize: '11px' }}>QUICK STARTERS</span>
            <div className="wrap-row">
              {[
                "A sharp Slack message from a colleague",
                "A high-stakes meeting tomorrow",
                "Feeling behind everyone else"
              ].map((prompt) => (
                <button
                  key={prompt}
                  className="chip"
                  style={{ fontSize: '12.5px', padding: '6px 12px' }}
                  onClick={() => handleSend(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="composer">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="What is happening right now?..."
            rows={2}
          />
          <button
            className="btn primary"
            disabled={!input.trim()}
            onClick={() => handleSend()}
            aria-label="Send message"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
