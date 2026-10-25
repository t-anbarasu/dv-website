-- ==============================================================================
-- EQ OS — Supabase Database Schema & Row-Level Security (RLS)
-- Target Region: South Asia (Mumbai) / ap-south-1
-- Standard: India DPDP Act 2025 Compliant (Isolated Owner RLS, Zero Personal Exposure)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. PERSONAL TABLES (STRICT RLS: auth.uid() = user_id)
-- ==============================================================================

-- User Profiles
CREATE TABLE IF NOT EXISTS profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ta')),
    age_band TEXT,
    country TEXT DEFAULT 'IN',
    goal TEXT,
    intent TEXT,
    path_id TEXT,
    path_day INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Granular Profile Fields (each can be switched off or deleted individually)
CREATE TABLE IF NOT EXISTS profile_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    field TEXT NOT NULL, -- 'household', 'children', 'caregiving', 'role', 'work_pattern', 'faith', 'gender'
    value TEXT NOT NULL,
    use_for_guidance BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, field)
);

-- Context Check (Direct vs Diplomatic per domain)
CREATE TABLE IF NOT EXISTS context_checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL CHECK (domain IN ('work', 'home')),
    style TEXT NOT NULL CHECK (style IN ('direct', 'diplomatic')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, domain)
);

-- Consent Audit Log (DPDP standard: purpose, granted, timestamp, withdrawal history)
CREATE TABLE IF NOT EXISTS consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    purpose TEXT NOT NULL, -- 'store_checkins', 'chat_history', 'anonymized_review', 'reminders'
    granted BOOLEAN NOT NULL DEFAULT FALSE,
    granted_at TIMESTAMPTZ,
    withdrawn_at TIMESTAMPTZ,
    notice_version TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Check-ins (Emotional weather reads from here)
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    word TEXT NOT NULL,
    family TEXT,
    intensity INT CHECK (intensity BETWEEN 1 AND 10),
    source TEXT NOT NULL, -- 'home', 'atlas', 'calm-reply', 'decode', 'ritual'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tool Runs (Step-by-step tools completion & ratings)
CREATE TABLE IF NOT EXISTS tool_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tool_id TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    saved_answers JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat Threads & Messages (Stored ONLY if user explicitly consented to chat history)
CREATE TABLE IF NOT EXISTS chat_threads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    tool_button_id TEXT,
    support_triggered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Moments I handled well
CREATE TABLE IF NOT EXISTS moments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- What Drishti Noticed (Weekly patterns generated from tool use)
CREATE TABLE IF NOT EXISTS patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    text TEXT NOT NULL,
    evidence JSONB NOT NULL, -- list of tool_run_ids and checkin_ids
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Capability Map (Self-view radar)
CREATE TABLE IF NOT EXISTS capability_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    value NUMERIC(3, 1) NOT NULL,
    source TEXT CHECK (source IN ('usage', 'self-check')),
    as_of TIMESTAMPTZ DEFAULT NOW()
);

-- Scheduled Reminders (at most one a day, neutral wording)
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT DEFAULT 'email' CHECK (channel = 'email'),
    time_local TIME NOT NULL,
    timezone TEXT DEFAULT 'Asia/Kolkata',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. CONTENT TABLES (PUBLIC READ-ONLY)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS tools (
    tool_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    engine TEXT NOT NULL, -- 'reflection', 'breathing', 'rehearsal', 'decision'
    phase TEXT NOT NULL,
    minutes INT DEFAULT 2,
    tags JSONB DEFAULT '{}',
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS tool_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tool_id TEXT REFERENCES tools(tool_id) ON DELETE CASCADE,
    language TEXT NOT NULL DEFAULT 'en',
    style TEXT NOT NULL CHECK (style IN ('direct', 'diplomatic')),
    body JSONB NOT NULL,
    version INT NOT NULL DEFAULT 1,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tool_id, language, style, version)
);

CREATE TABLE IF NOT EXISTS atlas_emotions (
    id TEXT PRIMARY KEY,
    family TEXT NOT NULL,
    intensity_rank INT NOT NULL,
    name TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    definition TEXT NOT NULL,
    body_signals TEXT NOT NULL,
    triggers TEXT NOT NULL,
    need TEXT NOT NULL,
    now_action TEXT NOT NULL,
    after_action TEXT NOT NULL,
    over_time TEXT NOT NULL,
    never_do TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
    program_id TEXT PRIMARY KEY, -- 'BASEQS', 'EQUIP', 'UPSHIFT'
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS program_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id TEXT REFERENCES programs(program_id) ON DELETE CASCADE,
    module_order INT NOT NULL,
    title TEXT NOT NULL,
    video_slot TEXT,
    tool_ids JSONB DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS helplines (
    country TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    numbers JSONB NOT NULL,
    hours TEXT NOT NULL,
    languages JSONB NOT NULL,
    url TEXT NOT NULL,
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 4. COMMERCE, ACCESS & VOUCHERS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS vouchers (
    code_hash TEXT PRIMARY KEY, -- SHA-256 of code
    program_id TEXT NOT NULL REFERENCES programs(program_id),
    organisation_id UUID,
    seats INT DEFAULT 1,
    redeemed_count INT DEFAULT 0,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS voucher_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    voucher_hash TEXT NOT NULL REFERENCES vouchers(code_hash),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    redeemed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(voucher_hash, user_id)
);

CREATE TABLE IF NOT EXISTS program_access (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    program_id TEXT NOT NULL REFERENCES programs(program_id),
    source TEXT NOT NULL CHECK (source IN ('voucher', 'free')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, program_id)
);

-- ==============================================================================
-- 5. SAFETY & AUDIT LOGS (Zero Personal Text)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS crisis_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    trigger TEXT NOT NULL, -- 'keyword', 'safety_check', 'classifier', 'button'
    follow_up_requested BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS follow_up_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    first_name TEXT,
    contact_method TEXT NOT NULL,
    preferred_time TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
    coach_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    task TEXT NOT NULL,
    date DATE DEFAULT CURRENT_DATE,
    calls INT DEFAULT 1,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    cost_usd NUMERIC(8, 5) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 6. ROW-LEVEL SECURITY POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile" ON profiles
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE profile_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own profile fields" ON profile_fields
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE context_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own context checks" ON context_checks
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own consents" ON consents
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own checkins" ON checkins
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE tool_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tool runs" ON tool_runs
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own threads" ON chat_threads
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own messages" ON chat_messages
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE moments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own moments" ON moments
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own patterns" ON patterns
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE capability_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own capability scores" ON capability_scores
    FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own reminders" ON reminders
    FOR ALL USING (auth.uid() = user_id);

ALTER TABLE program_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own program access" ON program_access
    FOR SELECT USING (auth.uid() = user_id);

-- Content tables read-only for authenticated and anon users
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tools" ON tools FOR SELECT USING (true);

ALTER TABLE tool_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read tool versions" ON tool_versions FOR SELECT USING (true);

ALTER TABLE atlas_emotions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read atlas emotions" ON atlas_emotions FOR SELECT USING (true);

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read programs" ON programs FOR SELECT USING (true);

ALTER TABLE program_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read program modules" ON program_modules FOR SELECT USING (true);

ALTER TABLE helplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read helplines" ON helplines FOR SELECT USING (true);
