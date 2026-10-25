'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ReflectionTool, ProgramItem, VideoClipItem } from '@/lib/types';
import { 
  getAllTools, 
  saveTool, 
  deleteTool, 
  getAllPrograms, 
  saveProgram, 
  deleteProgram, 
  getAllVideos, 
  saveVideo,
  resetContentToDefaults
} from '@/lib/contentStore';
import { getAdminSession, setAdminSession, hasAdminPrivileges } from '@/lib/auth';

type AdminTab = 'tools' | 'programs' | 'videos' | 'database';

export default function AdminStudio() {
  const [isAdminAuth, setIsAdminAuth] = useState(false);
  const [adminAuthChecked, setAdminAuthChecked] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminLoading, setAdminLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('tools');
  const [tools, setTools] = useState<ReflectionTool[]>([]);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [videos, setVideos] = useState<Record<string, VideoClipItem>>({});
  
  // Status & Notification
  const [dbStatus, setDbStatus] = useState<{ connected: boolean; message: string; database?: string } | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    type: 'tool' | 'program';
    id: string;
    name: string;
  } | null>(null);

  // Tool Form State
  const [editingTool, setEditingTool] = useState<ReflectionTool | null>(null);
  const [toolId, setToolId] = useState('');
  const [toolTitle, setToolTitle] = useState('');
  const [toolEngine, setToolEngine] = useState('steps');
  const [toolPhase, setToolPhase] = useState('After');
  const [toolMinutes, setToolMinutes] = useState(2);
  const [toolTags, setToolTags] = useState('reflection, boundary');
  const [toolSteps, setToolSteps] = useState<{ prompt: string; placeholder?: string }[]>([
    { prompt: 'What happened that felt challenging or unexpected?', placeholder: 'Describe the situation briefly...' },
    { prompt: 'What emotion was strongest in your body?', placeholder: 'Tight chest, clenched jaw, racing mind...' },
    { prompt: 'What is one constructive step forward?', placeholder: 'A calm response, boundary, or short pause...' }
  ]);

  // Program Form State
  const [editingProgram, setEditingProgram] = useState<ProgramItem | null>(null);
  const [progId, setProgId] = useState('');
  const [progName, setProgName] = useState('');
  const [progSub, setProgSub] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progModules, setProgModules] = useState<{ title: string; tools: string[] }[]>([
    { title: 'Module 1: Emotional Awareness & Triggers', tools: ['card-naming', 'mood-check'] },
    { title: 'Module 2: Managing High-Pressure Conversations', tools: ['calm-reply', 'slow-exhale'] }
  ]);

  // Simulator Test State
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [simAnswer, setSimAnswer] = useState('');
  const [simAnswers, setSimAnswers] = useState<Record<number, string>>({});
  const [simComplete, setSimComplete] = useState(false);

  // Check admin session and load content
  useEffect(() => {
    const isAuth = hasAdminPrivileges();
    setIsAdminAuth(isAuth);
    setAdminAuthChecked(true);
    if (isAuth) {
      loadContent();
      checkDbStatus();
    }
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setAdminLoading(true);

    try {
      const res = await fetch('/api/auth/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, password: adminPassword })
      });
      const data = await res.json();
      if (!data.success) {
        setAdminError(data.error || 'Invalid admin passcode.');
        setAdminLoading(false);
        return;
      }

      setAdminSession(true);
      setIsAdminAuth(true);
      loadContent();
      checkDbStatus();
    } catch (err: any) {
      setAdminError(err?.message || 'Admin sign in failed.');
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAdminSignOut = () => {
    setAdminSession(false);
    setIsAdminAuth(false);
    setAdminPassword('');
  };

  const loadContent = () => {
    setTools(getAllTools());
    setPrograms(getAllPrograms());
    setVideos(getAllVideos());
  };

  const checkDbStatus = async () => {
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.db) {
        setDbStatus(data.db);
      }
    } catch (e) {
      setDbStatus({
        connected: false,
        message: 'Local browser storage active. MySQL server endpoint unreachable or not configured.'
      });
    }
  };

  const flashMessage = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // Tool Handlers
  const handleNewTool = () => {
    setEditingTool(null);
    setToolId('tool-' + Math.random().toString(36).substring(2, 7));
    setToolTitle('');
    setToolEngine('steps');
    setToolPhase('After');
    setToolMinutes(2);
    setToolTags('reflection');
    setToolSteps([
      { prompt: 'What was the moment or conversation?', placeholder: 'Describe what happened...' },
      { prompt: 'What feeling was under the surface?', placeholder: 'Hurt, pressure, comparison...' },
      { prompt: 'What would repair or steady look like?', placeholder: 'One small sentence or action...' }
    ]);
    resetSimulator();
  };

  const handleEditTool = (t: ReflectionTool) => {
    setEditingTool(t);
    setToolId(t.tool_id);
    setToolTitle(t.title);
    setToolEngine(t.engine || 'steps');
    setToolPhase(t.phase || 'After');
    setToolMinutes(t.minutes || 2);
    setToolTags(Array.isArray(t.tags) ? t.tags.join(', ') : '');
    setToolSteps(t.steps && t.steps.length > 0 ? t.steps : [
      { prompt: 'What is happening right now?', placeholder: 'Brief note...' }
    ]);
    resetSimulator();
  };

  const handleSaveTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toolTitle.trim()) {
      alert('Please provide a tool title');
      return;
    }
    const finalId = toolId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'tool-' + Date.now();
    const newTool: ReflectionTool = {
      tool_id: finalId,
      title: toolTitle.trim(),
      engine: toolEngine,
      phase: toolPhase,
      minutes: Number(toolMinutes) || 2,
      tags: toolTags.split(',').map(s => s.trim()).filter(Boolean),
      steps: toolSteps
    };

    if (editingTool && editingTool.tool_id.toLowerCase() !== finalId.toLowerCase()) {
      deleteTool(editingTool.tool_id);
    }

    await saveTool(newTool);
    flashMessage(`Saved tool "${newTool.title}" successfully!`);
    loadContent();
    setEditingTool(newTool);
  };

  const handleDeleteTool = (id: string, name: string) => {
    setDeleteConfirmTarget({ type: 'tool', id, name });
  };

  // Program Handlers
  const handleNewProgram = () => {
    setEditingProgram(null);
    setProgId('prog-' + Math.random().toString(36).substring(2, 7));
    setProgName('');
    setProgSub('');
    setProgDesc('');
    setProgModules([
      { title: 'Week 1: Core Foundation', tools: ['card-naming', 'mood-check'] },
      { title: 'Week 2: Emotional Agility in Practice', tools: ['calm-reply'] }
    ]);
  };

  const handleEditProgram = (p: ProgramItem) => {
    setEditingProgram(p);
    setProgId(p.id);
    setProgName(p.name);
    setProgSub(p.sub || '');
    setProgDesc(p.description || '');
    setProgModules(p.modules || []);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!progName.trim()) {
      alert('Please provide a program name');
      return;
    }
    const finalId = progId.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'prog-' + Date.now();
    const newProg: ProgramItem = {
      id: finalId,
      name: progName.trim(),
      sub: progSub.trim(),
      description: progDesc.trim(),
      modules: progModules
    };

    if (editingProgram && editingProgram.id.toLowerCase() !== finalId.toLowerCase()) {
      deleteProgram(editingProgram.id);
    }

    await saveProgram(newProg);
    flashMessage(`Saved program "${newProg.name}" successfully!`);
    loadContent();
    setEditingProgram(newProg);
  };

  const handleDeleteProgram = (id: string, name: string) => {
    setDeleteConfirmTarget({ type: 'program', id, name });
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmTarget) return;
    if (deleteConfirmTarget.type === 'tool') {
      deleteTool(deleteConfirmTarget.id);
      flashMessage(`Deleted tool "${deleteConfirmTarget.name}"`);
      loadContent();
      if (toolId === deleteConfirmTarget.id) handleNewTool();
      resetSimulator();
    } else {
      deleteProgram(deleteConfirmTarget.id);
      flashMessage(`Deleted program "${deleteConfirmTarget.name}"`);
      loadContent();
      if (progId === deleteConfirmTarget.id) handleNewProgram();
    }
    setDeleteConfirmTarget(null);
  };

  // Simulator Controls
  const resetSimulator = () => {
    setSimStepIndex(0);
    setSimAnswer('');
    setSimAnswers({});
    setSimComplete(false);
  };

  const handleSimNext = () => {
    const updated = { ...simAnswers, [simStepIndex]: simAnswer };
    setSimAnswers(updated);
    setSimAnswer('');
    if (simStepIndex + 1 < toolSteps.length) {
      setSimStepIndex(simStepIndex + 1);
    } else {
      setSimComplete(true);
    }
  };

  if (!adminAuthChecked) {
    return null;
  }

  // Admin Not Authenticated: Render Admin Sign-In
  if (!isAdminAuth) {
    return (
      <div
        className="admin-studio-root"
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#090d16',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '24px'
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: '430px',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '36px 30px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ea580c, #f97316)',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '20px',
              marginBottom: '12px',
              boxShadow: '0 4px 16px rgba(234, 88, 12, 0.35)'
            }}>
              EQ
            </div>
            <div style={{ marginBottom: '8px' }}>
              <span style={{
                display: 'inline-block',
                backgroundColor: 'rgba(234, 88, 12, 0.15)',
                border: '1px solid #ea580c',
                color: '#fb923c',
                padding: '3px 10px',
                borderRadius: '999px',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.04em'
              }}>
                ADMIN PRIVILEGES REQUIRED
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 4px', color: '#f8fafc' }}>
              Creator Studio Sign-In
            </h2>
            <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
              Drishta Vidya Facilitator & Administrator Access Only
            </p>
          </div>

          {adminError && (
            <div style={{
              backgroundColor: '#450a0a',
              color: '#fca5a5',
              border: '1px solid #991b1b',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '16px'
            }}>
              {adminError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px', fontWeight: 600 }}>
                Admin Email
              </label>
              <input
                type="email"
                placeholder="admin@drishtavidya.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#090d16',
                  color: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>
                  Admin Passcode *
                </label>
                <span style={{ fontSize: '11px', color: '#ea580c' }}>
                  Passcode: admin2026
                </span>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #334155',
                  backgroundColor: '#090d16',
                  color: '#f8fafc',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={adminLoading}
              style={{
                marginTop: '8px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(234, 88, 12, 0.4)'
              }}
            >
              {adminLoading ? 'Authenticating...' : 'Sign In to Creator Studio →'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link
              href="/"
              style={{
                fontSize: '12.5px',
                color: '#64748b',
                textDecoration: 'none',
                fontWeight: 500
              }}
            >
              &larr; Return to EQ OS App
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="admin-studio-root"
      style={{
        minHeight: '100vh',
        width: '100%',
        backgroundColor: '#090d16',
        color: '#f1f5f9',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Top Navigation Bar */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 28px',
        borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ea580c, #f97316)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '15px',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)'
          }}>
            EQ
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                EQ OS Creator Studio
              </h1>
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '999px',
                backgroundColor: '#1e293b',
                color: '#94a3b8',
                border: '1px solid #334155'
              }}>
                v2.0 Admin
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Drishta Vidya Content Engine · Tools, Programs & Video Curricula
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* DB Indicator */}
          <div style={{
            fontSize: '12px',
            padding: '6px 12px',
            borderRadius: '6px',
            backgroundColor: dbStatus?.connected ? '#064e3b' : '#1e293b',
            color: dbStatus?.connected ? '#6ee7b7' : '#94a3b8',
            border: `1px solid ${dbStatus?.connected ? '#059669' : '#334155'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: dbStatus?.connected ? '#10b981' : '#f59e0b',
              display: 'inline-block'
            }} />
            {dbStatus?.connected ? 'MySQL Connected' : 'Local Storage Mode'}
          </div>

          <button
            id="admin-sign-out-btn"
            onClick={handleAdminSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '7px',
              backgroundColor: '#1e293b',
              color: '#f87171',
              border: '1px solid #7f1d1d',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>

          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '7px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
            }}
          >
            &larr; Exit to EQ OS App
          </Link>
        </div>
      </header>

      {/* Status Alert Banner */}
      {statusMessage && (
        <div style={{
          backgroundColor: '#047857',
          color: '#ffffff',
          padding: '10px 24px',
          fontSize: '13px',
          fontWeight: 600,
          textAlign: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          {statusMessage}
        </div>
      )}

      {/* Main Studio Two-Column Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(600px, 1.4fr) minmax(380px, 440px)',
        gap: '24px',
        padding: '24px 28px',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* Left Column: Creator Tools */}
        <div>
          {/* Studio Navigation Tabs */}
          <div style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid #1e293b',
            paddingBottom: '12px',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => setActiveTab('tools')}
              style={{
                background: activeTab === 'tools' ? '#1e293b' : 'transparent',
                color: activeTab === 'tools' ? '#f8fafc' : '#94a3b8',
                border: activeTab === 'tools' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🛠️ Tools & Engines</span>
              <span style={{ fontSize: '11px', background: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                {tools.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('programs')}
              style={{
                background: activeTab === 'programs' ? '#1e293b' : 'transparent',
                color: activeTab === 'programs' ? '#f8fafc' : '#94a3b8',
                border: activeTab === 'programs' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🎓 Programs & Cohorts</span>
              <span style={{ fontSize: '11px', background: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                {programs.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('videos')}
              style={{
                background: activeTab === 'videos' ? '#1e293b' : 'transparent',
                color: activeTab === 'videos' ? '#f8fafc' : '#94a3b8',
                border: activeTab === 'videos' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>🎥 Video Lessons</span>
              <span style={{ fontSize: '11px', background: '#334155', padding: '1px 6px', borderRadius: '10px' }}>
                {Object.keys(videos).length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              style={{
                background: activeTab === 'database' ? '#1e293b' : 'transparent',
                color: activeTab === 'database' ? '#f8fafc' : '#94a3b8',
                border: activeTab === 'database' ? '1px solid #334155' : '1px solid transparent',
                borderRadius: '8px',
                padding: '8px 16px',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                marginLeft: 'auto'
              }}
            >
              🗄️ Database & Sync
            </button>
          </div>

          {/* TAB 1: TOOLS BUILDER */}
          {activeTab === 'tools' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Form Card */}
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                      {editingTool ? `Edit Tool: ${editingTool.title}` : 'Create New Reflection Tool'}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Build step-by-step emotional reflection guides that run directly inside EQ OS.
                    </p>
                  </div>
                  <button
                    onClick={handleNewTool}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Reset Form
                  </button>
                </div>

                <form onSubmit={handleSaveTool}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Tool Title *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Post-meeting debrief"
                        value={toolTitle}
                        onChange={(e) => {
                          setToolTitle(e.target.value);
                          if (!editingTool) {
                            setToolId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                          }
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#f8fafc',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Tool ID / Slug
                      </label>
                      <input
                        type="text"
                        value={toolId}
                        onChange={(e) => setToolId(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#94a3b8',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Engine Type
                      </label>
                      <select
                        value={toolEngine}
                        onChange={(e) => setToolEngine(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '13px'
                        }}
                      >
                        <option value="steps">Step-by-step Reflection</option>
                        <option value="body">Nervous System (Exhale/Reset)</option>
                        <option value="naming">Emotion Naming (Granularity)</option>
                        <option value="perspective">Cognitive Decentering</option>
                        <option value="script">Conversation Script</option>
                        <option value="ritual">Daily Ritual Anchor</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Phase
                      </label>
                      <select
                        value={toolPhase}
                        onChange={(e) => setToolPhase(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '13px'
                        }}
                      >
                        <option value="Before">Before (Preparation)</option>
                        <option value="During">During (In-the-moment)</option>
                        <option value="After">After (Debrief & Repair)</option>
                        <option value="Grow">Grow (Long-term Practice)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Duration
                      </label>
                      <select
                        value={toolMinutes}
                        onChange={(e) => setToolMinutes(Number(e.target.value))}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 10px',
                          color: '#f8fafc',
                          fontSize: '13px'
                        }}
                      >
                        <option value={1}>1 minute</option>
                        <option value={2}>2 minutes</option>
                        <option value={3}>3 minutes</option>
                        <option value={4}>4 minutes</option>
                        <option value={5}>5 minutes</option>
                      </select>
                    </div>
                  </div>

                  {/* Step Prompts Builder */}
                  <div style={{ marginTop: '16px', borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                        Step Reflection Prompts ({toolSteps.length} Steps)
                      </span>
                      <button
                        type="button"
                        onClick={() => setToolSteps([...toolSteps, { prompt: '', placeholder: 'Type prompt reflection here...' }])}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#38bdf8',
                          border: '1px solid #0284c7',
                          borderRadius: '5px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add Step
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {toolSteps.map((step, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          backgroundColor: '#090d16',
                          padding: '8px 10px',
                          borderRadius: '6px',
                          border: '1px solid #1e293b'
                        }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, width: '20px' }}>
                            {idx + 1}.
                          </span>
                          <input
                            type="text"
                            placeholder="Prompt question..."
                            value={step.prompt}
                            onChange={(e) => {
                              const updated = [...toolSteps];
                              updated[idx].prompt = e.target.value;
                              setToolSteps(updated);
                            }}
                            style={{
                              flex: 1,
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#f8fafc',
                              fontSize: '13px',
                              outline: 'none'
                            }}
                          />
                          {toolSteps.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setToolSteps(toolSteps.filter((_, i) => i !== idx))}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                fontSize: '14px',
                                cursor: 'pointer',
                                padding: '2px 6px'
                              }}
                              title="Delete step"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
                      }}
                    >
                      {editingTool ? 'Update Tool in EQ OS' : 'Publish Tool to EQ OS'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Tools Catalog */}
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                    Active Tools Library ({tools.length})
                  </h3>
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      backgroundColor: '#090d16',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '5px 10px',
                      color: '#f8fafc',
                      fontSize: '12px',
                      width: '200px'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {tools
                    .filter(t => !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((t) => (
                      <div
                        key={t.tool_id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          backgroundColor: '#090d16',
                          border: toolId === t.tool_id ? '1px solid #ea580c' : '1px solid #1e293b',
                          borderRadius: '8px'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <b style={{ fontSize: '13.5px', color: '#f8fafc' }}>{t.title}</b>
                            <span style={{
                              fontSize: '10.5px',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#1e293b',
                              color: '#94a3b8'
                            }}>
                              {t.engine || 'steps'}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              {t.minutes} min · {t.phase}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'monospace' }}>
                            id: {t.tool_id}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleEditTool(t)}
                            style={{
                              backgroundColor: '#1e293b',
                              color: '#38bdf8',
                              border: '1px solid #0284c7',
                              borderRadius: '5px',
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTool(t.tool_id, t.title)}
                            style={{
                              backgroundColor: '#1e293b',
                              color: '#ef4444',
                              border: '1px solid #991b1b',
                              borderRadius: '5px',
                              padding: '4px 10px',
                              fontSize: '11.5px',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROGRAMS BUILDER */}
          {activeTab === 'programs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#f8fafc' }}>
                      {editingProgram ? `Edit Program: ${editingProgram.name}` : 'Create New Expert Program'}
                    </h2>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748b' }}>
                      Design custom cohort programs and assign relevant tools and videos to each module.
                    </p>
                  </div>
                  <button
                    onClick={handleNewProgram}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#94a3b8',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    + Reset Form
                  </button>
                </div>

                <form onSubmit={handleSaveProgram}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Program Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. LEAD RESILIENCE"
                        value={progName}
                        onChange={(e) => {
                          setProgName(e.target.value);
                          if (!editingProgram) {
                            setProgId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                          }
                        }}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#f8fafc',
                          fontSize: '13.5px',
                          boxSizing: 'border-box'
                        }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                        Program ID / Slug
                      </label>
                      <input
                        type="text"
                        value={progId}
                        onChange={(e) => setProgId(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: '#090d16',
                          border: '1px solid #334155',
                          borderRadius: '6px',
                          padding: '8px 12px',
                          color: '#94a3b8',
                          fontSize: '13px',
                          fontFamily: 'monospace',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      Subtitle / Focus Area
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Emotional stamina for executives & founders"
                      value={progSub}
                      onChange={(e) => setProgSub(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#f8fafc',
                        fontSize: '13.5px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                      Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Describe what participants will gain from this program..."
                      value={progDesc}
                      onChange={(e) => setProgDesc(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#090d16',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        padding: '8px 12px',
                        color: '#f8fafc',
                        fontSize: '13px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  {/* Modules Builder */}
                  <div style={{ borderTop: '1px solid #1e293b', paddingTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
                        Curriculum Modules ({progModules.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => setProgModules([...progModules, { title: `Module ${progModules.length + 1}: Next Focus`, tools: ['mood-check'] }])}
                        style={{
                          backgroundColor: '#1e293b',
                          color: '#38bdf8',
                          border: '1px solid #0284c7',
                          borderRadius: '5px',
                          padding: '4px 10px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        + Add Module
                      </button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {progModules.map((mod, idx) => (
                        <div key={idx} style={{
                          backgroundColor: '#090d16',
                          border: '1px solid #1e293b',
                          borderRadius: '8px',
                          padding: '12px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={mod.title}
                              onChange={(e) => {
                                const updated = [...progModules];
                                updated[idx].title = e.target.value;
                                setProgModules(updated);
                              }}
                              style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                border: '1px solid #334155',
                                borderRadius: '4px',
                                padding: '4px 8px',
                                color: '#f8fafc',
                                fontSize: '13px'
                              }}
                            />
                            {progModules.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setProgModules(progModules.filter((_, i) => i !== idx))}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#ef4444',
                                  fontSize: '16px',
                                  cursor: 'pointer'
                                }}
                              >
                                &times;
                              </button>
                            )}
                          </div>

                          <div style={{ marginTop: '8px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                              {(mod.tools || []).map((tId) => {
                                const toolObj = tools.find(t => t.tool_id === tId);
                                const title = toolObj ? toolObj.title : tId;
                                return (
                                  <span 
                                    key={tId} 
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      backgroundColor: '#1e293b',
                                      border: '1px solid #334155',
                                      color: '#e2e8f0',
                                      fontSize: '11.5px',
                                      padding: '3px 8px',
                                      borderRadius: '12px'
                                    }}
                                  >
                                    📄 {title}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updated = [...progModules];
                                        updated[idx].tools = updated[idx].tools.filter(id => id !== tId);
                                        setProgModules(updated);
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        color: '#ef4444',
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontSize: '13px',
                                        lineHeight: 1
                                      }}
                                      title="Remove tool from module"
                                    >
                                      &times;
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                            <select
                              value=""
                              onChange={(e) => {
                                const selectedId = e.target.value;
                                if (!selectedId) return;
                                const updated = [...progModules];
                                if (!updated[idx].tools.includes(selectedId)) {
                                  updated[idx].tools = [...updated[idx].tools, selectedId];
                                  setProgModules(updated);
                                }
                              }}
                              style={{
                                backgroundColor: '#0f172a',
                                border: '1px solid #334155',
                                borderRadius: '5px',
                                color: '#38bdf8',
                                fontSize: '12px',
                                padding: '4px 8px',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="">+ Attach tool to this module...</option>
                              {tools.map(t => (
                                <option key={t.tool_id} value={t.tool_id}>
                                  {t.title} ({t.minutes} min · {t.engine})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#ea580c',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '10px 20px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(234, 88, 12, 0.4)'
                      }}
                    >
                      {editingProgram ? 'Update Program' : 'Publish Program'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Programs */}
              <div style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '12px',
                padding: '20px'
              }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 14px', color: '#f8fafc' }}>
                  Active Programs ({programs.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {programs.map((p) => (
                    <div
                      key={p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px',
                        backgroundColor: '#090d16',
                        border: progId === p.id ? '1px solid #ea580c' : '1px solid #1e293b',
                        borderRadius: '8px'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <b style={{ fontSize: '14px', color: '#f8fafc' }}>{p.name}</b>
                          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{p.sub}</span>
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                          {p.modules ? p.modules.length : 0} Modules · {p.description}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditProgram(p)}
                          style={{
                            backgroundColor: '#1e293b',
                            color: '#38bdf8',
                            border: '1px solid #0284c7',
                            borderRadius: '5px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProgram(p.id, p.name)}
                          style={{
                            backgroundColor: '#1e293b',
                            color: '#ef4444',
                            border: '1px solid #991b1b',
                            borderRadius: '5px',
                            padding: '4px 10px',
                            fontSize: '11.5px',
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS REGISTRY */}
          {activeTab === 'videos' && (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#f8fafc' }}>
                Video Lessons & Facilitator Clips ({Object.keys(videos).length})
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
                Manage micro-video lessons, facilitator models, and cohort clips.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                {Object.entries(videos).map(([k, v]) => (
                  <div key={k} style={{
                    backgroundColor: '#090d16',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <span style={{ fontSize: '11px', color: '#ea580c', fontWeight: 700 }}>
                      {v.kind} · {v.secs}s
                    </span>
                    <h4 style={{ fontSize: '13.5px', margin: '4px 0', color: '#f8fafc' }}>
                      {v.title}
                    </h4>
                    <p style={{ margin: '2px 0 6px', fontSize: '11.5px', color: '#94a3b8' }}>
                      By {v.who}
                    </p>
                    <span style={{ fontSize: '10.5px', color: '#64748b', fontFamily: 'monospace' }}>
                      {k} → {v.on}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & SYNC */}
          {activeTab === 'database' && (
            <div style={{
              backgroundColor: '#0f172a',
              border: '1px solid #1e293b',
              borderRadius: '12px',
              padding: '20px'
            }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 4px', color: '#f8fafc' }}>
                Hostinger MySQL Cloud Sync
              </h2>
              <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#64748b' }}>
                Manage cloud database persistence, export full catalog JSON, or test connection credentials.
              </p>

              <div style={{
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#f8fafc' }}>Database Status:</b>
                    <span style={{
                      marginLeft: '8px',
                      fontSize: '12px',
                      color: dbStatus?.connected ? '#10b981' : '#f59e0b',
                      fontWeight: 600
                    }}>
                      {dbStatus?.connected ? 'Connected to Hostinger MySQL' : 'Local Fallback Mode'}
                    </span>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                      {dbStatus?.message}
                    </p>
                  </div>
                  <button
                    onClick={checkDbStatus}
                    style={{
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      padding: '6px 14px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Test Connection
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    const catalog = {
                      exportedAt: new Date().toISOString(),
                      tools,
                      programs,
                      videos
                    };
                    const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `eqos_catalog_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    flashMessage('Catalog exported successfully!');
                  }}
                  style={{
                    backgroundColor: '#ea580c',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Download Full Catalog JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetContentToDefaults();
                    loadContent();
                    flashMessage('Catalog reset to initial seed defaults successfully.');
                  }}
                  style={{
                    backgroundColor: '#1e293b',
                    color: '#94a3b8',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Reset Catalog to Seed Defaults
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Mobile Preview Simulator */}
        <div>
          <div style={{
            position: 'sticky',
            top: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <div style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#94a3b8' }}>
                📱 Live Mobile Simulator
              </span>
              <button
                onClick={resetSimulator}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#38bdf8',
                  fontSize: '11.5px',
                  cursor: 'pointer'
                }}
              >
                Reset Simulator
              </button>
            </div>

            {/* Mobile Device Frame */}
            <div style={{
              width: '380px',
              height: '740px',
              backgroundColor: '#000000',
              borderRadius: '44px',
              padding: '12px',
              boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px #334155',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Inner Screen */}
              <div style={{
                flex: 1,
                backgroundColor: '#ffffff',
                borderRadius: '34px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                color: '#0f172a',
                fontFamily: 'system-ui, sans-serif'
              }}>
                {/* Dynamic Notch / Island */}
                <div style={{
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '6px'
                }}>
                  <div style={{
                    width: '90px',
                    height: '18px',
                    backgroundColor: '#000000',
                    borderRadius: '12px'
                  }} />
                </div>

                {/* Simulated Screen Header */}
                <div style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: '#ea580c' }}>
                    EQ OS
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    {activeTab === 'programs' ? 'Program Preview' : 'Interactive Tool Runner'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    {toolMinutes}m
                  </span>
                </div>

                {/* Simulated Tool Interactive Body */}
                <div style={{
                  flex: 1,
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  overflowY: 'auto'
                }}>
                  {activeTab === 'programs' ? (
                    <div>
                      <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#ea580c', textTransform: 'uppercase' }}>
                        Curriculum Preview
                      </span>
                      <h3 style={{ fontSize: '18px', margin: '4px 0 2px', fontWeight: 800 }}>
                        {progName || 'Sample Program'}
                      </h3>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 12px' }}>
                        {progSub || 'Program subtitle preview'}
                      </p>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {progModules.map((m, i) => (
                          <div key={i} style={{
                            padding: '10px',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #e2e8f0'
                          }}>
                            <b style={{ fontSize: '12.5px', display: 'block', color: '#1e293b' }}>
                              {m.title}
                            </b>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              Tools: {m.tools.join(', ')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : simComplete ? (
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: 1,
                      textAlign: 'center'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#dcfce7',
                        color: '#16a34a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '22px',
                        marginBottom: '12px'
                      }}>
                        &check;
                      </div>
                      <h4 style={{ fontSize: '16px', margin: '0 0 6px', fontWeight: 800 }}>
                        Reflection Complete
                      </h4>
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px' }}>
                        Saved to your private Drishti log.
                      </p>
                      <button
                        onClick={resetSimulator}
                        style={{
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <div>
                      {/* Step Progress Pill */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          backgroundColor: '#ffedd5',
                          color: '#c2410c',
                          padding: '2px 8px',
                          borderRadius: '10px'
                        }}>
                          Step {simStepIndex + 1} of {toolSteps.length}
                        </span>
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                          {toolPhase}
                        </span>
                      </div>

                      <h4 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 10px', color: '#0f172a' }}>
                        {toolTitle || 'Untitled Tool'}
                      </h4>

                      <p style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#334155',
                        lineHeight: 1.4,
                        marginBottom: '14px'
                      }}>
                        {toolSteps[simStepIndex]?.prompt || 'Prompt question goes here...'}
                      </p>

                      <textarea
                        rows={4}
                        placeholder={toolSteps[simStepIndex]?.placeholder || 'Your reflection...'}
                        value={simAnswer}
                        onChange={(e) => setSimAnswer(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          fontFamily: 'inherit',
                          outline: 'none',
                          boxSizing: 'border-box',
                          marginBottom: '16px'
                        }}
                      />

                      <button
                        onClick={handleSimNext}
                        style={{
                          width: '100%',
                          backgroundColor: '#ea580c',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '10px',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        {simStepIndex + 1 < toolSteps.length ? 'Continue →' : 'Save Reflection'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated Home Indicator */}
                <div style={{
                  height: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '4px'
                }}>
                  <div style={{
                    width: '120px',
                    height: '4px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '2px'
                  }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern In-App Delete Confirmation Modal */}
      {deleteConfirmTarget && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'grid',
          placeItems: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <span style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                display: 'grid',
                placeItems: 'center',
                fontSize: '18px',
                fontWeight: 'bold'
              }}>
                ⚠️
              </span>
              <h3 style={{ margin: 0, fontSize: '17px', color: '#f8fafc', fontWeight: 700 }}>
                Delete {deleteConfirmTarget.type === 'tool' ? 'Reflection Tool' : 'Program'}?
              </h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#94a3b8', lineHeight: 1.5 }}>
              Are you sure you want to delete <b style={{ color: '#f1f5f9' }}>"{deleteConfirmTarget.name}"</b>?
              This will remove it from the OS Library.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-delete"
                onClick={handleConfirmDelete}
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
