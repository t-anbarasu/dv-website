'use client';

import React, { useState, useEffect } from 'react';
import { 
  EMOTION_FAMILIES, 
  ATLAS_EMOTIONS, 
  PROGRAMS, 
  VIDEOS, 
  REFLECTION_TOOLS 
} from '@/lib/data';
import { EmotionItem, ReflectionTool, ProgramItem } from '@/lib/types';
import { getAllTools, getAllPrograms } from '@/lib/contentStore';

interface LibraryViewProps {
  onOpenReset: () => void;
  onOpenCalmReply: () => void;
  onOpenDecode: () => void;
  onOpenScript: (scriptId?: string) => void;
  onOpenCheckIn: () => void;
  onOpenProgram: (programId: string) => void;
  onOpenVideo: (clipId: string) => void;
  onOpenCrisis: () => void;
}

type LibraryFilter = 'all' | 'engines' | 'atlas' | 'programs' | 'videos';

export const LibraryView: React.FC<LibraryViewProps> = ({
  onOpenReset,
  onOpenCalmReply,
  onOpenDecode,
  onOpenScript,
  onOpenCheckIn,
  onOpenProgram,
  onOpenVideo,
  onOpenCrisis
}) => {
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic Tools & Programs from Store / Admin
  const [allTools, setAllTools] = useState<ReflectionTool[]>(REFLECTION_TOOLS);
  const [allPrograms, setAllPrograms] = useState<ProgramItem[]>(PROGRAMS);

  useEffect(() => {
    setAllTools(getAllTools());
    setAllPrograms(getAllPrograms());
  }, []);

  // Atlas Drill-down State
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionItem | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [checkinSaved, setCheckinSaved] = useState(false);

  // Reflection Tool Step Runner State
  const [activeStepTool, setActiveStepTool] = useState<ReflectionTool | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [toolAnswers, setToolAnswers] = useState<Record<number, string>>({});
  const [toolCompleted, setToolCompleted] = useState(false);

  // Filter Atlas emotions if family selected
  const familyEmotions = ATLAS_EMOTIONS.filter(
    e => selectedFamilyId && e.family.toLowerCase().includes(selectedFamilyId.toLowerCase())
  );
  const activeFamily = EMOTION_FAMILIES.find(f => f.id === selectedFamilyId);
  const isHighRisk = intensity >= 9 || (intensity >= 7 && (selectedFamilyId === 'sadness' || selectedFamilyId === 'shame' || selectedFamilyId === 'lonely'));

  function handleStartStepTool(tool: ReflectionTool) {
    setActiveStepTool(tool);
    setCurrentStepIndex(0);
    setToolAnswers({});
    setToolCompleted(false);
  }

  const q = searchQuery.trim().toLowerCase();

  const matchingPrograms = allPrograms.filter(
    p => !q || p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
  );

  const matchingTools = allTools.filter(
    t => !q || t.title.toLowerCase().includes(q) || t.engine.toLowerCase().includes(q) || (Array.isArray(t.tags) && t.tags.some(tag => tag.toLowerCase().includes(q)))
  );

  const matchingFamilies = EMOTION_FAMILIES.filter(
    f => !q || f.name.toLowerCase().includes(q)
  );

  const matchingVideos = [
    { id: 'v-meeting', title: 'A hard meeting went right', who: 'Deepa Kannan', secs: 75 },
    { id: 'v-presentation', title: 'The presentation nobody asked about', who: 'Deepa & Anbarasu', secs: 85 },
    { id: 'v-alumni', title: 'Alumni win: 1:1 that went differently', who: 'Past participant', secs: 60 }
  ].filter(v => !q || v.title.toLowerCase().includes(q) || v.who.toLowerCase().includes(q));

  const hasAnyMatches = matchingPrograms.length > 0 || matchingTools.length > 0 || matchingFamilies.length > 0 || matchingVideos.length > 0;

  return (
    <div className="screen">
      {/* Step Tool Active Modal/Runner */}
      {activeStepTool ? (
        <div className="card accent">
          <div className="row between" style={{ alignItems: 'flex-start', marginBottom: '8px' }}>
            <div>
              <span className="eyebrow">{activeStepTool.engine.toUpperCase()} · STEP TOOL</span>
              <h2 style={{ fontSize: '20px', marginTop: '2px' }}>{activeStepTool.title}</h2>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Step {currentStepIndex + 1} of {activeStepTool.steps.length} · {activeStepTool.minutes} min
              </span>
            </div>
            <button
              onClick={() => setActiveStepTool(null)}
              className="icon-btn"
              style={{ width: '32px', height: '32px' }}
              aria-label="Exit tool"
            >
              ✕
            </button>
          </div>

          {!toolCompleted ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '12px' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                {activeStepTool.steps[currentStepIndex].prompt}
              </div>

              {activeStepTool.steps[currentStepIndex].options && (
                <div className="wrap-row">
                  {activeStepTool.steps[currentStepIndex].options!.map((opt, idx) => {
                    const isSelected = toolAnswers[currentStepIndex] === opt;
                    return (
                      <button
                        key={idx}
                        className={`chip ${isSelected ? 'on' : ''}`}
                        onClick={() => setToolAnswers({ ...toolAnswers, [currentStepIndex]: opt })}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              <textarea
                rows={3}
                placeholder={activeStepTool.steps[currentStepIndex].placeholder || "Reflect here..."}
                value={toolAnswers[currentStepIndex] || ''}
                onChange={(e) => setToolAnswers({ ...toolAnswers, [currentStepIndex]: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid var(--line)',
                  background: 'var(--surface)',
                  color: 'var(--ink)',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />

              <div className="row between" style={{ marginTop: '8px' }}>
                <button
                  className="btn ghost"
                  disabled={currentStepIndex === 0}
                  onClick={() => setCurrentStepIndex(prev => prev - 1)}
                >
                  Back
                </button>

                {currentStepIndex < activeStepTool.steps.length - 1 ? (
                  <button
                    className="btn primary"
                    onClick={() => setCurrentStepIndex(prev => prev + 1)}
                  >
                    Next step
                  </button>
                ) : (
                  <button
                    className="btn primary"
                    onClick={() => setToolCompleted(true)}
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
              <div className="card soft" style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent)' }}>
                <b style={{ color: 'var(--accent)', fontSize: '15px' }}>✓ Practice Completed</b>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>
                  Great work. Taking a structured pause lowers emotional reactivity and trains neural regulation.
                </p>
              </div>

              <div>
                <b style={{ fontSize: '13px', color: 'var(--muted)' }}>YOUR REFLECTIONS:</b>
                {activeStepTool.steps.map((st, i) => (
                  <div key={i} style={{ marginTop: '6px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--muted)' }}>{st.prompt}</span>
                    <p style={{ fontWeight: 600, marginTop: '2px' }}>{toolAnswers[i] || '—'}</p>
                  </div>
                ))}
              </div>

              <button className="btn primary block" onClick={() => setActiveStepTool(null)}>
                Done & Return to Library
              </button>
            </div>
          )}
        </div>
      ) : selectedFamilyId ? (
        /* Atlas Intensity Ladder / Emotion Card View */
        <div>
          <button
            onClick={() => {
              if (selectedEmotion) {
                setSelectedEmotion(null);
              } else {
                setSelectedFamilyId(null);
              }
            }}
            style={{
              background: 'none',
              border: 0,
              padding: 0,
              color: 'var(--ink)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13.5px',
              fontWeight: 600,
              marginBottom: '12px',
              cursor: 'pointer'
            }}
          >
            <span>&larr;</span> {selectedEmotion ? `Back to ${activeFamily?.name}` : 'Back to Library'}
          </button>

          {!selectedEmotion ? (
            <>
              <div className="card soft" style={{ borderLeft: `4px solid ${activeFamily?.color}` }}>
                <span className="eyebrow" style={{ color: activeFamily?.color }}>
                  {activeFamily?.name.toUpperCase()} FAMILY
                </span>
                <h2 style={{ fontSize: '22px', marginTop: '2px' }}>Intensity Ladder (1–10)</h2>
                <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                  Select the exact emotion that fits your intensity. Naming a feeling reduces amygdala reactivity.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                {familyEmotions.map((em) => (
                  <button
                    key={em.id}
                    onClick={() => {
                      setSelectedEmotion(em);
                      setIntensity(em.intensity_rank);
                      setCheckinSaved(false);
                    }}
                    className="tool"
                    style={{ textAlign: 'left', cursor: 'pointer' }}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: activeFamily?.color,
                        color: '#fff',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flex: 'none'
                      }}
                    >
                      {em.intensity_rank}
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <b>{em.name}</b>
                      <span>{em.definition}</span>
                    </span>
                    <span className="meta">&rarr;</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Emotion Detail Card */
            <div className="card accent">
              <span className="eyebrow" style={{ color: activeFamily?.color }}>
                {activeFamily?.name.toUpperCase()} · INTENSITY {intensity}/10
              </span>
              <h1 style={{ fontSize: '26px', marginTop: '2px' }}>{selectedEmotion.name}</h1>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '4px' }}>
                {selectedEmotion.definition}
              </p>

              {/* Safety banner for 9-10 */}
              {isHighRisk && (
                <div className="card soft" style={{ background: 'var(--crit-soft)', border: '1px solid var(--crit)', marginTop: '12px' }}>
                  <b style={{ color: 'var(--crit)', fontSize: '13.5px' }}>⚠️ High Distress Detected ({intensity}/10)</b>
                  <p style={{ fontSize: '13px', marginTop: '2px' }}>
                    When emotional temperature is this high, analysis won't help yet. Settle the nervous system first.
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button className="btn small primary" onClick={onOpenReset}>
                      60-second reset
                    </button>
                    <button className="btn small ghost" onClick={onOpenCrisis} style={{ color: 'var(--crit)' }}>
                      Free crisis helpline (24x7)
                    </button>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                <div className="card soft">
                  <b style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Body Signals</b>
                  <p style={{ fontSize: '13.5px', marginTop: '2px' }}>{selectedEmotion.body_signals}</p>
                </div>

                <div className="card soft">
                  <b style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>Common Triggers</b>
                  <p style={{ fontSize: '13.5px', marginTop: '2px' }}>{selectedEmotion.triggers}</p>
                </div>

                <div className="card soft">
                  <b style={{ fontSize: '12px', color: 'var(--muted)', textTransform: 'uppercase' }}>The Core Unmet Need</b>
                  <p style={{ fontSize: '13.5px', marginTop: '2px' }}>{selectedEmotion.need}</p>
                </div>

                <div className="card soft" style={{ background: 'var(--accent-soft)' }}>
                  <b style={{ fontSize: '12px', color: 'var(--accent)', textTransform: 'uppercase' }}>Right Now Action</b>
                  <p style={{ fontSize: '13.5px', marginTop: '2px', color: 'var(--ink)' }}>{selectedEmotion.now_action}</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  className="btn primary"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setCheckinSaved(true);
                  }}
                >
                  {checkinSaved ? '✓ Checked In' : 'Log this Check-in'}
                </button>
                <button className="btn ghost" onClick={onOpenReset}>
                  Reset breath
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Main Catalog / App Drawer */
        <>
          {/* Header Title & Description */}
          <div>
            <span className="eyebrow">EQ OS ECOSYSTEM</span>
            <h1 style={{ fontSize: '26px', marginTop: '2px' }}>Library</h1>
            <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginTop: '2px' }}>
              All 7 engines, 11 emotion families, expert programs and video briefs in one modular hub.
            </p>
          </div>

          {/* Quick Search */}
          <div style={{ position: 'relative', marginTop: '8px' }}>
            <input
              type="text"
              placeholder="Search tools, emotions, programs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                background: 'var(--surface)',
                color: 'var(--ink)',
                fontSize: '14px'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '14px', color: 'var(--muted)' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '8px',
                  background: 'none',
                  border: 0,
                  fontSize: '14px',
                  color: 'var(--muted)',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="wrap-row" style={{ marginTop: '10px' }} role="tablist" aria-label="Library filters">
            {[
              { id: 'all', label: 'All' },
              { id: 'engines', label: '7 Engines & Tools' },
              { id: 'atlas', label: 'Emotion Atlas' },
              { id: 'programs', label: 'Expert Programs' },
              { id: 'videos', label: 'Short Videos' }
            ].map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeFilter === tab.id}
                onClick={() => setActiveFilter(tab.id as LibraryFilter)}
                className={`chip ${activeFilter === tab.id ? 'on' : ''}`}
                style={{ fontSize: '13px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* No matches state */}
          {q && !hasAnyMatches && (
            <div className="card soft" style={{ textAlign: 'center', padding: '32px 16px', marginTop: '16px' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink)' }}>
                No tools or programs found matching &ldquo;{searchQuery}&rdquo;
              </p>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
                Try another keyword, or create this tool in the EQ OS Creator Studio.
              </p>
              <a href="/admin" className="btn small primary" style={{ marginTop: '12px', display: 'inline-block', textDecoration: 'none' }}>
                + Add in Creator Studio
              </a>
            </div>
          )}

          {/* SECTION 1: PROGRAMS & COURSES */}
          {(activeFilter === 'all' || activeFilter === 'programs') && matchingPrograms.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <div className="section-title">
                <h3>Expert Programs</h3>
                <span className="note">{matchingPrograms.length} Cohorts</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                {matchingPrograms.map(pr => (
                  <div key={pr.id} className="card">
                    <div className="row between" style={{ alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span className="eyebrow">{pr.sub}</span>
                        <h4 style={{ fontSize: '17px', margin: '2px 0' }}>{pr.name}</h4>
                        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>{pr.description}</p>
                        <div className="wrap-row" style={{ marginTop: '6px' }}>
                          <span className="tag pub">{pr.modules ? pr.modules.length : 0} Modules</span>
                          <span className="tag">Video clips</span>
                          <span className="tag">Practice tools</span>
                        </div>
                      </div>
                      <button
                        onClick={() => onOpenProgram(pr.id)}
                        className="btn small primary"
                        style={{ flex: 'none', marginLeft: '10px' }}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: TOOL ENGINES */}
          {(activeFilter === 'all' || activeFilter === 'engines') && matchingTools.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div className="section-title">
                <h3>7 Tool Engines</h3>
                <span className="note">{matchingTools.length} Tools</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Every tool runs on one of seven engines for body, voice, perspective, and repair.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                {/* Engine 1: Body */}
                <div className="card soft">
                  <div className="row between">
                    <div>
                      <b style={{ fontSize: '14.5px' }}>1. Body Engine · Somatic Calm</b>
                      <p className="note">Shift physiology to settle the vagus nerve and lower adrenaline.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button className="tool" onClick={onOpenReset}>
                      <span className="gly">🌊</span>
                      <span style={{ minWidth: 0 }}>
                        <b>60-second reset</b>
                        <span>Paced breathing circle for acute heat</span>
                      </span>
                      <span className="meta">1 min</span>
                    </button>
                    {allTools.filter(t => t.engine === 'body').map(t => (
                      <button key={t.tool_id} className="tool" onClick={() => handleStartStepTool(t)}>
                        <span className="gly">🧘</span>
                        <span style={{ minWidth: 0 }}>
                          <b>{t.title}</b>
                          <span>{t.phase} · {Array.isArray(t.tags) ? t.tags.join(', ') : 'Somatic'}</span>
                        </span>
                        <span className="meta">{t.minutes} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine 2: Naming */}
                <div className="card soft">
                  <div className="row between">
                    <div>
                      <b style={{ fontSize: '14.5px' }}>2. Naming Engine · Emotional Granularity</b>
                      <p className="note">Move from raw reaction to emotional clarity.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button className="tool" onClick={onOpenCheckIn}>
                      <span className="gly">📍</span>
                      <span style={{ minWidth: 0 }}>
                        <b>Quick check-in</b>
                        <span>Name the feeling and gauge 1-10 intensity</span>
                      </span>
                      <span className="meta">30 sec</span>
                    </button>
                    {allTools.filter(t => t.engine === 'naming').map(t => (
                      <button key={t.tool_id} className="tool" onClick={() => handleStartStepTool(t)}>
                        <span className="gly">🏷️</span>
                        <span style={{ minWidth: 0 }}>
                          <b>{t.title}</b>
                          <span>{t.phase} · Progressive discovery</span>
                        </span>
                        <span className="meta">{t.minutes} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine 3: Perspective */}
                <div className="card soft">
                  <div className="row between">
                    <div>
                      <b style={{ fontSize: '14.5px' }}>3. Perspective Engine · Cognitive Decentering</b>
                      <p className="note">Separate observed facts from the reactive narrative.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button className="tool" onClick={onOpenDecode}>
                      <span className="gly">🔍</span>
                      <span style={{ minWidth: 0 }}>
                        <b>Decode someone else</b>
                        <span>Uncover what is driving difficult behavior</span>
                      </span>
                      <span className="meta">3 min</span>
                    </button>
                    {allTools.filter(t => t.engine === 'perspective' || t.engine === 'story').map(t => (
                      <button key={t.tool_id} className="tool" onClick={() => handleStartStepTool(t)}>
                        <span className="gly">👁️</span>
                        <span style={{ minWidth: 0 }}>
                          <b>{t.title}</b>
                          <span>{t.phase}</span>
                        </span>
                        <span className="meta">{t.minutes} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine 4: Voice & Conversation */}
                <div className="card soft">
                  <div className="row between">
                    <div>
                      <b style={{ fontSize: '14.5px' }}>4. Voice Engine · High-Stakes Communication</b>
                      <p className="note">Assert boundaries and manage conflict without burning bridges.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    <button className="tool" onClick={onOpenCalmReply}>
                      <span className="gly">✍️</span>
                      <span style={{ minWidth: 0 }}>
                        <b>Calm my reply</b>
                        <span>Reword tense drafts into firm, clear responses</span>
                      </span>
                      <span className="meta">2 min</span>
                    </button>
                    <button className="tool" onClick={() => onOpenScript('saying_no_upward')}>
                      <span className="gly">💬</span>
                      <span style={{ minWidth: 0 }}>
                        <b>Saying no upward</b>
                        <span>Conversation studio with Direct / Diplomatic scripts</span>
                      </span>
                      <span className="meta">4 min</span>
                    </button>
                  </div>
                </div>

                {/* Engine 5: Ritual */}
                <div className="card soft">
                  <div className="row between">
                    <div>
                      <b style={{ fontSize: '14.5px' }}>5. Ritual Engine · Daily Anchors</b>
                      <p className="note">Morning focus, midday pause, and evening closure.</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                    {allTools.filter(t => t.engine === 'ritual').map(t => (
                      <button key={t.tool_id} className="tool" onClick={() => handleStartStepTool(t)}>
                        <span className="gly">🕯️</span>
                        <span style={{ minWidth: 0 }}>
                          <b>{t.title}</b>
                          <span>{t.phase} · Daily mindfulness anchor</span>
                        </span>
                        <span className="meta">{t.minutes} min</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Engine 6: Custom & Cohort Studio Tools */}
                {allTools.filter(t => !['body', 'naming', 'perspective', 'story', 'ritual'].includes(t.engine)).length > 0 && (
                  <div className="card soft" style={{ border: '1px solid var(--accent-soft)' }}>
                    <div className="row between">
                      <div>
                        <b style={{ fontSize: '14.5px', color: 'var(--accent)' }}>6. Cohort & Studio Reflection Tools</b>
                        <p className="note">Custom guides created in EQ OS Creator Studio.</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
                      {allTools.filter(t => !['body', 'naming', 'perspective', 'story', 'ritual'].includes(t.engine)).map(t => (
                        <button key={t.tool_id} className="tool" onClick={() => handleStartStepTool(t)}>
                          <span className="gly">✨</span>
                          <span style={{ minWidth: 0 }}>
                            <b>{t.title}</b>
                            <span>{t.phase} · {Array.isArray(t.tags) ? t.tags.join(', ') : 'Reflection'}</span>
                          </span>
                          <span className="meta">{t.minutes} min</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 3: EMOTION ATLAS */}
          {(activeFilter === 'all' || activeFilter === 'atlas') && matchingFamilies.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div className="section-title">
                <h3>Emotion Atlas</h3>
                <span className="note">{matchingFamilies.length} Families</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Tap any family to explore its intensity ladder, triggers, and regulation strategy.
              </p>

              <div className="fam-grid" style={{ marginTop: '10px' }}>
                {matchingFamilies.map((fam) => (
                  <button
                    key={fam.id}
                    className="fam"
                    style={{ '--fc': fam.color } as React.CSSProperties}
                    onClick={() => {
                      setSelectedFamilyId(fam.id);
                      setSelectedEmotion(null);
                    }}
                  >
                    <b>{fam.name}</b>
                    <span>{fam.count} intensities &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: SHORT VIDEOS */}
          {(activeFilter === 'all' || activeFilter === 'videos') && matchingVideos.length > 0 && (
            <div style={{ marginTop: '20px', marginBottom: '24px' }}>
              <div className="section-title">
                <h3>Short Videos</h3>
                <span className="note">{matchingVideos.length} Video Briefs</span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
                Facilitator insights and alumni wins under 90 seconds.
              </p>

              <div className="clips-row" style={{ marginTop: '10px' }}>
                {matchingVideos.map(v => (
                  <div key={v.id} className="clip">
                    <button
                      className="poster"
                      onClick={() => onOpenVideo(v.id)}
                      aria-label={`Play ${v.title}`}
                    >
                      <span className="play">
                        <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                      </span>
                      <span className="dur tnum">{Math.floor(v.secs / 60)}:{(v.secs % 60).toString().padStart(2, '0')}</span>
                    </button>
                    <b>{v.title}</b>
                    <span>{v.who}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
