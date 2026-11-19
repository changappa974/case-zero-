import { describe, it, expect, beforeEach } from 'vitest';
import { 
  registerParticipant, 
  submitInvestigation, 
  getOrganizerSubmissions, 
  fetchLeaderboardEntries,
  resetForNextParticipant,
  checkParticipantHasSubmitted,
  deleteParticipantSubmission,
  isStationLocked,
  unlockStation,
  STATION_LOCK_KEY
} from '../lib/supabase';
import { CASE_DATA, INITIAL_SUSPECTS, INITIAL_EVIDENCE } from '../lib/caseData';

function randomLetters(length = 8): string {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  return Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');
}

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
    const { participant, session } = await registerParticipant('Jordan Lee ' + randomLetters());

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
    const { participant, session } = await registerParticipant('Sam Vance ' + randomLetters());
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    await expect(
      submitInvestigation(session.id, participant.id, evelyn!.id, ['EV-01'], 'Too short')
    ).rejects.toThrow('minimum 30 characters');
  }, 15000);

  it('safely auto-submits when 00:00 timer expires without losing partial work', async () => {
    const { participant, session } = await registerParticipant('Taylor Quick ' + randomLetters());
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
    const { participant, session } = await registerParticipant('Morgan Lee ' + randomLetters());
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

  it('enforces Name Deduplication Check: blocks registration when participant has already submitted', async () => {
    const uniqueName = 'Robin Vance ' + randomLetters();
    const { participant, session } = await registerParticipant(uniqueName);
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    // Submit investigation for this participant
    await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      ['EV-01', 'EV-03', 'EV-04'],
      'Dr. Evelyn Hayes committed the murder by poisoning Dr. Vance with orchid toxin. Alibi on CAM 3 contradicts her statement.',
      participant.participant_name,
      session.started_at,
      false,
      0
    );

    // Verify deduplication check returns true
    const hasSubmitted = await checkParticipantHasSubmitted(uniqueName);
    expect(hasSubmitted).toBe(true);

    // Re-registration attempt with exact same name must throw exact error
    await expect(registerParticipant(uniqueName)).rejects.toThrow(
      'This participant has already submitted their Case Zero investigation. Retakes are not permitted.'
    );

    // Case-insensitive variation should also be blocked
    await expect(registerParticipant(uniqueName.toLowerCase())).rejects.toThrow(
      'This participant has already submitted their Case Zero investigation. Retakes are not permitted.'
    );
  }, 15000);

  it('enforces Browser / Device Lockdown: sets permanent lock flag upon submission and requires organizer passcode to unlock', async () => {
    expect(isStationLocked()).toBe(false);

    const { participant, session } = await registerParticipant('Lock Test User ' + randomLetters());
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      ['EV-01'],
      'Dr. Evelyn Hayes poisoned the tea with cyanocryptin orchid toxin. CAM 3 and CAM 4 disprove her false alibi completely.',
      participant.participant_name,
      session.started_at,
      false,
      0
    );

    // Station must be locked permanently on this device
    expect(isStationLocked()).toBe(true);
    expect(localStorage.getItem(STATION_LOCK_KEY)).toBe('true');

    // Invalid passcode cannot unlock
    const unlockFailed = unlockStation('wrongpass');
    expect(unlockFailed).toBe(false);
    expect(isStationLocked()).toBe(true);

    // Organizer master passcode unlocks and resets station
    const unlockSuccess = unlockStation('frostpeak2026');
    expect(unlockSuccess).toBe(true);
    expect(isStationLocked()).toBe(false);
    expect(localStorage.getItem(STATION_LOCK_KEY)).toBeNull();
  }, 15000);

  it('enforces 3-strike disqualification and tags submission on the Leaderboard with FLAGGED: EXTERNAL BROWSING DETECTED for judges', async () => {
    const studentName = 'Strike Disqualified User ' + randomLetters();
    const { participant, session } = await registerParticipant(studentName);
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes');

    // Strike 3 auto-submit with flag
    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      evelyn!.id,
      ['EV-01', 'EV-03'],
      'Partial deduction before 3 strikes',
      participant.participant_name,
      session.started_at,
      true, // isAutoSubmit
      3, // 3 tab switches
      true, // isFlagged
      'FLAGGED: EXTERNAL BROWSING DETECTED',
      3 // strikes
    );

    expect(receipt.success).toBe(true);

    // Verify stored submissions detail
    const submissions = await getOrganizerSubmissions();
    const saved = submissions.find((s) => s.session_id === session.id);
    expect(saved).toBeDefined();
    expect(saved!.evaluation_details?.flagged).toBe(true);
    expect(saved!.evaluation_details?.strikes).toBe(3);
    expect(saved!.evaluation_details?.flag_reason).toBe('FLAGGED: EXTERNAL BROWSING DETECTED');

    // Verify live Leaderboard reflects the flag
    const leaderboard = await fetchLeaderboardEntries();
    const entry = leaderboard.find((e) => e.participantName === studentName);
    expect(entry).toBeDefined();
    expect(entry!.flagged).toBe(true);
    expect(entry!.flagReason).toBe('FLAGGED: EXTERNAL BROWSING DETECTED');
    expect(entry!.strikes).toBe(3);
  }, 15000);

  it('enforces Name input rules: allows only letters and single spaces (e.g. admin a a) and strips/rejects numbers and symbols', async () => {
    // 1. Valid names with letters and single space: e.g. admin a a
    const validExample = 'admin a a ' + randomLetters();
    const { participant } = await registerParticipant(validExample);
    expect(participant.participant_name).toBe(validExample);

    // 2. Name with numbers and symbols: sanitized to letters only
    const rawWithSymbols = '  Detective #123 Alex @Mercer!  ';
    const { participant: pSanitized } = await registerParticipant(rawWithSymbols);
    expect(pSanitized.participant_name).toBe('Detective Alex Mercer');

    // 3. Name with only numbers/symbols is rejected
    await expect(registerParticipant('12345!@#$%')).rejects.toThrow('Please enter your full name');
    await expect(registerParticipant('   ')).rejects.toThrow('Please enter your full name');
  }, 15000);

  it('ranks leaderboard participants based on: 1. Murderer 2. Evidence 3. Text Rationale 4. Time Taken', async () => {
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes')!;
    const chefMarco = INITIAL_SUSPECTS.find((s) => s.display_name === 'Chef Marco')!;

    // Candidate 1: Correct murderer (Evelyn), full evidence (30 pts), full text, 300s
    const name1 = 'Alpha Detective ' + randomLetters();
    const { participant: p1, session: s1 } = await registerParticipant(name1);
    await submitInvestigation(
      s1.id,
      p1.id,
      evelyn.id,
      ['EV-01', 'EV-03', 'EV-04', 'EV-05'],
      'Dr. Evelyn poisoned the tea with blue orchid aconite and washed hands at the sink faucet. CCTV corridor alibi contradicted.',
      name1,
      new Date(Date.now() - 300000).toISOString()
    );

    // Candidate 2: Correct murderer (Evelyn), full evidence (30 pts), full text, 600s (tied on 1, 2, 3 but slower than Candidate 1)
    const name2 = 'Beta Detective ' + randomLetters();
    const { participant: p2, session: s2 } = await registerParticipant(name2);
    await submitInvestigation(
      s2.id,
      p2.id,
      evelyn.id,
      ['EV-01', 'EV-03', 'EV-04', 'EV-05'],
      'Dr. Evelyn poisoned the tea with blue orchid aconite and washed hands at the sink faucet. CCTV corridor alibi contradicted.',
      name2,
      new Date(Date.now() - 600000).toISOString()
    );

    // Candidate 3: Correct murderer (Evelyn), partial evidence (16 pts), full text, 100s (faster, but lower evidence)
    const name3 = 'Gamma Detective ' + randomLetters();
    const { participant: p3, session: s3 } = await registerParticipant(name3);
    await submitInvestigation(
      s3.id,
      p3.id,
      evelyn.id,
      ['EV-01', 'EV-03'],
      'Dr. Evelyn poisoned the tea with blue orchid aconite and washed hands at the sink faucet. CCTV corridor alibi contradicted.',
      name3,
      new Date(Date.now() - 100000).toISOString()
    );

    // Candidate 4: WRONG murderer (Chef Marco), full evidence (30 pts), full text, 50s (very fast, but failed murderer)
    const name4 = 'Delta Detective ' + randomLetters();
    const { participant: p4, session: s4 } = await registerParticipant(name4);
    await submitInvestigation(
      s4.id,
      p4.id,
      chefMarco.id,
      ['EV-01', 'EV-03', 'EV-04', 'EV-05'],
      'Chef Marco alibi contradicted by orchid pollen on tea cup.',
      name4,
      new Date(Date.now() - 50000).toISOString()
    );

    const leaderboard = await fetchLeaderboardEntries();
    const rank1 = leaderboard.find((e) => e.participantName === name1);
    const rank2 = leaderboard.find((e) => e.participantName === name2);
    const rank3 = leaderboard.find((e) => e.participantName === name3);
    const rank4 = leaderboard.find((e) => e.participantName === name4);

    expect(rank1).toBeDefined();
    expect(rank2).toBeDefined();
    expect(rank3).toBeDefined();
    expect(rank4).toBeDefined();

    // Candidate 1 (Evelyn, 3 ev, 30 text, 300s) should rank ABOVE Candidate 2 (Evelyn, 3 ev, 30 text, 600s) on Time Taken
    expect(rank1!.rank).toBeLessThan(rank2!.rank);

    // Candidate 2 (Evelyn, 3 ev) should rank ABOVE Candidate 3 (Evelyn, 2 ev) on Evidence
    expect(rank2!.rank).toBeLessThan(rank3!.rank);

    // Candidate 3 (Evelyn, murderer correct) should rank ABOVE Candidate 4 (Frank, murderer wrong) on Murderer
    expect(rank3!.rank).toBeLessThan(rank4!.rank);
  }, 25000);

  it('allows organizer to delete a participant who errored out on 3 tabs and re-register fresh with the same name', async () => {
    const studentName = 'Alex Reattempt ' + randomLetters();
    const evelyn = INITIAL_SUSPECTS.find((s) => s.display_name === 'Dr. Evelyn Hayes')!;

    // 1. Participant registers and errors out on 3 tab switches
    const { participant, session } = await registerParticipant(studentName);
    const receipt = await submitInvestigation(
      session.id,
      participant.id,
      evelyn.id,
      ['EV-01'],
      'Auto-submitted due to 3 external browsing tab switches',
      studentName,
      session.started_at,
      true, // isAutoSubmit
      3, // 3 tab switches
      true, // flagged
      'FLAGGED: EXTERNAL BROWSING DETECTED',
      3 // 3 strikes
    );

    expect(receipt.success).toBe(true);

    // 2. Name is now blocked from registering again
    const isBlocked = await checkParticipantHasSubmitted(studentName);
    expect(isBlocked).toBe(true);

    // Attempting to register again with same name fails
    await expect(registerParticipant(studentName)).rejects.toThrow('already submitted');

    // 3. Organizer deletes the participant from the Admin Leaderboard
    const leaderboard = await fetchLeaderboardEntries();
    const entry = leaderboard.find((e) => e.participantName === studentName);
    expect(entry).toBeDefined();

    const deleteSuccess = await deleteParticipantSubmission(
      entry!.id,
      entry!.participantName,
      entry!.participantId,
      entry!.sessionId
    );
    expect(deleteSuccess).toBe(true);

    // 4. Verify participant is removed from Leaderboard and deduplication check
    const updatedLeaderboard = await fetchLeaderboardEntries();
    const deletedEntry = updatedLeaderboard.find((e) => e.participantName === studentName);
    expect(deletedEntry).toBeUndefined();

    const isBlockedAfterDelete = await checkParticipantHasSubmitted(studentName);
    expect(isBlockedAfterDelete).toBe(false);

    // 5. Student re-registers fresh with the exact same name!
    const { participant: reParticipant, session: reSession } = await registerParticipant(studentName);
    expect(reParticipant).toBeDefined();
    expect(reParticipant.participant_name).toBe(studentName);
    expect(reSession.status).toBe('in_progress');
    expect(isStationLocked()).toBe(false);
  }, 25000);
});
