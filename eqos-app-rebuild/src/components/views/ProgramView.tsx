'use client';

import React, { useState, useEffect } from 'react';
import { ProgramItem, ReflectionTool } from '@/lib/types';
import { PROGRAMS, TOOL_NAMES, getClip } from '@/lib/data';
import { getAllPrograms, getAllTools } from '@/lib/contentStore';

interface ProgramViewProps {
  programId: string;
  onBack: () => void;
  onOpenVideo: (clipId: string) => void;
  onOpenTool?: (toolId: string) => void;
}

export const ProgramView: React.FC<ProgramViewProps> = ({
  programId,
  onBack,
  onOpenVideo,
  onOpenTool
}) => {
  const [allPrograms, setAllPrograms] = useState<ProgramItem[]>(() => {
    if (typeof window !== 'undefined') {
      return getAllPrograms();
    }
    return PROGRAMS;
  });
  const [allTools, setAllTools] = useState<ReflectionTool[]>(() => {
    if (typeof window !== 'undefined') {
      return getAllTools();
    }
    return [];
  });

  const loadData = () => {
    setAllPrograms(getAllPrograms());
    setAllTools(getAllTools());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('eqos-content-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('eqos-content-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [programId]);

  const cleanId = (programId || '').toLowerCase().trim();
  const program: ProgramItem =
    allPrograms.find(p => p.id.toLowerCase() === cleanId) ||
    allPrograms.find(p => p.name.toLowerCase() === cleanId) ||
    allPrograms.find(p => p.id.toLowerCase().replace(/[-_\s]/g, '') === cleanId.replace(/[-_\s]/g, '')) ||
    allPrograms.find(p => p.name.toLowerCase().replace(/[-_\s]/g, '') === cleanId.replace(/[-_\s]/g, '')) ||
    PROGRAMS.find(p => p.id.toLowerCase() === cleanId) ||
    allPrograms[0] ||
    PROGRAMS[1];

  const modules = program?.modules || [];

  return (
    <div className="screen">
      {/* Header title & tags */}
      <div>
        <span className="eyebrow">{program.sub || 'PROGRAM'}</span>
        <h1 style={{ fontSize: '26px', marginTop: '2px' }}>{program.name}</h1>
        <div className="wrap-row" style={{ marginTop: '8px' }}>
          <span className="tag pub">Drishta Vidya</span>
          <span className="tag">{modules.length > 0 ? `${modules.length} Modules` : 'Cohort program'}</span>
          <span className="tag">Cohort + facilitator</span>
        </div>
      </div>

      {program.description && (
        <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
          {program.description}
        </p>
      )}

      {/* Modules */}
      {modules.map((mod, index) => {
        const clipId = `prog:${program.id}:${index}`;
        const clip = getClip(clipId);

        return (
          <div key={index} className="card" style={{ gap: '12px' }}>
            <div>
              <span className="eyebrow">MODULE {index + 1}</span>
              <h3 style={{ fontSize: '16px', marginTop: '2px' }}>{mod.title}</h3>
            </div>

            {/* Facilitator Video Clip Placeholder Button */}
            {clip && (
              <button 
                className="clip"
                onClick={() => onOpenVideo(clipId)}
                aria-label={`Play video: ${clip.title}`}
              >
                <span className="poster" aria-hidden="true">
                  <span className="play">
                    <svg viewBox="0 0 24 24">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </span>
                  <span className="dur tnum">1:15</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  <span className="eyebrow" style={{ color: 'var(--accent)' }}>FACILITATOR CLIP</span>
                  <b>{clip.title}</b>
                  <span className="m">Facilitator clip · {clip.who}</span>
                  <span className="m" style={{ color: 'var(--faint)' }}>Placeholder · to be recorded</span>
                </span>
              </button>
            )}

            {/* Linked Tools in this module */}
            {mod.tools && mod.tools.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {mod.tools.map((tId) => {
                  const cleanToolId = (tId || '').toLowerCase().trim();
                  const customTool = allTools.find(t => 
                    (t.tool_id && t.tool_id.toLowerCase() === cleanToolId) ||
                    (t.title && t.title.toLowerCase() === cleanToolId) ||
                    (t.tool_id && t.tool_id.toLowerCase().replace(/[-_\s]/g, '') === cleanToolId.replace(/[-_\s]/g, ''))
                  );
                  const info = customTool
                    ? { 
                        name: customTool.title, 
                        mins: `${customTool.minutes || 3} min`, 
                        desc: (customTool.tags && customTool.tags.length > 0) 
                          ? customTool.tags.join(' · ') 
                          : `${customTool.engine} · ${customTool.phase}`
                      }
                    : TOOL_NAMES[tId] || { name: tId, mins: '3 min', desc: '' };

                  return (
                    <button
                      key={tId}
                      className="tool"
                      onClick={() => onOpenTool && onOpenTool(tId)}
                      style={{
                        background: 'var(--surface-2)',
                        border: '1px solid var(--line)',
                        borderRadius: '12px',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textAlign: 'left'
                      }}
                    >
                      <span 
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: 'var(--surface)',
                          border: '1px solid var(--line)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '14px',
                          flex: 'none'
                        }}
                      >
                        📄
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <b style={{ display: 'block', fontSize: '13.5px', lineHeight: 1.3 }}>{info.name}</b>
                        {info.desc && <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--muted)', marginTop: '2px' }}>{info.desc}</span>}
                      </span>
                      <span className="meta" style={{ fontSize: '11.5px', color: 'var(--muted)', flex: 'none' }}>
                        {info.mins}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {modules.length === 0 && (
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <p style={{ color: 'var(--muted)', fontSize: '14px' }}>
            No modules added yet to this program. You can add modules in Admin Studio.
          </p>
        </div>
      )}

      {/* Facilitator Notice */}
      <div className="card soft">
        <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
          Facilitators: Deepa Kannan, Anbarasu Thangavelu. Live sessions and the cohort Circle are part of the full version.
        </p>
      </div>
    </div>
  );
};
