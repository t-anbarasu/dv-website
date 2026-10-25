'use client';

import React, { useState, useEffect } from 'react';
import { EMOTION_FAMILIES, ATLAS_EMOTIONS } from '@/lib/data';
import { EmotionItem } from '@/lib/types';

interface AtlasViewProps {
  initialFamilyId?: string;
  onOpenReset: () => void;
  onOpenCrisis: () => void;
  onCheckinSaved?: (word: string, intensity: number) => void;
}

export const AtlasView: React.FC<AtlasViewProps> = ({
  initialFamilyId,
  onOpenReset,
  onOpenCrisis,
  onCheckinSaved
}) => {
  const [selectedFamilyId, setSelectedFamilyId] = useState<string | null>(initialFamilyId || null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionItem | null>(null);
  const [intensity, setIntensity] = useState(5);
  const [checkinSaved, setCheckinSaved] = useState(false);

  useEffect(() => {
    if (initialFamilyId) {
      setSelectedFamilyId(initialFamilyId);
      setSelectedEmotion(null);
    }
  }, [initialFamilyId]);

  // Filter emotions for selected family
  const familyEmotions = ATLAS_EMOTIONS.filter(
    e => selectedFamilyId && e.family.toLowerCase().includes(selectedFamilyId.toLowerCase())
  );

  const activeFamily = EMOTION_FAMILIES.find(f => f.id === selectedFamilyId);

  // Safety trigger condition
  const isHighRisk = intensity >= 9 || (intensity >= 7 && (selectedFamilyId === 'sadness' || selectedFamilyId === 'shame' || selectedFamilyId === 'lonely'));

  return (
    <div className="screen">
      {!selectedFamilyId ? (
        <>
          <div>
            <span className="eyebrow">Taxonomy</span>
            <h2 style={{ fontSize: '24px', marginTop: '2px' }}>Emotion Atlas</h2>
            <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginTop: '4px' }}>
              60 emotions across 11 families. Tap any family to explore its intensity ladder and regulation strategy.
            </p>
          </div>

          <div className="fam-grid">
            {EMOTION_FAMILIES.map((fam) => (
              <button
                key={fam.id}
                className="fam"
                style={{ '--fc': fam.color } as React.CSSProperties}
                onClick={() => {
                  setSelectedFamilyId(fam.id);
                  const firstEmo = ATLAS_EMOTIONS.find(e => e.family.toLowerCase().includes(fam.id.toLowerCase()));
                  if (firstEmo) {
                    setSelectedEmotion(firstEmo);
                    setIntensity(firstEmo.intensity_rank);
                  }
                }}
              >
                <div style={{ fontSize: '18px' }}>{fam.icon}</div>
                <b>{fam.name}</b>
                <span>{fam.count} words on ladder</span>
              </button>
            ))}
          </div>
        </>
      ) : !selectedEmotion ? (
        <>
          <button className="link" onClick={() => setSelectedFamilyId(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            &larr; Back to all 11 families
          </button>

          <div>
            <span className="eyebrow">FAMILY LADDER</span>
            <h2 style={{ fontSize: '24px', color: activeFamily?.color, marginTop: '2px' }}>
              {activeFamily?.name}
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--muted)', marginTop: '4px' }}>
              Select a specific emotional state to view its physiological signals and action protocol:
            </p>
          </div>

          <div className="ladder">
            {familyEmotions.map((emo) => (
              <button
                key={emo.id}
                className="rung"
                onClick={() => {
                  setSelectedEmotion(emo);
                  setIntensity(emo.intensity_rank);
                }}
              >
                <div className="lvl">
                  {[...Array(10)].map((_, i) => (
                    <i
                      key={i}
                      className={i < emo.intensity_rank ? 'f' : ''}
                      style={{ '--fc': activeFamily?.color } as React.CSSProperties}
                    />
                  ))}
                </div>
                <div>
                  <b>{emo.name}</b>
                  <span>Intensity: {emo.intensity_rank}/10</span>
                </div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="row between">
            <button className="link" onClick={() => setSelectedEmotion(null)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              &larr; {activeFamily?.name} Ladder
            </button>
            <span className="tag" style={{ background: activeFamily?.color, color: '#fff' }}>
              Rank {selectedEmotion.intensity_rank}/10
            </span>
          </div>

          <div className="emo-head" style={{ '--fc': activeFamily?.color } as React.CSSProperties}>
            <span className="eyebrow">{activeFamily?.name} Family</span>
            <h1>{selectedEmotion.name}</h1>
            <p style={{ fontSize: '14.5px', lineHeight: 1.5 }}>
              {selectedEmotion.definition}
            </p>
          </div>

          {/* Intensity Slider */}
          <div className="card soft">
            <div className="row between">
              <span className="eyebrow">CURRENT INTENSITY</span>
              <span className="big-num">{intensity}/10</span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => {
                setIntensity(parseInt(e.target.value));
                setCheckinSaved(false);
              }}
            />
            <div className="scale">
              <span>1 Low</span>
              <span>4 Mild</span>
              <span>7 High</span>
              <span>10 Acute</span>
            </div>

            <div style={{ marginTop: '8px' }}>
              <span className="note" style={{ fontWeight: 600 }}>
                {intensity <= 3 && "Band 1–3: Learn & Observe"}
                {intensity >= 4 && intensity <= 6 && "Band 4–6: Reflect & Clarify Agency"}
                {intensity >= 7 && intensity <= 8 && "Band 7–8: Body First — Regulate before acting"}
                {intensity >= 9 && "Band 9–10: Acute — Reset only & Safety Protocol"}
              </span>
            </div>

            {!checkinSaved ? (
              <button
                className="btn primary small"
                style={{ marginTop: '10px' }}
                onClick={() => {
                  setCheckinSaved(true);
                  if (onCheckinSaved) onCheckinSaved(selectedEmotion.name, intensity);
                }}
              >
                Log Check-in at {intensity}/10
              </button>
            ) : (
              <span className="note" style={{ color: 'var(--ok)', fontWeight: 600, marginTop: '8px' }}>
                ✓ Logged to your emotional history
              </span>
            )}
          </div>

          {/* Safety Check Trigger Card */}
          {isHighRisk && (
            <div className="card" style={{ border: '2px solid var(--crit)', background: 'var(--crit-soft)' }}>
              <h4 style={{ color: 'var(--crit)', fontSize: '15px' }}>Safety Check: Intensity is high</h4>
              <p style={{ fontSize: '13px', color: 'var(--crit)', marginTop: '4px' }}>
                At intensity {intensity}, clear cognitive problem solving shuts down. Are you feeling safe right now?
              </p>
              <div className="row" style={{ marginTop: '10px' }}>
                <button
                  className="btn primary small"
                  style={{ background: 'var(--crit)', borderColor: 'var(--crit)' }}
                  onClick={onOpenCrisis}
                >
                  Need Support (Crisis Route)
                </button>
                <button className="btn small" onClick={onOpenReset}>
                  Start 60s Breathing Reset
                </button>
              </div>
            </div>
          )}

          {/* Strategy Details */}
          <div className="card">
            <span className="eyebrow">REGULATION STRATEGY</span>
            <div className="strategy" style={{ marginTop: '6px' }}>
              <div>
                <b>BODY SIGNALS</b>
                <span>{selectedEmotion.body_signals}</span>
              </div>
              <div>
                <b>TRIGGERS</b>
                <span>{selectedEmotion.triggers}</span>
              </div>
              <div>
                <b>CORE NEED</b>
                <span>{selectedEmotion.need}</span>
              </div>
              <div>
                <b>NOW ACTION</b>
                <span>{selectedEmotion.now_action}</span>
              </div>
              <div>
                <b>AFTERWARDS</b>
                <span>{selectedEmotion.after_action}</span>
              </div>
              <div className="never">
                <b style={{ color: 'var(--crit)' }}>NEVER DO</b>
                <span>{selectedEmotion.never_do}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
