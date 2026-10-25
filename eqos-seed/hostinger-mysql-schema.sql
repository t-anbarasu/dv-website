-- ==============================================================================
-- EQ OS — Hostinger MySQL Database Schema
-- Dedicated Database: e.g. u123456789_eqos
-- Storage Engine: InnoDB | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Compliant with: India DPDP Act 2025 & Auth.js / NextAuth Standards
-- ==============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ==============================================================================
-- 1. AUTHENTICATION & USER MANAGEMENT (Auth.js / NextAuth Standards)
-- ==============================================================================

-- Core Users Table (Google Sign-In & Magic Email Links)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    email_verified DATETIME,
    image VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OAuth Accounts (Google OAuth tokens)
CREATE TABLE IF NOT EXISTS accounts (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    provider_account_id VARCHAR(255) NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type VARCHAR(50),
    scope VARCHAR(255),
    id_token TEXT,
    session_state VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_provider_account (provider, provider_account_id),
    INDEX idx_accounts_user_id (user_id),
    CONSTRAINT fk_accounts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User Sessions
CREATE TABLE IF NOT EXISTS sessions (
    id VARCHAR(64) PRIMARY KEY,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    expires DATETIME NOT NULL,
    INDEX idx_sessions_user (user_id),
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Magic Link Verification Tokens
CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires DATETIME NOT NULL,
    PRIMARY KEY (identifier, token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 2. PERSONAL TABLES (Strictly isolated by user_id in API queries)
-- ==============================================================================

-- Extended User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id VARCHAR(64) PRIMARY KEY,
    display_name VARCHAR(255),
    language ENUM('en', 'ta') DEFAULT 'en',
    age_band VARCHAR(50),
    country VARCHAR(10) DEFAULT 'IN',
    goal TEXT,
    intent TEXT,
    path_id VARCHAR(100),
    path_day INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Granular Profile Fields (Toggable per field: role, work pattern, faith, etc.)
CREATE TABLE IF NOT EXISTS profile_fields (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    field VARCHAR(100) NOT NULL,
    value TEXT NOT NULL,
    use_for_guidance TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_field (user_id, field),
    INDEX idx_profile_fields_user (user_id),
    CONSTRAINT fk_profile_fields_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Context Checks (Work vs Home -> Direct vs Diplomatic)
CREATE TABLE IF NOT EXISTS context_checks (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    domain ENUM('work', 'home') NOT NULL,
    style ENUM('direct', 'diplomatic') NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_domain (user_id, domain),
    INDEX idx_context_user (user_id),
    CONSTRAINT fk_context_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DPDP Consent Log (Granular opt-in history with timestamps)
CREATE TABLE IF NOT EXISTS consents (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    purpose VARCHAR(100) NOT NULL, -- 'store_checkins', 'chat_history', 'anonymized_review', 'reminders'
    granted TINYINT(1) DEFAULT 0,
    granted_at DATETIME NULL,
    withdrawn_at DATETIME NULL,
    notice_version VARCHAR(50) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_consents_user (user_id),
    CONSTRAINT fk_consents_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily Check-ins (Powers Emotional Weather Calendar)
CREATE TABLE IF NOT EXISTS checkins (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    word VARCHAR(100) NOT NULL,
    family VARCHAR(100),
    intensity TINYINT CHECK (intensity BETWEEN 1 AND 10),
    source VARCHAR(50) NOT NULL, -- 'home', 'atlas', 'calm-reply', 'decode', 'ritual'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_checkins_user (user_id),
    INDEX idx_checkins_created (user_id, created_at),
    CONSTRAINT fk_checkins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tool Runs (Completion records & rating)
CREATE TABLE IF NOT EXISTS tool_runs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    tool_id VARCHAR(100) NOT NULL,
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    rating TINYINT NULL CHECK (rating BETWEEN 1 AND 5),
    saved_answers JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tool_runs_user (user_id),
    CONSTRAINT fk_tool_runs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Drishti Chat Threads & Messages (Stored ONLY if user explicitly consented to chat history)
CREATE TABLE IF NOT EXISTS chat_threads (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    title VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_chat_threads_user (user_id),
    CONSTRAINT fk_chat_threads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(64) PRIMARY KEY,
    thread_id VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    role ENUM('user', 'assistant', 'system') NOT NULL,
    content TEXT NOT NULL,
    tool_button_id VARCHAR(100),
    support_triggered TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_chat_messages_thread (thread_id),
    INDEX idx_chat_messages_user (user_id),
    CONSTRAINT fk_chat_messages_thread FOREIGN KEY (thread_id) REFERENCES chat_threads(id) ON DELETE CASCADE,
    CONSTRAINT fk_chat_messages_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Moments I Handled Well Log
CREATE TABLE IF NOT EXISTS moments (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_moments_user (user_id),
    CONSTRAINT fk_moments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Weekly Patterns ("What Drishti Noticed")
CREATE TABLE IF NOT EXISTS patterns (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    week_start DATE NOT NULL,
    text TEXT NOT NULL,
    evidence JSON NOT NULL, -- Tool and checkin IDs linking evidence
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patterns_user (user_id),
    CONSTRAINT fk_patterns_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Capability Scores (Self-view radar)
CREATE TABLE IF NOT EXISTS capability_scores (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    domain VARCHAR(100) NOT NULL,
    value DECIMAL(3, 1) NOT NULL,
    source ENUM('usage', 'self-check') DEFAULT 'usage',
    as_of DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_capability_user (user_id),
    CONSTRAINT fk_capability_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Scheduled Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    channel VARCHAR(50) DEFAULT 'email',
    time_local TIME NOT NULL,
    timezone VARCHAR(100) DEFAULT 'Asia/Kolkata',
    active TINYINT(1) DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reminders_user (user_id),
    CONSTRAINT fk_reminders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 3. CONTENT TABLES (Shared, read-only to app users)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tools (
    tool_id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    engine VARCHAR(50) NOT NULL, -- 'reflection', 'breathing', 'rehearsal', 'planning'
    phase VARCHAR(50) NOT NULL,
    minutes INT DEFAULT 2,
    tags JSON,
    status VARCHAR(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tool_versions (
    id VARCHAR(64) PRIMARY KEY,
    tool_id VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    style ENUM('direct', 'diplomatic') NOT NULL,
    body JSON NOT NULL,
    version INT DEFAULT 1,
    reviewed_by VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_tool_version (tool_id, language, style, version),
    CONSTRAINT fk_tool_versions_tool FOREIGN KEY (tool_id) REFERENCES tools(tool_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS atlas_emotions (
    id VARCHAR(100) PRIMARY KEY,
    family VARCHAR(100) NOT NULL,
    intensity_rank INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    language VARCHAR(10) DEFAULT 'en',
    definition TEXT NOT NULL,
    body_signals TEXT NOT NULL,
    triggers TEXT NOT NULL,
    need TEXT NOT NULL,
    now_action TEXT NOT NULL,
    after_action TEXT NOT NULL,
    over_time TEXT NOT NULL,
    never_do TEXT NOT NULL,
    INDEX idx_atlas_family (family)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programs (
    program_id VARCHAR(50) PRIMARY KEY, -- 'BASEQS', 'EQUIP', 'UPSHIFT'
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS program_modules (
    id VARCHAR(64) PRIMARY KEY,
    program_id VARCHAR(50) NOT NULL,
    module_order INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    video_slot VARCHAR(255),
    tool_ids JSON,
    CONSTRAINT fk_modules_program FOREIGN KEY (program_id) REFERENCES programs(program_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS helplines (
    country VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    numbers JSON NOT NULL,
    hours VARCHAR(100) NOT NULL,
    languages JSON NOT NULL,
    url VARCHAR(500) NOT NULL,
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 4. COMMERCE, ACCESS & VOUCHERS (The Employer Privacy Firewall)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS vouchers (
    code_hash VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of the voucher code
    program_id VARCHAR(50) NOT NULL,
    organisation_id VARCHAR(64) NULL,
    seats INT DEFAULT 1,
    redeemed_count INT DEFAULT 0,
    expires_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vouchers_program FOREIGN KEY (program_id) REFERENCES programs(program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id VARCHAR(64) PRIMARY KEY,
    voucher_hash VARCHAR(64) NOT NULL,
    user_id VARCHAR(64) NOT NULL,
    redeemed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_redemption (voucher_hash, user_id),
    CONSTRAINT fk_redemptions_voucher FOREIGN KEY (voucher_hash) REFERENCES vouchers(code_hash),
    CONSTRAINT fk_redemptions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS program_access (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    program_id VARCHAR(50) NOT NULL,
    source ENUM('voucher', 'free') DEFAULT 'voucher',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_program_access (user_id, program_id),
    CONSTRAINT fk_access_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_access_program FOREIGN KEY (program_id) REFERENCES programs(program_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- 5. SAFETY & AUDIT LOGS (Zero Trigger Text Stored)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS crisis_events (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    trigger_type VARCHAR(50) NOT NULL, -- 'keyword', 'safety_check', 'classifier', 'button'
    follow_up_requested TINYINT(1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_crisis_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS follow_up_requests (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    first_name VARCHAR(100),
    contact_method VARCHAR(255) NOT NULL, -- User-provided email or phone
    preferred_time VARCHAR(100),
    status ENUM('pending', 'contacted', 'closed') DEFAULT 'pending',
    coach_id VARCHAR(64) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_followup_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_usage (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    task VARCHAR(100) NOT NULL,
    usage_date DATE DEFAULT (CURRENT_DATE),
    calls INT DEFAULT 1,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_usd DECIMAL(8, 5) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ai_usage_user (user_id),
    CONSTRAINT fk_usage_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
