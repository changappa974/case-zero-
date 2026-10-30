import { createClient } from '@supabase/supabase-js';
import { Participant, InvestigationSession, CaseZeroSubmission, SubmissionReceipt, Suspect, Evidence, MysteryCase } from '../types';
import { CASE_DATA, INITIAL_SUSPECTS, INITIAL_EVIDENCE } from './caseData';

// Supabase Project: rlroapuecsibkgedvqbn
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rlroapuecsibkgedvqbn.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscm9hcHVlY3NpYmtnZWR2cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjYyMDYsImV4cCI6MjEwODkwMjIwNn0.hWC-DrcrYIwknUuvAzmrdk5d6rRZapVoKkVY2TiXD1s';

// Always initialized Supabase Client connected to live database
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Browser session storage keys (used ONLY to preserve active participant login upon page refresh)
const SESSION_POINTER_KEY = 'cz_session_pointer';

// --------------------------------------------------------------------------
// 1. Participant Registration (Direct to Supabase)
// --------------------------------------------------------------------------
export async function registerParticipant(participantName: string): Promise<{ participant: Participant; session: InvestigationSession }> {
  const cleanName = participantName.trim();
  if (!cleanName) {
    throw new Error('Please enter your full name to begin the investigation.');
  }

  const clientToken = 'tok_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

  // 1. Insert participant directly into Supabase
  const { data: pData, error: pErr } = await supabase
    .from('participants')
    .insert({
      participant_name: cleanName,
      client_token: clientToken,
    })
    .select()
    .single();

  if (pErr) throw new Error('Supabase participant registration failed: ' + pErr.message);

  // 2. Insert investigation session directly into Supabase
  const { data: sData, error: sErr } = await supabase
    .from('investigation_sessions')
    .insert({
      participant_id: pData.id,
      case_id: CASE_DATA.id,
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
      status: 'in_progress',
      stage_reached: 1,
      collected_evidence_ids: [],
      connected_links: [],
      suspect_notes: {},
    })
    .select()
    .single();

  if (sErr) throw new Error('Supabase session initialization failed: ' + sErr.message);

  const participant: Participant = {
    id: pData.id,
    participant_name: pData.participant_name,
    client_token: pData.client_token,
    created_at: pData.created_at,
  };

  const session: InvestigationSession = {
    id: sData.id,
    participant_id: sData.participant_id,
    case_id: sData.case_id,
    started_at: sData.started_at,
    last_activity_at: sData.last_activity_at,
    status: sData.status,
    stage_reached: sData.stage_reached,
    collected_evidence_ids: sData.collected_evidence_ids || [],
    connected_links: sData.connected_links || [],
    suspect_notes: sData.suspect_notes || {},
  };

  // Save active login pointers to preserve session on refresh
  try {
    sessionStorage.setItem(SESSION_POINTER_KEY, JSON.stringify({
      participantId: participant.id,
      sessionId: session.id
    }));
  } catch (e) {}

  return { participant, session };
}

// --------------------------------------------------------------------------
// 2. Restore Active Session from Supabase
// --------------------------------------------------------------------------
export async function restoreActiveSession(): Promise<{ participant: Participant | null; session: InvestigationSession | null }> {
  try {
    const raw = sessionStorage.getItem(SESSION_POINTER_KEY);
    if (!raw) return { participant: null, session: null };
    const { participantId, sessionId } = JSON.parse(raw);

    // Fetch live session from Supabase
    const { data: sData, error: sErr } = await supabase
      .from('investigation_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sErr || !sData) return { participant: null, session: null };

    // Fetch live participant from Supabase
    const { data: pData, error: pErr } = await supabase
      .from('participants')
      .select('*')
      .eq('id', participantId)
      .single();

    if (pErr || !pData) return { participant: null, session: null };

    return {
      participant: {
        id: pData.id,
        participant_name: pData.participant_name,
        client_token: pData.client_token,
        created_at: pData.created_at,
      },
      session: {
        id: sData.id,
        participant_id: sData.participant_id,
        case_id: sData.case_id,
        started_at: sData.started_at,
        last_activity_at: sData.last_activity_at,
        status: sData.status,
        stage_reached: sData.stage_reached,
        collected_evidence_ids: sData.collected_evidence_ids || [],
        connected_links: sData.connected_links || [],
        suspect_notes: sData.suspect_notes || {},
      }
    };
  } catch (e) {
    return { participant: null, session: null };
  }
}

// --------------------------------------------------------------------------
// 3. Update Session Progress (Direct to Supabase)
// --------------------------------------------------------------------------
export async function updateSessionProgress(
  sessionId: string,
  updates: Partial<InvestigationSession>
): Promise<void> {
  try {
    await supabase
      .from('investigation_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('status', 'in_progress'); // Locked if already submitted
  } catch (e) {
    console.error('Failed to update session progress in Supabase:', e);
  }
}

// --------------------------------------------------------------------------
// 4. Submit Investigation (Calls Secure Server-Side Function on Supabase)
// --------------------------------------------------------------------------
export async function submitInvestigation(
  sessionId: string,
  participantId: string,
  selectedSuspectId: string,
  selectedEvidenceCodes: string[],
  incidentExplanation: string
): Promise<SubmissionReceipt> {
  const explanation = incidentExplanation.trim();
  if (explanation.length < 30) {
    throw new Error('Please provide a substantive explanation of what happened (minimum 30 characters).');
  }

  // Execute Supabase SECURITY DEFINER RPC
  const { data, error } = await supabase.rpc('submit_investigation', {
    p_session_id: sessionId,
    p_participant_id: participantId,
    p_selected_suspect_id: selectedSuspectId,
    p_selected_evidence: selectedEvidenceCodes,
    p_incident_explanation: explanation,
  });

  if (error) {
    throw new Error('Supabase submission failed: ' + error.message);
  }

  return data as SubmissionReceipt;
}

// --------------------------------------------------------------------------
// 5. Query Submissions Directly from Supabase (Organizer Console)
// --------------------------------------------------------------------------
export async function getOrganizerSubmissions(): Promise<CaseZeroSubmission[]> {
  const { data, error } = await supabase
    .from('case_zero_submissions')
    .select('*')
    .order('submitted_at', { ascending: false });

  if (error) {
    console.error('Error fetching submissions from Supabase:', error);
    return [];
  }

  return (data || []) as CaseZeroSubmission[];
}

// --------------------------------------------------------------------------
// 6. Query Live Case Data from Supabase
// --------------------------------------------------------------------------
export async function fetchLiveMysteryCase(): Promise<MysteryCase> {
  const { data, error } = await supabase
    .from('mystery_cases')
    .select('*')
    .eq('published', true)
    .single();

  if (error || !data) return CASE_DATA;
  return data as MysteryCase;
}

export async function fetchLiveSuspects(): Promise<Suspect[]> {
  const { data, error } = await supabase
    .from('suspects')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) return INITIAL_SUSPECTS;
  return data as Suspect[];
}

export async function fetchLiveEvidence(): Promise<Evidence[]> {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data || data.length === 0) return INITIAL_EVIDENCE;
  return data as Evidence[];
}
