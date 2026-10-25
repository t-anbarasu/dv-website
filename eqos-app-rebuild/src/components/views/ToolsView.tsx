'use client';

import React, { useState } from 'react';
import { RESET_SCRIPTS, REFLECTION_TOOLS, CONVERSATION_SCRIPTS } from '@/lib/data';
import { ReflectionTool } from '@/lib/types';

interface ToolsViewProps {
  onOpenReset: () => void;
  onOpenCalmReply: () => void;
  onOpenDecode: () => void;
  onOpenScript: (scriptId?: string) => void;
  onOpenCheckIn: () => void;
  onOpenVideo: (clipId: string) => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  onOpenReset,
  onOpenCalmReply,
  onOpenDecode,
  onOpenScript,
  onOpenCheckIn,
  onOpenVideo
}) => {
  const [filter, setFilter] = useState<'All' | 'Before' | 'During' | 'After' | 'Grow'>('All');
  const [activeStepTool, setActiveStepTool] = useState<ReflectionTool | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [toolAnswers, setToolAnswers] = useState<Record<number, string>>({});
  const [toolCompleted, setToolCompleted] = useState(false);

  function handleStartStepTool(tool: ReflectionTool) {
    setActiveStepTool(tool);
    setCurrentStepIndex(0);
    setToolAnswers({});
    setToolCompleted(false);
  }

  // 7 engines directly from Screen 27 (screens/27-tools-by-engine.png)
  const learningCards = [
    { id: 'card-secondary', vid: 'v-secondary', name: 'Anger is often a secondary emotion', mins: '2 min' },
    { id: 'card-expect', vid: 'v-expect', name: 'What I expect vs what I express', mins: '2 min' },
    { id: 'card-impact', vid: 'v-impact', name: 'Impact vs intention', mins: '2 min' },
    { id: 'card-naming', vid: 'v-naming', name: 'Why naming a feeling helps', mins: '2 min' }
  ];

  return (
    <div className="screen">
      {!activeStepTool ? (
        <>
          {/* Note Banner at top */}
          <div className="card soft">
            <p style={{ fontSize: '13.5px', color: 'var(--ink)' }}>
              Every tool runs on one of seven engines. A tool is content plus tags, so new tools and languages need no new code.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="wrap-row" role="group" aria-label="Filter by moment">
            {(['All', 'Before', 'During', 'After', 'Grow'] as const).map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`chip ${filter === tag ? 'on' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Engine 1: Reset Player */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px' }}>Reset player</h3>
              <span className="note tnum" style={{ fontSize: '13px', color: 'var(--muted)' }}>6</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '8px' }}>
              Guided breathing, grounding and short resets
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {RESET_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  onClick={onOpenReset}
                  className="tool"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '13px',
                      color: 'var(--accent)',
                      flex: 'none'
                    }}
                  >
                    〰
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: '14px' }}>{script.title}</b>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{script.description}</span>
                  </div>
                  <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>
                    {script.duration_seconds} sec
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Engine 2: Conversation Studio */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px' }}>Conversation studio</h3>
              <span className="note tnum" style={{ fontSize: '13px', color: 'var(--muted)' }}>8</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '8px' }}>
              Scripts for hard conversations, with AI rehearsal
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {CONVERSATION_SCRIPTS.map((script) => (
                <button
                  key={script.id}
                  onClick={() => onOpenScript(script.id)}
                  className="tool"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '13px',
                      color: 'var(--f-fear)',
                      flex: 'none'
                    }}
                  >
                    💬
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: '14px' }}>{script.title}</b>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{script.description}</span>
                  </div>
                  <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>
                    5 min
                  </span>
                </button>
              ))}
              {/* Decode someone else & Calm my reply */}
              <button
                onClick={onOpenDecode}
                className="tool"
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    color: 'var(--f-fear)',
                    flex: 'none'
                  }}
                >
                  💬
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: '14px' }}>Decode someone else</b>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Understand what might be going on for them, before you react.</span>
                </div>
                <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>2 min</span>
              </button>

              <button
                onClick={onOpenCalmReply}
                className="tool"
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    border: '1px solid var(--line)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    color: 'var(--f-fear)',
                    flex: 'none'
                  }}
                >
                  💬
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: '14px' }}>Calm my reply</b>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Paste a message before you send it. Drishti keeps your point and takes the heat out.</span>
                </div>
                <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>1 min</span>
              </button>
            </div>
          </div>

          {/* Engine 3: Reflection & Planning */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px' }}>Reflection and planning</h3>
              <span className="note tnum" style={{ fontSize: '13px', color: 'var(--muted)' }}>15</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '8px' }}>
              Guided questions before and after a moment
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {REFLECTION_TOOLS.map((tool) => (
                <button
                  key={tool.tool_id}
                  onClick={() => handleStartStepTool(tool)}
                  className="tool"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--line)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '13px',
                      color: 'var(--f-overwhelm)',
                      flex: 'none'
                    }}
                  >
                    📝
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: '14px' }}>{tool.title}</b>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {tool.steps[0]?.prompt.slice(0, 50)}...
                    </span>
                  </div>
                  <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>
                    {tool.minutes} min
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Engine 4: Learning Cards (with Videos!) */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px' }}>Learning cards</h3>
              <span className="note tnum" style={{ fontSize: '13px', color: 'var(--muted)' }}>4</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '8px' }}>
              Three-minute ideas from the programs with video demonstrations
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {learningCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => onOpenVideo(card.vid)}
                  className="tool"
                  style={{
                    width: '100%',
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    textAlign: 'left',
                    cursor: 'pointer'
                  }}
                >
                  <span 
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--accent-soft)',
                      color: 'var(--accent)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '13px',
                      flex: 'none'
                    }}
                  >
                    ▶
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b style={{ display: 'block', fontSize: '14px' }}>{card.name}</b>
                    <span style={{ fontSize: '12px', color: 'var(--accent)' }}>Watch video brief</span>
                  </div>
                  <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>
                    {card.mins}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Engine 5: Check-in and Assessment */}
          <div>
            <div className="row between" style={{ marginBottom: '6px' }}>
              <h3 style={{ fontSize: '16px' }}>Check-in and assessment</h3>
              <span className="note tnum" style={{ fontSize: '13px', color: 'var(--muted)' }}>3</span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginBottom: '8px' }}>
              Feeling, intensity, EQ self-check, micro-360
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={onOpenCheckIn}
                className="tool"
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--line)',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--surface-2)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    flex: 'none'
                  }}
                >
                  🎯
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: '14px' }}>Check in</b>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>A feeling word and how strong it is.</span>
                </div>
                <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>30 sec</span>
              </button>

              <div
                className="card soft"
                style={{
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <span 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--surface)',
                    display: 'grid',
                    placeItems: 'center',
                    fontSize: '13px',
                    flex: 'none'
                  }}
                >
                  📊
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ display: 'block', fontSize: '14px' }}>Self-check</b>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>An optional five-question self-check every 90 days.</span>
                </div>
                <span className="meta" style={{ fontSize: '12px', color: 'var(--muted)', flex: 'none' }}>2 min</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* In-progress Reflection Tool Flow */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <button 
            onClick={() => setActiveStepTool(null)}
            className="link note"
            style={{ alignSelf: 'flex-start', cursor: 'pointer', fontSize: '13px' }}
          >
            &larr; Back to all tools
          </button>

          <div>
            <span className="eyebrow">{activeStepTool.phase.toUpperCase()} · {activeStepTool.minutes} MINS</span>
            <h2 style={{ fontSize: '22px', marginTop: '2px' }}>{activeStepTool.title}</h2>
          </div>

          {!toolCompleted ? (
            <>
              {/* Stepper Dots */}
              <div className="stepper" style={{ display: 'flex', gap: '6px', margin: '4px 0' }}>
                {activeStepTool.steps.map((_, i) => (
                  <i 
                    key={i} 
                    style={{
                      flex: 1,
                      height: '4px',
                      borderRadius: '2px',
                      background: i <= currentStepIndex ? 'var(--accent)' : 'var(--sunk)'
                    }} 
                  />
                ))}
              </div>

              <span className="note tnum" style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                Step {currentStepIndex + 1} of {activeStepTool.steps.length}
              </span>

              <p className="prompt" style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1.35 }}>
                {activeStepTool.steps[currentStepIndex].prompt}
              </p>

              <textarea
                value={toolAnswers[currentStepIndex] || ''}
                onChange={(e) => setToolAnswers({ ...toolAnswers, [currentStepIndex]: e.target.value })}
                placeholder={activeStepTool.steps[currentStepIndex].placeholder || "Write here, or leave it blank..."}
                rows={5}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  fontSize: '14.5px',
                  lineHeight: 1.5,
                  resize: 'none'
                }}
              />

              <div className="row between" style={{ marginTop: '8px' }}>
                {currentStepIndex > 0 ? (
                  <button 
                    className="btn ghost"
                    onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                  >
                    Back
                  </button>
                ) : <span />}

                <button 
                  className="btn primary"
                  onClick={() => {
                    if (currentStepIndex < activeStepTool.steps.length - 1) {
                      setCurrentStepIndex(currentStepIndex + 1);
                    } else {
                      setToolCompleted(true);
                    }
                  }}
                >
                  {currentStepIndex === activeStepTool.steps.length - 1 ? 'Finish' : 'Next'}
                </button>
              </div>
            </>
          ) : (
            /* Completed Summary */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="card accent">
                <span className="eyebrow">DONE</span>
                <p style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px' }}>
                  Here is what you wrote.
                </p>
              </div>

              {activeStepTool.steps.map((st, i) => (
                <div key={i} className="card soft">
                  <span className="eyebrow" style={{ color: 'var(--muted)' }}>{st.prompt}</span>
                  <p style={{ fontSize: '14px', marginTop: '4px' }}>
                    {toolAnswers[i] || 'Left blank'}
                  </p>
                </div>
              ))}

              <div className="card" style={{ gap: '8px' }}>
                <span className="eyebrow">DRISHTI REFLECTS</span>
                <p style={{ fontSize: '13.5px', color: 'var(--muted)' }}>
                  You noticed a clear boundary between the event itself and your emotional interpretation of it. This separation builds agency.
                </p>
              </div>

              <button 
                className="btn primary block"
                onClick={() => setActiveStepTool(null)}
              >
                Back to Tools
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
