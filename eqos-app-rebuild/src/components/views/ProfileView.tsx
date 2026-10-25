'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { GOALS, DEFAULT_PROFILES } from '@/lib/data';
import { EditProfileModal } from '@/components/modals/EditProfileModal';

interface ProfileViewProps {
  profile: UserProfile;
  isAdmin?: boolean;
  onUpdateProfile: (updated: UserProfile) => Promise<void> | void;
  onSwitchPersona?: (personaKey: string) => void;
  onSignOut?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  isAdmin = false,
  onUpdateProfile,
  onSwitchPersona,
  onSignOut
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherSuccess, setVoucherSuccess] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  const handleToggleSwitch = (key: string) => {
    const updatedSwitches = {
      ...profile.guidanceSwitches,
      [key]: !profile.guidanceSwitches[key]
    };
    onUpdateProfile({
      ...profile,
      guidanceSwitches: updatedSwitches
    });
  };

  const handleGoalChange = (newGoal: string) => {
    onUpdateProfile({
      ...profile,
      goal: newGoal
    });
  };

  const handleRedeemVoucher = () => {
    if (!voucherCode.trim()) return;
    if (voucherCode.toUpperCase().startsWith('DV-')) {
      setVoucherSuccess(true);
      setVoucherError('');
    } else {
      setVoucherError('Invalid voucher code. Please check your purchase confirmation email.');
      setVoucherSuccess(false);
    }
  };

  const handleExportData = () => {
    const data = {
      user: profile.name,
      email: profile.email,
      phone: profile.phone,
      exported_at: new Date().toISOString(),
      privacy_standard: "India DPDP Act 2025 Compliant",
      profile: profile
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eq-os-export-${profile.name.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const TOGGLE_FIELDS = [
    { key: 'household', label: 'Household', value: profile.household },
    { key: 'children', label: 'Children', value: profile.children },
    { key: 'caregiving', label: 'Caregiving', value: profile.caregiving },
    { key: 'role', label: 'Role', value: profile.role },
    { key: 'pattern', label: 'Work pattern', value: profile.pattern },
    { key: 'culture', label: 'Cultural setting', value: profile.culture },
    { key: 'faith', label: 'Faith or spiritual practice', value: profile.faith, sensitive: true },
    { key: 'gender', label: 'Gender', value: profile.gender, sensitive: true }
  ];

  return (
    <div className="screen">
      {/* User Header (Screen 34) */}
      <div className="row" style={{ alignItems: 'center' }}>
        <span className="avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
          {profile.ini}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '20px' }}>{profile.name}</h3>
            {isAdmin && (
              <span style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#ea580c',
                color: '#ffffff',
                letterSpacing: '0.04em'
              }}>
                ADMIN
              </span>
            )}
          </div>
          <p className="note">{profile.channel} · private by default</p>
        </div>
        <button 
          onClick={() => setShowEditModal(true)}
          className="btn small"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
          aria-label="Edit user details"
        >
          ✏️ Edit details
        </button>
      </div>

      {/* Contact & Notification Settings Card */}
      <div className="card soft">
        <div className="row between" style={{ alignItems: 'flex-start' }}>
          <div>
            <p className="eyebrow" style={{ marginBottom: '4px' }}>CONTACT & NOTIFICATIONS</p>
            <p style={{ fontSize: '13.5px', margin: '2px 0' }}>
              <b>Email:</b> {profile.email || 'None added'}
            </p>
            <p style={{ fontSize: '13.5px', margin: '2px 0' }}>
              <b>WhatsApp / Phone:</b> {profile.phone || 'None added'}
            </p>
            <p style={{ fontSize: '13.5px', margin: '2px 0' }}>
              <b>Preferred Language:</b> {profile.lang === 'ta' ? 'Tamil (தமிழ்)' : profile.lang === 'hi' ? 'Hindi (हिन्दी)' : profile.lang === 'pt' ? 'Portuguese' : profile.lang === 'es' ? 'Spanish' : 'English'}
            </p>
          </div>
          <button onClick={() => setShowEditModal(true)} className="link" style={{ fontSize: '13px' }}>
            Change
          </button>
        </div>
      </div>

      {/* Privacy Notice Banner (Screen 34) */}
      <div className="card soft">
        <p style={{ fontSize: '13.5px' }}>
          Switch anything off and the OS stops using it for guidance, without deleting it. Watch the home suggestion and the log change.
        </p>
      </div>

      {/* Profile Rows (Screen 34 .card.prof) */}
      <div className="card prof">
        {/* Language (Required) */}
        <div className="prof-row">
          <div style={{ minWidth: 0 }}>
            <b>Language</b>
            <span>{profile.langLabel}</span>
          </div>
          <span className="req">Required</span>
        </div>

        {/* Age band (Required) */}
        <div className="prof-row">
          <div style={{ minWidth: 0 }}>
            <b>Age band</b>
            <span>{profile.band}</span>
          </div>
          <span className="req">Required</span>
        </div>

        {/* Country & City (Required) */}
        <div className="prof-row">
          <div style={{ minWidth: 0 }}>
            <b>Country</b>
            <span>{profile.country}{profile.city ? ` · ${profile.city}` : ''}</span>
          </div>
          <span className="req">Required</span>
        </div>

        {/* Main goal (Required with Select) */}
        <div className="prof-row">
          <div style={{ minWidth: 0 }}>
            <b>Main goal</b>
            <select
              id="goal-sel"
              aria-label="Main goal"
              value={profile.goal}
              onChange={(e) => handleGoalChange(e.target.value)}
              style={{ marginTop: '2px' }}
            >
              {Object.entries(GOALS).map(([g, gl]) => (
                <option key={g} value={g}>{gl}</option>
              ))}
            </select>
          </div>
          <span className="req">Required</span>
        </div>

        {/* Granular Toggable Rows */}
        {TOGGLE_FIELDS.map(({ key, label, value, sensitive }) => {
          const isChecked = profile.guidanceSwitches[key] ?? true;
          return (
            <div key={key} className={`prof-row ${!isChecked ? 'off' : ''}`}>
              <div style={{ minWidth: 0 }}>
                <b>{label}{sensitive ? ' · only if you choose' : ''}</b>
                <span>{value || 'Not shared'}</span>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggleSwitch(key)}
                  aria-label={`Use ${label} for guidance`}
                />
                <i />
              </label>
            </div>
          );
        })}
      </div>

      {/* Who Sees What Card (Screen 34) */}
      <div className="card">
        <p className="eyebrow">WHO SEES WHAT</p>
        <p style={{ fontSize: '13.5px', marginTop: '6px' }}>
          <b>You:</b> everything.
        </p>
        <p style={{ fontSize: '13.5px', marginTop: '4px' }}>
          <b>Your employer:</b> anonymised group trends only, never your words, check-ins or scores.
        </p>
        <p style={{ fontSize: '13.5px', marginTop: '4px' }}>
          <b>Shared spaces:</b> only what you share there.
        </p>
      </div>

      {/* Spaces Card (Screen 34) */}
      <div className="card">
        <p className="eyebrow">SPACES</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          <div className="row between">
            <div>
              <b style={{ fontSize: '14px' }}>Personal</b>
              <p className="note">Just you</p>
            </div>
            <span className="tag">On</span>
          </div>
          <div className="row between">
            <div>
              <b style={{ fontSize: '14px' }}>Couple</b>
              <p className="note">Weekly check-in for two</p>
            </div>
            <span className="tag">Invite</span>
          </div>
          <div className="row between">
            <div>
              <b style={{ fontSize: '14px' }}>Family</b>
              <p className="note">Family meetings and care plans</p>
            </div>
            <span className="tag">Invite</span>
          </div>
          <div className="row between">
            <div>
              <b style={{ fontSize: '14px' }}>Team</b>
              <p className="note">Rituals and anonymous mood pulse</p>
            </div>
            <span className="tag">Invite</span>
          </div>
        </div>
      </div>

      {/* Data Export & Voucher (Collapsible) */}
      <div className="card soft">
        <div className="row between">
          <div>
            <b style={{ fontSize: '13.5px' }}>Your Data Sovereignty</b>
            <p className="note">Export your raw profile and check-in history anytime.</p>
          </div>
          <button onClick={handleExportData} className="btn small">
            Export JSON
          </button>
        </div>
      </div>

      {/* Creator & Facilitator Studio (Only shown to users with Admin privileges) */}
      {isAdmin && (
        <div className="card soft" style={{ border: '1px dashed var(--accent)', marginTop: '4px' }}>
          <div className="row between">
            <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
              <span className="eyebrow" style={{ color: 'var(--accent)' }}>CREATOR ENGINE</span>
              <h4 style={{ fontSize: '15px', marginTop: '2px' }}>EQ OS Admin Studio</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--muted)', marginTop: '2px' }}>
                Create new reflection tools, custom programs, and register videos.
              </p>
            </div>
            <a
              href="/admin"
              className="btn small primary"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', flex: 'none' }}
            >
              Studio →
            </a>
          </div>
        </div>
      )}

      {/* Enterprise Voucher */}
      <div className="card">
        <p className="eyebrow">PROGRAM ACCESS</p>
        <h4 style={{ fontSize: '15px' }}>Redeem Program Voucher</h4>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>
          Enter the code from drishtavidya.com or your employer:
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <input
            type="text"
            placeholder="e.g. DV-EQUIP-8492"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--line)',
              background: 'var(--surface)',
              color: 'var(--ink)',
              textTransform: 'uppercase',
              fontSize: '13.5px'
            }}
          />
          <button className="btn primary small" onClick={handleRedeemVoucher}>
            Redeem
          </button>
        </div>
        {voucherSuccess && (
          <p style={{ fontSize: '12.5px', color: 'var(--accent)', fontWeight: 600, marginTop: '6px' }}>
            ✓ Program Unlocked: EQUIP Executive EQ
          </p>
        )}
        {voucherError && (
          <p style={{ fontSize: '12.5px', color: 'var(--crit)', marginTop: '6px' }}>
            {voucherError}
          </p>
        )}
      </div>

      {/* Account Session & Sign Out */}
      <div className="card soft" style={{ marginTop: '4px' }}>
        <div className="row between">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <b style={{ fontSize: '13.5px' }}>Signed in as {profile.name}</b>
              {isAdmin && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#ea580c',
                  color: '#ffffff',
                  letterSpacing: '0.04em'
                }}>
                  ADMIN
                </span>
              )}
            </div>
            <p className="note">{profile.email || 'Active local session'}</p>
          </div>
          {onSignOut && (
            <button
              onClick={onSignOut}
              className="btn small"
              style={{ color: 'var(--crit)', borderColor: 'var(--crit-soft)' }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        profile={profile}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onUpdateProfile}
      />
    </div>
  );
};
