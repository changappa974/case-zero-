import { describe, it, expect, beforeEach } from 'vitest';
import { registerParticipant, submitInvestigation, getOrganizerSubmissions, resetForNextParticipant } from '../lib/supabase';
import { CASE_DATA, INITIAL_SUSPECTS, INITIAL_EVIDENCE } from '../lib/caseData';

describe('CASE ZERO: Murder at Frostpeak Conservatory Workflow & Data Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies public case dataset does not leak the secret solution', () => {
    // Section 3 & 7 Security Requirement: Complete answer must never appear in public frontend objects
    expect((CASE_DATA as any).solution).toBeUndefined();
    expect((CASE_DATA as any).culprit).toBeUndefined();

    INITIAL_SUSPECTS.forEach((suspect) => {
      expect((suspect as any).isCulprit).toBeUndefined();
      expect((suspect as any).guilty).toBeUndefined();
    });

    INITIAL_EVIDENCE.forEach((evidence) => {
      expect((evidence as any).isIncriminating).toBeUndefined();
    });
  });

  it('registers participant and creates a unique active session in Frostpeak Conservatory case', async () => {
    const participantName = 'Alex Mercer';
    const { participant, session } = await registerParticipant(participantName);

    expect(participant.participant_name).toBe(participantName);
    expect(participant.id).toBeDefined();
    expect(participant.client_token).toBeDefined();

    expect(session.participant_id).toBe(participant.id);
    expect(session.case_id).toBe(CASE_DATA.id);
    expect(session.status).toBe('in_progress');
    expect(session.stage_reached).toBe(1);
  }, 15000);

  it('requires participant full name to register', async () => {
    await expect(registerParticipant('')).rejects.toThrow('Please enter your full name');
    await expect(registerParticipant('   ')).rejects.toThrow('Please enter your full name');
  });

  it('submits investigation for Dr. Evelyn Hayes, calculates score securely, and seals answers', async () => {
    const { participant, session } = await registerParticipant('Jordan Lee');

    // Dr. Evelyn Hayes ID
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');
    expect(evelyn).toBeDefined();

    const supportingEvidence = ['EV-01', 'EV-03', 'EV-04', 'EV-05'];
    const explanation =
      'Dr. Evelyn Hayes murdered Dr. Arthur Vance by poisoning his Earl Grey tea with toxic Midnight Orchid compound (Cyanocryptin) to conceal her research grant funding fraud. CCTV on CAM 3 and CAM 4 disproves her alibi, showing her walking down the corridor at 11:12 PM and returning at 11:18 PM with blue orchid cloth. A left-handed pollen smudge on the lab sink faucet and discarded glowing gloves in the bin confirm her direct guilt.';

    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      supportingEvidence,
      explanation
    );

    expect(receipt.success).toBe(true);
    expect(receipt.status).toBe('INVESTIGATION SUBMITTED SUCCESSFULLY.');
    expect(receipt.confirmation_code).toMatch(/^CZ-/);
    expect(receipt.submission_id).toBeDefined();

    // Verify stored submission in Supabase registry
    const submissions = await getOrganizerSubmissions();
    expect(submissions.length).toBeGreaterThanOrEqual(1);
    const saved = submissions.find((s) => s.session_id === session.id);
    expect(saved).toBeDefined();
    expect(saved!.selected_suspect).toBe('Dr. Evelyn Hayes');
    expect(saved!.score).toBeGreaterThanOrEqual(80); // Accused Evelyn (40), selected 4 critical clues (30), provided complete explanation (30)
    expect(saved!.submission_status).toBe('verified');
  }, 15000);

  it('rejects submissions with explanations that are too short', async () => {
    const { participant, session } = await registerParticipant('Sam Vance');
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    await expect(
      submitInvestigation(session.id, participant.id, evelyn!.id, ['EV-01'], 'Too short')
    ).rejects.toThrow('minimum 30 characters');
  }, 15000);

  it('safely auto-submits when 00:00 timer expires without losing partial work', async () => {
    const { participant, session } = await registerParticipant('Taylor Quick');
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    // Auto submit with partial short explanation
    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      ['EV-01', 'EV-03'],
      'Evelyn poisoned the tea',
      participant.participant_name,
      session.started_at,
      true // isAutoSubmit = true
    );

    expect(receipt.success).toBe(true);
    expect(receipt.confirmation_code).toBeDefined();
  }, 15000);

  it('resets local storage session pointer for next detective in shared lab PC', () => {
    sessionStorage.setItem('cz_session_pointer', '{"sessionId":"test","participantId":"test"}');
    localStorage.setItem('case_zero_timer_test', '12345');
    localStorage.setItem('case_zero_draft_test', '{"explanation":"draft"}');

    resetForNextParticipant();

    expect(sessionStorage.getItem('cz_session_pointer')).toBeNull();
    expect(localStorage.getItem('case_zero_timer_test')).toBeNull();
    expect(localStorage.getItem('case_zero_draft_test')).toBeNull();
  });

  it('records tab switches accurately in submission audit records', async () => {
    const { participant, session } = await registerParticipant('Morgan Lee');
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      ['EV-01', 'EV-03', 'EV-04'],
      'Dr. Evelyn Hayes poisoned the tea with cyanocryptin orchid toxin. CAM 3 and CAM 4 disprove her false alibi completely.',
      participant.participant_name,
      session.started_at,
      false,
      3 // 3 tab switches
    );

    expect(receipt.success).toBe(true);

    const submissions = await getOrganizerSubmissions();
    const saved = submissions.find((s) => s.session_id === session.id);
    expect(saved).toBeDefined();
    expect(saved!.evaluation_details?.tab_switches).toBe(3);
  }, 15000);
});
