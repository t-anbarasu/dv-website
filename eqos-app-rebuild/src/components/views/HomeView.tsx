'use client';

import React, { useState } from 'react';

import { UserProfile } from '@/lib/types';

interface HomeViewProps {
  profile: UserProfile;
  onOpenReset: () => void;
  onOpenCalmReply: () => void;
  onOpenDecode: () => void;
  onOpenDrishti: () => void;
  onOpenScript: (scriptId?: string) => void;
  onSelectFamily: (familyId: string) => void;
  onOpenProgram: (programId: string) => void;
  onOpenCheckIn: () => void;
  onOpenProfile?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  onOpenReset,
  onOpenCalmReply,
  onOpenDecode,
  onOpenDrishti,
  onOpenScript,
  onSelectFamily,
  onOpenProgram,
  onOpenCheckIn,
  onOpenProfile
}) => {
  const [weekPicked, setWeekPicked] = useState('1:1 with my lead, Thursday');
  const [programDismissed, setProgramDismissed] = useState(false);
  const [nudgeDismissed, setNudgeDismissed] = useState(false);

  const getGreeting = (lang: string, name: string) => {
    switch (lang) {
      case 'ta': return `வணக்கம், ${name}`;
      case 'pt': return `Bom dia, ${name}`;
      case 'hi': return `नमस्ते, ${name}`;
      case 'es': return `Buenos días, ${name}`;
      case 'en':
      default: return `Good morning, ${name}`;
    }
  };

  return (
    <div className="screen">
      {/* Greeting & Time (Dynamic to User Profile) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
          <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Saturday 13:42{profile.city ? ` in ${profile.city}` : profile.country ? ` in ${profile.country}` : ''}
          </span>
          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '999px',
                border: '1px solid var(--line)',
                background: 'var(--surface-2)',
                color: 'var(--muted)',
                fontSize: '11.5px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="View and customize what the OS knows about you"
            >
              <span>👤 Profile & Guidance</span>
              <span style={{ fontSize: '10px' }}>&rarr;</span>
            </button>
          )}
        </div>
        <h1 style={{ fontSize: '28px', marginTop: '4px', fontFamily: 'var(--display)' }}>
          {getGreeting(profile.lang, profile.name)}
        </h1>
      </div>

      {/* Drishti Input Bar */}
      <div>
        <span style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600 }}>
          Drishti · your AI companion
        </span>
        <button 
          className="ask" 
          onClick={onOpenDrishti}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '16px',
            padding: '12px 14px',
            marginTop: '6px',
            textAlign: 'left',
            boxShadow: 'var(--shadow)',
            cursor: 'pointer'
          }}
        >
          <div className="drishti" style={{ width: '24px', height: '24px' }} />
          <span style={{ fontSize: '15px', color: 'var(--ink)' }}>
            இப்போது என்ன நடக்கிறது?
          </span>
        </button>

        {/* Quick Access Utility Chips */}
        <div className="wrap-row" style={{ marginTop: '8px' }}>
          <button className="chip" onClick={onOpenCalmReply}>
            Calm my reply
          </button>
          <button className="chip" onClick={onOpenDecode}>
            Decode someone
          </button>
          <button className="chip" onClick={() => onOpenScript('say_no_senior')}>
            2-minute prep
          </button>
        </div>
      </div>

      {/* 60-Second Reset Dark Banner */}
      <button
        onClick={onOpenReset}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          background: 'var(--ink)',
          color: 'var(--surface)',
          border: 0,
          borderRadius: '18px',
          padding: '16px',
          textAlign: 'left',
          cursor: 'pointer'
        }}
      >
        <div 
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent)',
            opacity: 0.9,
            flex: 'none'
          }}
        />
        <div>
          <b style={{ display: 'block', fontSize: '17px', fontFamily: 'var(--display)' }}>
            60-second reset
          </b>
          <span style={{ fontSize: '12.5px', opacity: 0.75 }}>
            No questions. Just breathe first.
          </span>
        </div>
      </button>

      {/* Section: Your Ritual */}
      <div>
        <div className="row between" style={{ marginBottom: '6px' }}>
          <h2 style={{ fontSize: '17px' }}>Your ritual</h2>
          <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>13:42</span>
        </div>
        <button
          onClick={onOpenReset}
          className="tool"
          style={{
            width: '100%',
            background: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '14px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            textAlign: 'left',
            cursor: 'pointer'
          }}
        >
          <span 
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--surface-2)',
              border: '1px solid var(--line)',
              display: 'grid',
              placeItems: 'center',
              fontSize: '15px',
              color: 'var(--accent)'
            }}
          >
            〰
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <b style={{ display: 'block', fontSize: '14.5px' }}>Midday pause</b>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              Six slow breaths between meetings
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>1 min</span>
        </button>
      </div>

      {/* Card: For This Moment */}
      <div className="card" style={{ background: 'var(--surface)', border: '1.5px solid var(--accent-soft)', gap: '10px' }}>
        <span className="eyebrow" style={{ color: 'var(--accent)' }}>FOR THIS MOMENT</span>
        <h3 style={{ fontSize: '19px', marginTop: '-2px' }}>Comparison reset</h3>
        <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '-4px' }}>
          Reflection and planning · 3 min
        </p>
        <p style={{ fontSize: '14px', marginTop: '2px' }}>
          Turn “I’m behind” into information.
        </p>
        <div className="wrap-row">
          <span className="tag">goal: understand myself</span>
          <span className="tag">check-in word “behind”</span>
          <span className="tag">age 18–24</span>
        </div>
        <button 
          className="btn primary block"
          onClick={() => onOpenScript('comparison_reset')}
          style={{ marginTop: '4px' }}
        >
          Start
        </button>
      </div>

      {/* Section: Last Check-In */}
      <div className="card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
        <div>
          <span className="eyebrow">LAST CHECK-IN</span>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '2px' }}>
            Behind · <span style={{ color: 'var(--accent)' }}>5/10</span>
          </div>
        </div>
        <button 
          className="btn small"
          onClick={onOpenCheckIn}
        >
          Check in
        </button>
      </div>

      {/* Section: Quick reset */}
      <div>
        <div className="row between" style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '17px' }}>Quick reset</h2>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>When it's running hot</span>
        </div>
        <div className="sos">
          {[
            { id: 'anger', name: 'Angry', color: 'var(--f-anger)' },
            { id: 'fear', name: 'Anxious', color: 'var(--f-fear)' },
            { id: 'sadness', name: 'Hurt', color: 'var(--f-sadness)' },
            { id: 'overwhelm', name: 'Swamped', color: 'var(--f-overwhelm)' },
            { id: 'lonely', name: 'Low', color: 'var(--f-lonely)' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onSelectFamily(item.id)}
              className="sos-btn"
              style={{
                background: `color-mix(in srgb, ${item.color} 15%, var(--surface))`,
                borderColor: `color-mix(in srgb, ${item.color} 30%, var(--line))`
              }}
            >
              <span className="dot" style={{ background: item.color }} />
              <span className="label" style={{ fontWeight: 600, fontSize: '12px' }}>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Section: Your Week Ahead */}
      <div className="card">
        <div className="row between">
          <span className="eyebrow">YOUR WEEK AHEAD</span>
          <span style={{ fontSize: '11.5px', color: 'var(--muted)' }}>Asked on Monday</span>
        </div>
        <p style={{ fontSize: '14px', marginTop: '2px' }}>
          Which <b>one</b> conversation this week carries the highest stakes for you?
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
          {[
            'Sprint demo, Wednesday',
            '1:1 with my lead, Thursday',
            'Call with Amma, Sunday'
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => setWeekPicked(topic)}
              className={`chip ${weekPicked === topic ? 'on' : ''}`}
              style={{ width: '100%', justifyContent: 'flex-start', padding: '10px 14px' }}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      {/* Section: Your Intention This Week */}
      <div className="card">
        <div className="row between">
          <span className="eyebrow">YOUR INTENTION THIS WEEK</span>
          <button className="link" style={{ fontSize: '12px', fontWeight: 600 }}>Change</button>
        </div>
        <h3 style={{ fontSize: '18px', marginTop: '2px' }}>Be kinder to myself</h3>
        <div className="row between" style={{ marginTop: '4px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            Today's practice: What would you say to a friend?
          </p>
          <button className="btn small" onClick={() => onOpenScript('self_kindness')}>
            Open
          </button>
        </div>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '6px' }}>
          Suggested path: <b style={{ color: 'var(--accent)' }}>Know yourself</b> · day 6 of 21
        </p>
      </div>

      {/* Pattern Nudge Card */}
      {!nudgeDismissed && (
        <div className="card" style={{ background: 'var(--surface-2)', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '18px', lineHeight: 1 }}>🔔</span>
            <div>
              <p style={{ fontSize: '14px', lineHeight: 1.4 }}>
                Sunday evenings have felt lonely in your recent check-ins. Call Amma or a friend tonight?
              </p>
              <div style={{ marginTop: '8px' }}>
                <span className="tag" style={{ fontSize: '11px' }}>
                  Pattern from your check-ins: lower mood on Sunday evenings
                </span>
              </div>
            </div>
          </div>
          <button 
            className="btn small"
            onClick={() => setNudgeDismissed(true)}
            style={{ alignSelf: 'flex-start' }}
          >
            Reach out to one person
          </button>
        </div>
      )}

      {/* Section: Performance Modes */}
      <div>
        <div className="row between" style={{ marginBottom: '8px' }}>
          <h2 style={{ fontSize: '17px' }}>Performance modes</h2>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>From your role</span>
        </div>
        <div className="wrap-row">
          <button className="chip" onClick={onOpenReset}>
            Deep work
          </button>
          <button className="chip" onClick={() => onOpenScript('say_no_senior')}>
            First-boss feedback
          </button>
        </div>
      </div>

      {/* Section: Want to Go Deeper? (Opens Program Screen) */}
      {!programDismissed && (
        <div className="card soft" style={{ gap: '10px' }}>
          <div className="row between">
            <span className="eyebrow">WANT TO GO DEEPER?</span>
            <button 
              className="link note" 
              onClick={() => setProgramDismissed(true)}
              style={{ fontSize: '12px', color: 'var(--muted)' }}
            >
              Not now
            </button>
          </div>
          <p style={{ fontSize: '14px', lineHeight: 1.4 }}>
            You used “the feeling under the feeling” five times this month. <b>EQUIP</b>, a Drishta Vidya program, takes it further.
          </p>
          <div>
            <span className="tag" style={{ fontSize: '11px' }}>
              offered because of your own pattern, never pushed
            </span>
          </div>
          <div className="row" style={{ marginTop: '4px', gap: '8px' }}>
            <button 
              className="btn small" 
              onClick={() => onOpenProgram('equip')}
            >
              Have a look
            </button>
            <button 
              className="btn small ghost" 
              onClick={() => setProgramDismissed(true)}
            >
              Not now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
