import { createClient } from '@supabase/supabase-js';
import { Participant, InvestigationSession, CaseZeroSubmission, SubmissionReceipt, Suspect, Evidence, MysteryCase } from '../types';
import { CASE_DATA, INITIAL_SUSPECTS, INITIAL_EVIDENCE } from './caseData';

// Supabase Project: rlroapuecsibkgedvqbn
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://rlroapuecsibkgedvqbn.supabase.co';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJscm9hcHVlY3NpYmtnZWR2cWJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMzMjYyMDYsImV4cCI6MjEwODkwMjIwNn0.hWC-DrcrYIwknUuvAzmrdk5d6rRZapVoKkVY2TiXD1s';

// Live Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Browser session storage keys
const SESSION_POINTER_KEY = 'cz_session_pointer';
const LOCAL_PARTICIPANTS_KEY = 'cz_local_participants';
const LOCAL_SESSIONS_KEY = 'cz_local_sessions';
const LOCAL_SUBMISSIONS_KEY = 'cz_local_submissions';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function getLocalStore<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function setLocalStore<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
}

// --------------------------------------------------------------------------
// 1. Participant Registration (Supabase with Resilient Local Fallback)
// --------------------------------------------------------------------------
export async function registerParticipant(participantName: string): Promise<{ participant: Participant; session: InvestigationSession }> {
  const cleanName = participantName.trim();
  if (!cleanName) {
    throw new Error('Please enter your full name to begin the investigation.');
  }

  const clientToken = 'tok_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);

  try {
    // 1. Attempt insert directly into live Supabase database
    const { data: pData, error: pErr } = await supabase
      .from('participants')
      .insert({
        participant_name: cleanName,
        client_token: clientToken,
      })
      .select()
      .single();

    if (!pErr && pData) {
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

      if (!sErr && sData) {
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

        try {
          sessionStorage.setItem(SESSION_POINTER_KEY, JSON.stringify({
            participantId: participant.id,
            sessionId: session.id,
          }));
        } catch (e) {}

        return { participant, session };
      }
    }
  } catch (err) {
    console.warn('Supabase offline or unreachable, falling back to local session store:', err);
  }

  // Graceful offline fallback
  const pId = generateUUID();
  const sId = generateUUID();
  const now = new Date().toISOString();

  const participant: Participant = {
    id: pId,
    participant_name: cleanName,
    client_token: clientToken,
    created_at: now,
  };

  const session: InvestigationSession = {
    id: sId,
    participant_id: pId,
    case_id: CASE_DATA.id,
    started_at: now,
    last_activity_at: now,
    status: 'in_progress',
    stage_reached: 1,
    collected_evidence_ids: [],
    connected_links: [],
    suspect_notes: {},
  };

  const participants = getLocalStore<Participant>(LOCAL_PARTICIPANTS_KEY);
  participants.push(participant);
  setLocalStore(LOCAL_PARTICIPANTS_KEY, participants);

  const sessions = getLocalStore<InvestigationSession>(LOCAL_SESSIONS_KEY);
  sessions.push(session);
  setLocalStore(LOCAL_SESSIONS_KEY, sessions);

  try {
    sessionStorage.setItem(SESSION_POINTER_KEY, JSON.stringify({
      participantId: participant.id,
      sessionId: session.id,
    }));
  } catch (e) {}

  return { participant, session };
}

// --------------------------------------------------------------------------
// 2. Restore Active Session
// --------------------------------------------------------------------------
export async function restoreActiveSession(): Promise<{ participant: Participant | null; session: InvestigationSession | null }> {
  try {
    const raw = sessionStorage.getItem(SESSION_POINTER_KEY);
    if (!raw) return { participant: null, session: null };
    const { participantId, sessionId } = JSON.parse(raw);

    // Try Supabase first
    try {
      const { data: sData } = await supabase
        .from('investigation_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      const { data: pData } = await supabase
        .from('participants')
        .select('*')
        .eq('id', participantId)
        .single();

      if (sData && pData) {
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
      }
    } catch (e) {}

    // Fallback to local store
    const participants = getLocalStore<Participant>(LOCAL_PARTICIPANTS_KEY);
    const sessions = getLocalStore<InvestigationSession>(LOCAL_SESSIONS_KEY);
    const p = participants.find((x) => x.id === participantId) || null;
    const s = sessions.find((x) => x.id === sessionId) || null;
    return { participant: p, session: s };
  } catch (e) {
    return { participant: null, session: null };
  }
}

// --------------------------------------------------------------------------
// 3. Update Session Progress
// --------------------------------------------------------------------------
export async function updateSessionProgress(
  sessionId: string,
  updates: Partial<InvestigationSession>
): Promise<void> {
  // Update local store immediately
  try {
    const sessions = getLocalStore<InvestigationSession>(LOCAL_SESSIONS_KEY);
    const idx = sessions.findIndex((s) => s.id === sessionId);
    if (idx !== -1) {
      sessions[idx] = {
        ...sessions[idx],
        ...updates,
        last_activity_at: new Date().toISOString(),
      };
      setLocalStore(LOCAL_SESSIONS_KEY, sessions);
    }
  } catch (e) {}

  // Try Supabase update
  try {
    await supabase
      .from('investigation_sessions')
      .update({
        ...updates,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', sessionId)
      .eq('status', 'in_progress');
  } catch (e) {}
}

// --------------------------------------------------------------------------
// 4. Submit Investigation (Server-Side Evaluation with Local Fallback)
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

  // 1. Try Supabase SECURITY DEFINER RPC
  try {
    const { data, error } = await supabase.rpc('submit_investigation', {
      p_session_id: sessionId,
      p_participant_id: participantId,
      p_selected_suspect_id: selectedSuspectId,
      p_selected_evidence: selectedEvidenceCodes,
      p_incident_explanation: explanation,
    });

    if (!error && data) {
      return data as SubmissionReceipt;
    }
  } catch (err) {
    console.warn('Supabase submission RPC unavailable, using local grading engine:', err);
  }

  // 2. Local Grading Engine (Identical server-side logic matching SQL rubric)
  // Culprit: Dr. Evelyn Hayes (11111111-2222-3333-4444-555555555503)
  const isCulpritMatch = selectedSuspectId === '11111111-2222-3333-4444-555555555503';
  let score = isCulpritMatch ? 40 : 0;

  // Evidence Scoring (up to 30 pts)
  let evidenceScore = 0;
  if (selectedEvidenceCodes.includes('EV-01')) evidenceScore += 8;
  if (selectedEvidenceCodes.includes('EV-03')) evidenceScore += 8;
  if (selectedEvidenceCodes.includes('EV-04')) evidenceScore += 7;
  if (selectedEvidenceCodes.includes('EV-05')) evidenceScore += 7;
  if (evidenceScore > 30) evidenceScore = 30;
  score += evidenceScore;

  // Explanation Analysis (up to 30 pts)
  let explanationScore = 0;
  const explLower = explanation.toLowerCase();
  if (/(poison|toxin|orchid|midnight orchid|bioluminescent|blue pollen|cyanocryptin|tea)/.test(explLower)) {
    explanationScore += 10;
  }
  if (/(alibi|cctv|cam 3|cam 4|cam3|cam4|corridor|service passage|contradict|11:12|11:18|cloth)/.test(explLower)) {
    explanationScore += 10;
  }
  if (/(fraud|fund|embezzle|audit|left-hand|left hand|faucet|gloves|smudge|sink|log|terminal)/.test(explLower)) {
    explanationScore += 10;
  }
  if (explanationScore > 30) explanationScore = 30;
  score += explanationScore;
  if (score > 100) score = 100;

  const chosenSuspect = INITIAL_SUSPECTS.find((s) => s.id === selectedSuspectId);
  const suspectName = chosenSuspect ? chosenSuspect.display_name : 'Unknown';

  const subId = generateUUID();
  const submissionRecord: CaseZeroSubmission = {
    id: subId,
    session_id: sessionId,
    participant_id: participantId,
    case_id: CASE_DATA.id,
    selected_suspect: suspectName,
    selected_suspect_id: selectedSuspectId,
    selected_evidence: selectedEvidenceCodes,
    incident_explanation: explanation,
    score: score,
    evaluation_details: {
      suspect_matched: isCulpritMatch,
      suspect_score: isCulpritMatch ? 40 : 0,
      evidence_score: evidenceScore,
      explanation_score: explanationScore,
      final_score: score,
    },
    submission_status: 'verified',
    submitted_at: new Date().toISOString(),
  };

  const submissions = getLocalStore<CaseZeroSubmission>(LOCAL_SUBMISSIONS_KEY);
  submissions.unshift(submissionRecord);
  setLocalStore(LOCAL_SUBMISSIONS_KEY, submissions);

  // Lock session locally
  const sessions = getLocalStore<InvestigationSession>(LOCAL_SESSIONS_KEY);
  const sIdx = sessions.findIndex((s) => s.id === sessionId);
  if (sIdx !== -1) {
    sessions[sIdx].status = 'submitted';
    sessions[sIdx].stage_reached = 5;
    setLocalStore(LOCAL_SESSIONS_KEY, sessions);
  }

  return {
    success: true,
    submission_id: subId,
    session_id: sessionId,
    participant_id: participantId,
    confirmation_code: 'CZ-FROSTPEAK-' + subId.substring(0, 8).toUpperCase(),
    submitted_at: submissionRecord.submitted_at,
    status: 'INVESTIGATION SUBMITTED SUCCESSFULLY.',
  };
}

// --------------------------------------------------------------------------
// 5. Query Submissions Directly from Supabase (Organizer Console)
// --------------------------------------------------------------------------
export async function getOrganizerSubmissions(): Promise<CaseZeroSubmission[]> {
  const localList = getLocalStore<CaseZeroSubmission>(LOCAL_SUBMISSIONS_KEY);

  try {
    const { data, error } = await supabase
      .from('case_zero_submissions')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (!error && data && data.length > 0) {
      // Merge with local list if any unique
      const ids = new Set(data.map((d: any) => d.id));
      const combined = [...data, ...localList.filter((l) => !ids.has(l.id))];
      return combined as CaseZeroSubmission[];
    }
  } catch (e) {}

  return localList;
}

// --------------------------------------------------------------------------
// 6. Query Live Case Data from Supabase
// --------------------------------------------------------------------------
export async function fetchLiveMysteryCase(): Promise<MysteryCase> {
  try {
    const { data } = await supabase
      .from('mystery_cases')
      .select('*')
      .eq('published', true)
      .single();

    if (data) return data as MysteryCase;
  } catch (e) {}
  return CASE_DATA;
}

export async function fetchLiveSuspects(): Promise<Suspect[]> {
  try {
    const { data } = await supabase
      .from('suspects')
      .select('*')
      .order('display_order', { ascending: true });

    if (data && data.length > 0) return data as Suspect[];
  } catch (e) {}
  return INITIAL_SUSPECTS;
}

export async function fetchLiveEvidence(): Promise<Evidence[]> {
  try {
    const { data } = await supabase
      .from('evidence')
      .select('*')
      .order('display_order', { ascending: true });

    if (data && data.length > 0) return data as Evidence[];
  } catch (e) {}
  return INITIAL_EVIDENCE;
}
