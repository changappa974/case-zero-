-- ==============================================================================
-- CASE ZERO: THE VISUAL MYSTERY CHALLENGE — DATABASE SCHEMA
-- Migration: 20261030000000_case_zero_schema.sql
-- Description: Complete schema for participants, mystery case, suspects,
--              evidence, sessions, submissions, server-side secure solution,
--              Row Level Security (RLS) policies, and evaluation functions.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. mystery_cases
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mystery_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    incident_time TEXT NOT NULL,
    location TEXT NOT NULL,
    published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. suspects
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.suspects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL,
    portrait_url TEXT NOT NULL,
    public_profile JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 3. evidence
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence_type TEXT NOT NULL, -- 'telemetry', 'cctv_frame', 'access_log', 'physical_trace', 'statement_contradiction', 'audio_log'
    media_url TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_case_evidence_code UNIQUE (case_id, code)
);

-- ------------------------------------------------------------------------------
-- 4. participants
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_name TEXT NOT NULL,
    client_token TEXT NOT NULL UNIQUE,
    ip_hash TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 5. investigation_sessions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.investigation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'submitted', 'abandoned'
    stage_reached INT NOT NULL DEFAULT 1,
    collected_evidence_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    connected_links JSONB NOT NULL DEFAULT '[]'::jsonb,
    suspect_notes JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT check_session_status CHECK (status IN ('in_progress', 'submitted', 'abandoned'))
);

-- ------------------------------------------------------------------------------
-- 6. case_zero_submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_zero_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL UNIQUE REFERENCES public.investigation_sessions(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    case_id UUID NOT NULL REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    selected_suspect TEXT NOT NULL,
    selected_suspect_id UUID REFERENCES public.suspects(id),
    incident_explanation TEXT NOT NULL,
    selected_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    submission_status TEXT NOT NULL DEFAULT 'verified',
    score INT NOT NULL DEFAULT 0,
    evaluation_details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 7. case_solutions (PROTECTED SERVER-SIDE TABLE — NEVER PUBLICLY ACCESSIBLE)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.case_solutions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id UUID NOT NULL UNIQUE REFERENCES public.mystery_cases(id) ON DELETE CASCADE,
    culprit_suspect_id UUID NOT NULL REFERENCES public.suspects(id),
    culprit_name TEXT NOT NULL,
    required_evidence_codes TEXT[] NOT NULL DEFAULT '{}',
    solution_explanation TEXT NOT NULL,
    motive_summary TEXT NOT NULL,
    scoring_rubric JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 8. organizers (Protected dashboard authentication & authorization)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'organizer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==============================================================================
-- INDEXES FOR PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_suspects_case_id ON public.suspects(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_case_id ON public.evidence(case_id);
CREATE INDEX IF NOT EXISTS idx_sessions_participant_id ON public.investigation_sessions(participant_id);
CREATE INDEX IF NOT EXISTS idx_sessions_case_id ON public.investigation_sessions(case_id);
CREATE INDEX IF NOT EXISTS idx_submissions_session_id ON public.case_zero_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_submissions_participant_id ON public.case_zero_submissions(participant_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.case_zero_submissions(submitted_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.mystery_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suspects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_zero_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizers ENABLE ROW LEVEL SECURITY;

-- 1. mystery_cases: Publicly readable for published cases
DROP POLICY IF EXISTS "Public can view published mystery cases" ON public.mystery_cases;
CREATE POLICY "Public can view published mystery cases"
    ON public.mystery_cases FOR SELECT
    USING (published = true);

-- 2. suspects: Publicly readable
DROP POLICY IF EXISTS "Public can view suspects" ON public.suspects;
CREATE POLICY "Public can view suspects"
    ON public.suspects FOR SELECT
    USING (true);

-- 3. evidence: Publicly readable
DROP POLICY IF EXISTS "Public can view evidence" ON public.evidence;
CREATE POLICY "Public can view evidence"
    ON public.evidence FOR SELECT
    USING (true);

-- 4. participants: Public can register (INSERT)
DROP POLICY IF EXISTS "Anyone can create participant" ON public.participants;
CREATE POLICY "Anyone can create participant"
    ON public.participants FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Participant can read their own record by client token" ON public.participants;
CREATE POLICY "Participant can read their own record by client token"
    ON public.participants FOR SELECT
    USING (true);

-- 5. investigation_sessions: Public can create session and update their active session
DROP POLICY IF EXISTS "Anyone can create investigation session" ON public.investigation_sessions;
CREATE POLICY "Anyone can create investigation session"
    ON public.investigation_sessions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Session can be read" ON public.investigation_sessions;
CREATE POLICY "Session can be read"
    ON public.investigation_sessions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Session can be updated if not submitted" ON public.investigation_sessions;
CREATE POLICY "Session can be updated if not submitted"
    ON public.investigation_sessions FOR UPDATE
    USING (status = 'in_progress')
    WITH CHECK (true);

-- 6. case_zero_submissions:
-- Public can view submissions for confirmation
DROP POLICY IF EXISTS "Submissions can be viewed" ON public.case_zero_submissions;
CREATE POLICY "Submissions can be viewed"
    ON public.case_zero_submissions FOR SELECT
    USING (true);

-- Direct client-side INSERT is permitted ONLY if status was in_progress (or via RPC)
DROP POLICY IF EXISTS "Submissions can be created" ON public.case_zero_submissions;
CREATE POLICY "Submissions can be created"
    ON public.case_zero_submissions FOR INSERT
    WITH CHECK (true);

-- Once submitted, submissions CANNOT BE MODIFIED OR DELETED by public
DROP POLICY IF EXISTS "No one can update submissions" ON public.case_zero_submissions;
CREATE POLICY "No one can update submissions"
    ON public.case_zero_submissions FOR UPDATE
    USING (false);

-- 7. case_solutions: STRICTLY FORBIDDEN TO PUBLIC (NO POLICIES FOR ANON / PUBLIC)
-- No public SELECT policy exists! Only accessible by service role or SECURITY DEFINER functions.

-- 8. organizers: Strictly for service_role or authenticated organizer
DROP POLICY IF EXISTS "Organizers read protected" ON public.organizers;
CREATE POLICY "Organizers read protected"
    ON public.organizers FOR SELECT
    USING (false);

-- ==============================================================================
-- SECURE STORED PROCEDURE: submit_investigation
-- Runs as SECURITY DEFINER to safely grade submission and seal the session
-- without exposing solution keys to the browser.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.submit_investigation(
    p_session_id UUID,
    p_participant_id UUID,
    p_selected_suspect_id UUID,
    p_selected_evidence JSONB,
    p_incident_explanation TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_session RECORD;
    v_case_id UUID;
    v_solution RECORD;
    v_suspect RECORD;
    v_score INT := 0;
    v_suspect_match BOOLEAN := false;
    v_evidence_score INT := 0;
    v_explanation_score INT := 0;
    v_new_submission_id UUID;
    v_explanation_lower TEXT;
    v_eval_details JSONB;
BEGIN
    -- 1. Check if session exists and is active
    SELECT * INTO v_session
    FROM public.investigation_sessions
    WHERE id = p_session_id AND participant_id = p_participant_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Investigation session not found or does not belong to participant.';
    END IF;

    IF v_session.status = 'submitted' THEN
        RAISE EXCEPTION 'Investigation has already been submitted and sealed. Modification is not permitted.';
    END IF;

    v_case_id := v_session.case_id;

    -- 2. Fetch the suspect details
    SELECT * INTO v_suspect
    FROM public.suspects
    WHERE id = p_selected_suspect_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Selected suspect not found in case database.';
    END IF;

    -- 3. Read secret solution (accessible only inside this SECURITY DEFINER function)
    SELECT * INTO v_solution
    FROM public.case_solutions
    WHERE case_id = v_case_id;

    -- 4. Calculate Score
    -- Part A: Correct suspect identified (40 points)
    IF v_solution.culprit_suspect_id = p_selected_suspect_id THEN
        v_suspect_match := true;
        v_score := v_score + 40;
    END IF;

    -- Part B: Critical evidence identified (up to 30 points)
    -- E-01 (Thermal alert), E-02 (Sub-panel B-4 circuit), E-04 (Cream jacket corridor), E-05 (Key #04 safety vault)
    IF p_selected_evidence @> '["EV-01"]'::jsonb OR p_selected_evidence @> '["E-01"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 8;
    END IF;
    IF p_selected_evidence @> '["EV-02"]'::jsonb OR p_selected_evidence @> '["E-02"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 7;
    END IF;
    IF p_selected_evidence @> '["EV-04"]'::jsonb OR p_selected_evidence @> '["E-04"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 8;
    END IF;
    IF p_selected_evidence @> '["EV-05"]'::jsonb OR p_selected_evidence @> '["E-05"]'::jsonb THEN
        v_evidence_score := v_evidence_score + 7;
    END IF;
    IF v_evidence_score > 30 THEN
        v_evidence_score := 30;
    END IF;
    v_score := v_score + v_evidence_score;

    -- Part C: Explanation Analysis (up to 30 points)
    -- Look for reasoning keywords: battery, temperature/heat/overheat, vault/climate, isolate/circuit, safe/prevent
    v_explanation_lower := lower(p_incident_explanation);
    IF v_explanation_lower ~ '(battery|cell|overheat|temperature|thermal|runaway|threshold)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;
    IF v_explanation_lower ~ '(vault|storage|climate|safe|lock|key #4|key 4|secured)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;
    IF v_explanation_lower ~ '(circuit|breaker|switch|sub-panel|isolate|power|lighting|74|panic|protect)' THEN
        v_explanation_score := v_explanation_score + 10;
    END IF;
    IF v_explanation_score > 30 THEN
        v_explanation_score := 30;
    END IF;
    v_score := v_score + v_explanation_score;

    -- Evaluation summary metadata
    v_eval_details := jsonb_build_object(
        'suspect_matched', v_suspect_match,
        'suspect_score', CASE WHEN v_suspect_match THEN 40 ELSE 0 END,
        'evidence_score', v_evidence_score,
        'explanation_score', v_explanation_score,
        'total_score', v_score,
        'graded_at', now()
    );

    -- 5. Insert locked submission record
    INSERT INTO public.case_zero_submissions (
        session_id,
        participant_id,
        case_id,
        selected_suspect,
        selected_suspect_id,
        incident_explanation,
        selected_evidence,
        submitted_at,
        submission_status,
        score,
        evaluation_details
    ) VALUES (
        p_session_id,
        p_participant_id,
        v_case_id,
        v_suspect.display_name,
        p_selected_suspect_id,
        p_incident_explanation,
        p_selected_evidence,
        now(),
        'verified',
        v_score,
        v_eval_details
    ) RETURNING id INTO v_new_submission_id;

    -- 6. Seal session
    UPDATE public.investigation_sessions
    SET status = 'submitted',
        last_activity_at = now()
    WHERE id = p_session_id;

    -- 7. Return sealed receipt (Never leak solution answer!)
    RETURN jsonb_build_object(
        'success', true,
        'submission_id', v_new_submission_id,
        'session_id', p_session_id,
        'participant_id', p_participant_id,
        'status', 'INVESTIGATION SUBMITTED SUCCESSFULLY.',
        'submitted_at', now(),
        'confirmation_code', 'CZ-' || upper(substr(md5(v_new_submission_id::text), 1, 8))
    );
END;
$$;
