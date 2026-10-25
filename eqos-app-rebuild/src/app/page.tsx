'use client';

import React, { useState, useEffect } from 'react';
import { TabType, SubViewType, UserProfile } from '@/lib/types';
import { DEFAULT_PROFILES } from '@/lib/data';
import { AppHeader } from '@/components/layout/AppHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { HomeView } from '@/components/views/HomeView';
import { LibraryView } from '@/components/views/LibraryView';
import { StoryView } from '@/components/views/StoryView';
import { ProfileView } from '@/components/views/ProfileView';
import { ProgramView } from '@/components/views/ProgramView';
import { VideoView } from '@/components/views/VideoView';

import { ResetModal } from '@/components/modals/ResetModal';
import { CalmReplyModal } from '@/components/modals/CalmReplyModal';
import { DecodeModal } from '@/components/modals/DecodeModal';
import { ScriptModal } from '@/components/modals/ScriptModal';
import { DrishtiModal } from '@/components/modals/DrishtiModal';
import { CrisisModal } from '@/components/modals/CrisisModal';
import { CheckInModal } from '@/components/modals/CheckInModal';

import { AuthUser, getCurrentUser, signOutUser, hasAdminPrivileges, setAdminSession } from '@/lib/auth';
import { AuthView } from '@/components/auth/AuthView';

export default function EQOSApp() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [currentTab, setCurrentTab] = useState<TabType>('today');
  const [currentView, setCurrentView] = useState<SubViewType>('main');
  const [activeProgramId, setActiveProgramId] = useState<string>('equip');
  const [activeClipId, setActiveClipId] = useState<string>('v-secondary');
  const [previousView, setPreviousView] = useState<SubViewType>('main');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // User Profile state with Priya as default
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILES.priya);

  // Modals state
  const [showReset, setShowReset] = useState(false);
  const [showCalmReply, setShowCalmReply] = useState(false);
  const [showDecode, setShowDecode] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [activeScriptId, setActiveScriptId] = useState<string | undefined>(undefined);
  const [showDrishti, setShowDrishti] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [showCheckIn, setShowCheckIn] = useState(false);

  // Cross-view state for Atlas families
  const [selectedAtlasFamily, setSelectedAtlasFamily] = useState<string | undefined>(undefined);

  // Hydrate theme and profile from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('eqos_theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      }

      const savedProfile = localStorage.getItem('eqos_user_profile');
      if (savedProfile) {
        setProfile(JSON.parse(savedProfile));
      }

      // Check current user session
      const user = getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
      setAuthChecked(true);
    } catch (e) {
      // LocalStorage access fallback
      setAuthChecked(true);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('eqos_theme', next);
    } catch (e) {}
  };

  const handleOpenScript = (scriptId?: string) => {
    setActiveScriptId(scriptId);
    setShowScript(true);
  };

  const handleSelectFamily = (familyId: string) => {
    setSelectedAtlasFamily(familyId);
    setCurrentTab('library');
    setCurrentView('main');
  };

  const handleUpdateProfile = async (updated: UserProfile) => {
    setProfile(updated);
    try {
      localStorage.setItem('eqos_user_profile', JSON.stringify(updated));
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile: updated })
      });
    } catch (err) {
      console.log('Saved profile locally:', err);
    }
  };

  const handleSwitchPersona = (key: string) => {
    const next = DEFAULT_PROFILES[key] || DEFAULT_PROFILES.priya;
    setProfile(next);
    try {
      localStorage.setItem('eqos_user_profile', JSON.stringify(next));
    } catch (e) {}
  };

  const handleOpenProgram = (programId: string) => {
    setActiveProgramId(programId);
    setPreviousView(currentView);
    setCurrentView('program');
  };

  const handleOpenVideo = (clipId: string) => {
    setActiveClipId(clipId);
    setPreviousView(currentView);
    setCurrentView('video');
  };

  if (!authChecked) {
    return null;
  }

  // First time or signed out: Show Auth Screen
  if (!currentUser) {
    return (
      <AuthView
        onAuthenticated={(user, userProfile) => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setAdminSession(true);
          }
          setProfile(userProfile);
          try {
            localStorage.setItem('eqos_user_profile', JSON.stringify(userProfile));
          } catch (e) {}
        }}
      />
    );
  }

  return (
    <>
      {/* App Bar Header */}
      <AppHeader
        currentTab={currentTab}
        customTitle={
          currentView === 'profile'
            ? 'What the OS knows'
            : currentView === 'program'
            ? 'Program'
            : currentView === 'video'
            ? 'Video'
            : undefined
        }
        onBack={
          currentView !== 'main'
            ? () => setCurrentView('main')
            : undefined
        }
        onOpenCrisis={() => setShowCrisis(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        userInitial={profile.ini}
        userName={profile.name}
        userEmail={profile.email}
        isAdmin={hasAdminPrivileges(currentUser)}
        isProfileActive={currentView === 'profile'}
        onOpenProfile={() => {
          setCurrentView(currentView === 'profile' ? 'main' : 'profile');
        }}
        onSignOut={() => {
          signOutUser();
          setAdminSession(false);
          setCurrentUser(null);
          setCurrentView('main');
        }}
      />

      {/* Profile & Privacy View (What the OS knows) */}
      {currentView === 'profile' && (
        <ProfileView
          profile={profile}
          isAdmin={hasAdminPrivileges(currentUser)}
          onUpdateProfile={handleUpdateProfile}
          onSignOut={() => {
            signOutUser();
            setAdminSession(false);
            setCurrentUser(null);
            setCurrentView('main');
          }}
        />
      )}

      {/* Program View (Screen 32) */}
      {currentView === 'program' && (
        <ProgramView
          programId={activeProgramId}
          onBack={() => setCurrentView('main')}
          onOpenVideo={handleOpenVideo}
          onOpenTool={(toolId) => {
            if (toolId.includes('card')) {
              handleOpenVideo(toolId.replace('card-', 'v-'));
            } else if (toolId.includes('reset') || toolId.includes('exhale')) {
              setShowReset(true);
            } else {
              handleOpenScript(toolId);
            }
          }}
        />
      )}

      {/* Video View (Screen 33) */}
      {currentView === 'video' && (
        <VideoView
          clipId={activeClipId}
          onBack={() => setCurrentView(previousView)}
        />
      )}

      {/* Main Tab Screens */}
      {currentView === 'main' && (
        <>
          {/* Pillar 1: Today Workspace */}
          {currentTab === 'today' && (
            <HomeView
              profile={profile}
              onOpenReset={() => setShowReset(true)}
              onOpenCalmReply={() => setShowCalmReply(true)}
              onOpenDecode={() => setShowDecode(true)}
              onOpenDrishti={() => setShowDrishti(true)}
              onOpenScript={handleOpenScript}
              onSelectFamily={handleSelectFamily}
              onOpenProgram={handleOpenProgram}
              onOpenCheckIn={() => setShowCheckIn(true)}
              onOpenProfile={() => setCurrentView('profile')}
            />
          )}

          {/* Pillar 2: Library (App & Engine Catalog) */}
          {currentTab === 'library' && (
            <LibraryView
              onOpenReset={() => setShowReset(true)}
              onOpenCalmReply={() => setShowCalmReply(true)}
              onOpenDecode={() => setShowDecode(true)}
              onOpenScript={handleOpenScript}
              onOpenCheckIn={() => setShowCheckIn(true)}
              onOpenProgram={handleOpenProgram}
              onOpenVideo={handleOpenVideo}
              onOpenCrisis={() => setShowCrisis(true)}
            />
          )}

          {/* Pillar 3: Story (Telemetry & Growth Log) */}
          {currentTab === 'story' && (
            <StoryView
              onOpenProgram={handleOpenProgram}
              onOpenVideo={handleOpenVideo}
            />
          )}
        </>
      )}

      {/* Persistent 3-Pillar Bottom Dock */}
      <BottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentView('main');
          setCurrentTab(tab);
        }}
      />

      {/* Shared Modals / Overlays */}
      {showReset && (
        <ResetModal
          onClose={() => setShowReset(false)}
          onOpenAtlasWithName={(word) => {
            setShowReset(false);
            setCurrentTab('library');
          }}
        />
      )}

      {showCalmReply && (
        <CalmReplyModal
          onClose={() => setShowCalmReply(false)}
          onOpenCrisis={() => {
            setShowCalmReply(false);
            setShowCrisis(true);
          }}
        />
      )}

      {showDecode && (
        <DecodeModal
          onClose={() => setShowDecode(false)}
          onSaveCheckin={() => {
            setShowDecode(false);
          }}
        />
      )}

      {showScript && (
        <ScriptModal
          initialScriptId={activeScriptId}
          onClose={() => setShowScript(false)}
        />
      )}

      {showDrishti && (
        <DrishtiModal
          onClose={() => setShowDrishti(false)}
          onOpenReset={() => {
            setShowDrishti(false);
            setShowReset(true);
          }}
          onOpenCalmReply={() => {
            setShowDrishti(false);
            setShowCalmReply(true);
          }}
          onOpenCrisis={() => {
            setShowDrishti(false);
            setShowCrisis(true);
          }}
        />
      )}

      {showCrisis && (
        <CrisisModal
          onClose={() => setShowCrisis(false)}
        />
      )}

      {showCheckIn && (
        <CheckInModal
          onClose={() => setShowCheckIn(false)}
          onOpenAtlas={() => {
            setShowCheckIn(false);
            setCurrentTab('library');
          }}
          onSave={() => {
            setShowCheckIn(false);
          }}
        />
      )}
    </>
  );
}
