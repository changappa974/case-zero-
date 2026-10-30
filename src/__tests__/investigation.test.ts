import { describe, it, expect, beforeEach } from 'vitest';
import { registerParticipant, submitInvestigation, getOrganizerSubmissions } from '../lib/supabase';
import { CASE_DATA, INITIAL_SUSPECTS, INITIAL_EVIDENCE } from '../lib/caseData';

describe('CASE ZERO Investigation Workflow & Data Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies public case dataset does not leak the secret solution', () => {
    // Section 6 Security Requirement: Complete answer must never appear in public frontend objects
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

  it('registers participant and creates a unique active session', async () => {
    const participantName = 'Alex Mercer';
    const { participant, session } = await registerParticipant(participantName);

    expect(participant.participant_name).toBe(participantName);
    expect(participant.id).toBeDefined();
    expect(participant.client_token).toBeDefined();

    expect(session.participant_id).toBe(participant.id);
    expect(session.case_id).toBe(CASE_DATA.id);
    expect(session.status).toBe('in_progress');
    expect(session.stage_reached).toBe(1);
  });

  it('requires participant full name to register', async () => {
    await expect(registerParticipant('')).rejects.toThrow('Please enter your full name');
    await expect(registerParticipant('   ')).rejects.toThrow('Please enter your full name');
  });

  it('submits investigation, calculates score securely, and locks answers', async () => {
    const { participant, session } = await registerParticipant('Jordan Lee');

    // Rhea Das ID
    const rhea = INITIAL_SUSPECTS.find((s) => s.display_name === 'Rhea Das');
    expect(rhea).toBeDefined();

    const supportingEvidence = ['EV-01', 'EV-02', 'EV-04', 'EV-05'];
    const explanation =
      'Rhea Das discovered the AURORA prototype battery temperature had spiked to 58.2°C, risking thermal runaway. She manually tripped Sub-Panel B-4 causing a 74-second blackout to safely isolate the circuit, used Key #04 to unlock the case, and moved it to the emergency climate safety vault to prevent panic.';

    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      rhea!.id,
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
    expect(saved!.selected_suspect).toBe('Rhea Das');
    expect(saved!.score).toBeGreaterThanOrEqual(80); // Accused Rhea, selected 4 critical clues, provided complete explanation
    expect(saved!.submission_status).toBe('verified');
  });

  it('rejects submissions with explanations that are too short', async () => {
    const { participant, session } = await registerParticipant('Sam Vance');
    const rhea = INITIAL_SUSPECTS.find((s) => s.display_name === 'Rhea Das');

    await expect(
      submitInvestigation(session.id, participant.id, rhea!.id, ['EV-01'], 'Too short')
    ).rejects.toThrow('minimum 30 characters');
  });
});
