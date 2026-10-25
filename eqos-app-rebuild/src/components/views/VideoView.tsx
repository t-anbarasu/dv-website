'use client';

import React, { useState } from 'react';
import { getClip } from '@/lib/data';

interface VideoViewProps {
  clipId: string;
  onBack: () => void;
}

export const VideoView: React.FC<VideoViewProps> = ({ clipId, onBack }) => {
  const clip = getClip(clipId) || getClip('v-secondary')!;
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="screen">


      {/* 9:16 Vertical Video Placeholder */}
      <div 
        className="big-poster"
        onClick={() => setIsPlaying(!isPlaying)}
        role="button"
        tabIndex={0}
        aria-label="Play video placeholder"
      >
        <span className="play">
          <svg viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        </span>
        <span className="dur tnum">{formatDuration(clip.secs)}</span>
      </div>

      {/* Title & Metadata */}
      <div>
        <span className="eyebrow">{clip.kind.toUpperCase()} · PLACEHOLDER</span>
        <h1 style={{ fontSize: '24px', marginTop: '4px' }}>{clip.title}</h1>
        <div className="wrap-row" style={{ marginTop: '8px' }}>
          <span className="tag pub">Drishta Vidya</span>
          <span className="tag">To be recorded</span>
        </div>
      </div>

      {/* Recording Brief Card */}
      <div className="card">
        <span className="eyebrow">RECORDING BRIEF</span>
        <div className="strategy" style={{ marginTop: '8px' }}>
          <div>
            <b>Presenter</b>
            <span>{clip.who}</span>
          </div>
          <div>
            <b>Length</b>
            <span className="tnum">{clip.secs} seconds or less</span>
          </div>
          <div>
            <b>Purpose</b>
            <span>{clip.purpose}</span>
          </div>
          <div>
            <b>Appears</b>
            <span>{clip.on}</span>
          </div>
        </div>
      </div>

      {/* Outline Card */}
      <div className="card">
        <span className="eyebrow">OUTLINE</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
          {clip.beats.map((beat, i) => (
            <div key={i} className="script-step">
              <span className="n">{i + 1}</span>
              <div>
                <p style={{ margin: 0, fontSize: '14.5px' }}>{beat}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Standard Card */}
      <div className="card soft">
        <span className="eyebrow">DELIVERY STANDARD</span>
        <p style={{ fontSize: '13.5px', marginTop: '4px', lineHeight: 1.5 }}>
          Vertical 9:16, shot on a phone is fine. Burned-in captions in English, Tamil and Hindi. An audio-only version for low data. Works with the sound off.
        </p>
      </div>
    </div>
  );
};
