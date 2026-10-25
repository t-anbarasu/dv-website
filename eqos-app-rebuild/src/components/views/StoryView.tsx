'use client';

import React, { useState, useEffect } from 'react';
import { ProgramItem } from '@/lib/types';
import { PROGRAMS, VIDEOS } from '@/lib/data';
import { getAllPrograms } from '@/lib/contentStore';

interface StoryViewProps {
  onOpenProgram: (programId: string) => void;
  onOpenVideo: (clipId: string) => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  onOpenProgram,
  onOpenVideo
}) => {
  const [copiedShare, setCopiedShare] = useState(false);
  const [allPrograms, setAllPrograms] = useState<ProgramItem[]>(() => {
    if (typeof window !== 'undefined') return getAllPrograms();
    return PROGRAMS;
  });

  useEffect(() => {
    setAllPrograms(getAllPrograms());
    const handleUpdate = () => setAllPrograms(getAllPrograms());
    window.addEventListener('eqos-content-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('eqos-content-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // 28 days for 4-week emotional weather (exact colors from mockups)
  const weatherDays = [
    { day: 27, color: 'var(--f-lonely)' },
    { day: 28, color: 'var(--f-joy)' },
    { day: 29, color: 'var(--f-envy)' },
    { day: 30, color: 'var(--f-anger)' },
    { day: 1,  color: 'var(--f-envy)' },
    { day: 2,  color: 'var(--f-joy)' },
    { day: 3,  color: 'var(--f-envy)' },

    { day: 4,  color: 'var(--f-lonely)' },
    { day: 5,  color: 'var(--f-fear)' },
    { day: 6,  color: 'var(--f-joy)' },
    { day: 7,  color: 'var(--f-joy)' },
    { day: 8,  color: 'var(--f-joy)' },
    { day: 9,  color: 'var(--f-lonely)' },
    { day: 10, color: 'var(--f-joy)' },

    { day: 11, color: 'var(--f-lonely)' },
    { day: 12, color: 'var(--f-joy)' },
    { day: 13, color: 'var(--f-envy)' },
    { day: 14, color: 'var(--f-anger)' },
    { day: 15, color: 'var(--f-joy)' },
    { day: 16, color: 'var(--f-lonely)' },
    { day: 17, color: 'var(--f-joy)' },

    { day: 18, color: 'var(--f-lonely)' },
    { day: 19, color: 'var(--f-anger)' },
    { day: 20, color: 'var(--f-fear)' },
    { day: 21, color: 'var(--f-lonely)' },
    { day: 22, color: 'var(--f-joy)' },
    { day: 23, color: 'var(--f-lonely)' },
    { day: 24, color: 'var(--f-lonely)', isToday: true }
  ];

  const shortVideoList = [
    { id: 'v-fine', title: '“I’m fine”', secs: '1:30', who: 'Deepa Kannan and Anbarasu Thangavelu' },
    { id: 'v-presentation', title: 'The presentation nobody asked about', secs: '1:25', who: 'Deepa Kannan and Anbarasu Thangavelu' },
    { id: 'v-alumni', title: 'Alumni win: a 1:1 that went differently', secs: '1:00', who: 'A past participant' }
  ];

  function handleCopyShare() {
    navigator.clipboard?.writeText("This week I paused before reacting three times and called home twice.");
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  }

  return (
    <div className="screen">
      {/* Title */}
      <div className="row between">
        <h1 style={{ fontSize: '24px' }}>Your story</h1>
        <span className="tag">Example data</span>
      </div>

      {/* Card 1: Emotional Weather */}
      <div className="card">
        <span className="eyebrow">EMOTIONAL WEATHER, LAST 4 WEEKS</span>
        <div className="weather" style={{ marginTop: '8px' }}>
          {weatherDays.map((d, i) => (
            <div
              key={i}
              className={`wcell ${d.isToday ? 'today' : ''}`}
              style={{
                background: `color-mix(in srgb, ${d.color} 50%, var(--surface))`,
                border: d.isToday ? '2px solid var(--ink)' : 'none'
              }}
            >
              {d.day}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="wlegend" style={{ marginTop: '8px' }}>
          <span><i style={{ background: 'var(--f-joy)' }} /> Joy and calm 10</span>
          <span><i style={{ background: 'var(--f-lonely)' }} /> Loneliness 8</span>
          <span><i style={{ background: 'var(--f-envy)' }} /> Envy and jealousy 4</span>
          <span><i style={{ background: 'var(--f-anger)' }} /> Anger 3</span>
        </div>

        <div style={{ marginTop: '12px' }}>
          <span className="eyebrow">WHAT DRISHTI NOTICED</span>
          <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
            From how you use the tools. Writing a journal is optional.
          </p>
          <div className="noticed" style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <p>You used Decode someone else three times this week, each time about your lead. Managing upward may be your theme this month.</p>
            <p>Sunday evenings are your hardest hour.</p>
            <p>You feel calmer on days you message home.</p>
            <p>Good days often follow a deep-work morning.</p>
          </div>
        </div>
      </div>

      {/* Card 2: Difficult Feelings Sparkline */}
      <div className="card">
        <span className="eyebrow">DIFFICULT FEELINGS AT CHECK-IN, LAST 14 DAYS</span>
        <div style={{ margin: '14px 0 6px' }}>
          <svg viewBox="0 0 300 70" style={{ width: '100%', height: '70px', overflow: 'visible' }}>
            <defs>
              <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,35 Q 25,20 50,40 T 100,25 T 150,38 T 200,30 T 250,48 T 300,32"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 0,35 Q 25,20 50,40 T 100,25 T 150,38 T 200,30 T 250,48 T 300,32 L 300,70 L 0,70 Z"
              fill="url(#sparkGrad)"
            />
            <circle cx="300" cy="32" r="4.5" fill="var(--accent)" />
          </svg>
        </div>
        <div className="row between" style={{ fontSize: '12px', color: 'var(--muted)' }}>
          <span>14 days ago</span>
          <span>Today: <b>5/10</b></span>
        </div>
      </div>

      {/* Card 3: Capability Map */}
      <div className="card">
        <div className="row between">
          <span className="eyebrow">CAPABILITY MAP</span>
          <div className="legend">
            <span><i style={{ background: 'color-mix(in srgb, var(--accent) 35%, var(--sunk))' }} /> Start</span>
            <span><i style={{ background: 'var(--accent)' }} /> Now</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {[
            { label: 'Self-awareness', val: 78, change: '+13' },
            { label: 'Self-management', val: 65, change: '+8' },
            { label: 'Social awareness', val: 58, change: '+4' },
            { label: 'Relationship skills', val: 62, change: '+6' },
            { label: 'Performance', val: 70, change: '+9' }
          ].map((item, i) => (
            <div key={i} className="cap">
              <span>{item.label}</span>
              <div className="track">
                <i className="b" style={{ width: `${item.val - 15}%` }} />
                <i className="n" style={{ width: `${item.val}%` }} />
              </div>
              <span className="tnum" style={{ fontWeight: 600, color: 'var(--ok)', textAlign: 'right' }}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Card 4: Moments I handled well */}
      <div className="card">
        <span className="eyebrow">MOMENTS I HANDLED WELL</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px', fontSize: '14px' }}>
          <div>✓ Asked my lead for feedback instead of guessing</div>
          <div>✓ Paused before replying to a sharp Slack message</div>
          <div>✓ Called Appa on Sunday instead of scrolling</div>
        </div>
      </div>

      {/* Card 5: Your week, to share (dark card) */}
      <div className="share-card">
        <span className="eyebrow">YOUR WEEK, TO SHARE</span>
        <p className="big">
          “This week I paused before reacting three times and called home twice.”
        </p>
        <p style={{ fontSize: '12px', opacity: 0.75 }}>
          No private details. You choose if and where it goes.
        </p>
        <button 
          onClick={handleCopyShare}
          style={{
            alignSelf: 'flex-start',
            marginTop: '4px',
            background: 'rgba(255, 255, 255, 0.18)',
            color: '#FFFFFF',
            border: 0,
            borderRadius: '8px',
            padding: '6px 14px',
            fontSize: '12.5px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {copiedShare ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Card 6: Suggested Path */}
      <div className="card">
        <div className="row between">
          <span className="eyebrow">SUGGESTED PATH</span>
          <span className="tag">Day 6 of 21</span>
        </div>
        <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Know yourself</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
          {[
            { title: 'Name what you feel', days: 'Days 1–5', status: 'done' },
            { title: 'Comparison and self-worth', days: 'Days 6–10 · now', status: 'now' },
            { title: 'Taking criticism', days: 'Days 11–15', status: 'pending' },
            { title: 'Your values', days: 'Days 16–21', status: 'pending' }
          ].map((step, i) => (
            <div key={i} className="row" style={{ alignItems: 'flex-start', gap: '10px' }}>
              <span 
                style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  marginTop: '2px',
                  border: step.status === 'done' ? 'none' : step.status === 'now' ? '2.5px solid var(--accent)' : '2px solid var(--line)',
                  background: step.status === 'done' ? 'var(--ok)' : step.status === 'now' ? 'var(--accent-soft)' : 'transparent',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 700,
                  flex: 'none'
                }}
              >
                {step.status === 'done' ? '✓' : ''}
              </span>
              <div>
                <b style={{ fontSize: '14px', display: 'block' }}>{step.title}</b>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{step.days}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Short Videos (Placeholders) */}
      <div>
        <div className="row between">
          <h2 style={{ fontSize: '19px' }}>Short videos</h2>
          <span className="tag">Placeholders</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          Under 90 seconds, vertical, captioned, with an audio-only version. Never offered during a hot moment.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {shortVideoList.map((v) => (
            <button
              key={v.id}
              className="clip"
              onClick={() => onOpenVideo(v.id)}
              aria-label={`Play video: ${v.title}`}
            >
              <span className="poster" aria-hidden="true">
                <span className="play">
                  <svg viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </span>
                <span className="dur tnum">{v.secs}</span>
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="eyebrow" style={{ color: 'var(--accent)' }}>SCENARIO STORY</span>
                <b>{v.title}</b>
                <span className="m">{v.who}</span>
                <span className="m" style={{ color: 'var(--faint)' }}>Placeholder · to be recorded</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Learn with experts (Deeper Programs) */}
      <div>
        <div className="row between">
          <h2 style={{ fontSize: '19px' }}>Learn with experts</h2>
          <span className="tag pub">Drishta Vidya</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          Optional deeper programs, for when you want them.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
          {allPrograms.map((pr) => (
            <div
              key={pr.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px'
              }}
            >
              <div 
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '15px',
                  flex: 'none'
                }}
              >
                ⚯
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: '15px', display: 'block' }}>{pr.name}</b>
                <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                  {pr.sub} · {pr.modules ? pr.modules.length : 0} modules
                </span>
              </div>
              <button
                className="btn small"
                onClick={() => onOpenProgram(pr.id)}
                style={{ flex: 'none' }}
              >
                Open
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Card: How it fits together */}
      <div className="card soft">
        <span className="eyebrow">HOW IT FITS TOGETHER</span>
        <div className="chain" style={{ marginTop: '8px' }}>
          <span>40 tools</span>
          <em>&rarr;</em>
          <span>Practices</span>
          <em>&rarr;</em>
          <span>Modules</span>
          <em>&rarr;</em>
          <span>Paths</span>
          <em>&rarr;</em>
          <span>5 programs</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>
          Tools are shared. The same tool appears in a program module, in a path, and when Drishti suggests it at 11 pm.
        </p>
      </div>

      {/* Card: More publishers */}
      <div className="card soft">
        <span className="eyebrow">MORE PUBLISHERS</span>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
          Other coaches and organisations can publish programs here later. Every tool they add uses the same engines, tags and safety review.
        </p>
      </div>
    </div>
  );
};
