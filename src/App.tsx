import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Stage0Registration } from './stages/Stage0Registration';
import { Stage1Story } from './stages/Stage1Story';
import { Stage2SceneInvestigation } from './stages/Stage2SceneInvestigation';
import { Stage3Suspects } from './stages/Stage3Suspects';
import { Stage4EvidenceBoard } from './stages/Stage4EvidenceBoard';
import { Stage5Submission } from './stages/Stage5Submission';
import { InvestigationStage, Participant, InvestigationSession, SubmissionReceipt } from './types';
import { restoreActiveSession, updateSessionProgress, submitInvestigation, resetForNextParticipant } from './lib/supabase';
import { soundFX } from './lib/audioService';
import { AdminLeaderboard } from './pages/AdminLeaderboard';
import { RotateCcw } from 'lucide-react';

export const App: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [session, setSession] = useState<InvestigationSession | null>(null);
  const [currentStage, setCurrentStage] = useState<InvestigationStage>(0);
  const [maxStageReached, setMaxStageReached] = useState<number>(1);
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);
  const [connectedLinks, setConnectedLinks] = useState<{ suspectId: string; evidenceCode: string; note?: string }[]>([]);
  const [suspectNotes, setSuspectNotes] = useState<Record<string, string>>({});
  const [submissionReceipt, setSubmissionReceipt] = useState<SubmissionReceipt | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // 15-Minute Timer & Auto-Submit States
  const [timeLeft, setTimeLeft] = useState<number>(900);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [draftSuspectId, setDraftSuspectId] = useState<string>('');
  const [draftEvidenceCodes, setDraftEvidenceCodes] = useState<string[]>([]);
  const [draftExplanation, setDraftExplanation] = useState<string>('');
  const autoSubmitTriggeredRef = useRef<boolean>(false);

  // Tab-Switch Monitoring
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);
  const tabWarningTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isAdminView, setIsAdminView] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    return (
      path.includes('admin') ||
      path.includes('leaderboard') ||
      hash.includes('admin') ||
      hash.includes('leaderboard')
    );
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      setIsAdminView(
        path.includes('admin') ||
        path.includes('leaderboard') ||
        hash.includes('admin') ||
        hash.includes('leaderboard')
      );
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Restore session from Supabase on mount
  useEffect(() => {
    restoreActiveSession().then((saved) => {
      if (saved.participant && saved.session) {
        setParticipant(saved.participant);
        setSession(saved.session);
        const stage = (saved.session.stage_reached as InvestigationStage) || 1;
        setCurrentStage(stage);
        setMaxStageReached(Math.max(stage, saved.session.stage_reached || 1));
        if (saved.session.collected_evidence_ids) {
          setCollectedEvidence(saved.session.collected_evidence_ids);
        }
        if (saved.session.connected_links) {
          setConnectedLinks(saved.session.connected_links);
        }
        if (saved.session.suspect_notes) {
          setSuspectNotes(saved.session.suspect_notes);
        }
        if (saved.session.status === 'submitted') {
          setCurrentStage(5);
          setMaxStageReached(5);
        }
        if (saved.participant) {
          try {
            const rawDraft = localStorage.getItem(`case_zero_draft_${saved.participant.id}`);
            if (rawDraft) {
              const parsed = JSON.parse(rawDraft);
              if (parsed.selectedSuspectId) setDraftSuspectId(parsed.selectedSuspectId);
              if (parsed.selectedEvidenceCodes) setDraftEvidenceCodes(parsed.selectedEvidenceCodes);
              if (parsed.explanation) setDraftExplanation(parsed.explanation);
            }
          } catch (e) {}
        }
      }
    });
  }, []);

  // 15-Minute Countdown Timer (900 seconds) & Auto-Submit on 00:00
  useEffect(() => {
    if (!participant || !session) return;
    if (session.status === 'submitted') {
      setTimeLeft(0);
      return;
    }

    const storageKey = `case_zero_timer_${participant.id}`;
    let startTime = localStorage.getItem(storageKey);
    if (!startTime) {
      startTime = session.started_at ? new Date(session.started_at).getTime().toString() : Date.now().toString();
      localStorage.setItem(storageKey, startTime);
    }

    const startMs = parseInt(startTime, 10) || Date.now();

    const checkTimer = () => {
      if (session.status === 'submitted') return;
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setTimeLeft(remaining);

      // Auto-Submit on 00:00: Automatically submit whatever they have answered so their work is never lost
      if (remaining === 0 && !autoSubmitTriggeredRef.current) {
        autoSubmitTriggeredRef.current = true;
        handleAutoSubmit();
      }
    };

    checkTimer();
    const interval = setInterval(checkTimer, 1000);
    return () => clearInterval(interval);
  }, [participant, session, draftSuspectId, draftEvidenceCodes, draftExplanation]);

  // Tab-Switch Monitoring & Alert Badge
  useEffect(() => {
    if (!participant || !session || session.status === 'submitted') return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // User switched back to Case Zero window
        setTabSwitchCount((prev) => {
          const next = prev + 1;
          setShowTabSwitchWarning(true);
          soundFX.playAlertBeep();

          if (tabWarningTimeoutRef.current) {
            clearTimeout(tabWarningTimeoutRef.current);
          }
          // Auto-fade warning alert after 6 seconds
          tabWarningTimeoutRef.current = setTimeout(() => {
            setShowTabSwitchWarning(false);
          }, 6000);

          return next;
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (tabWarningTimeoutRef.current) clearTimeout(tabWarningTimeoutRef.current);
    };
  }, [participant, session]);

  const handleAutoSubmit = async () => {
    if (!participant || !session || session.status === 'submitted') return;

    setIsAutoSubmitting(true);
    soundFX.playAlertBeep();

    // Check drafts from state or localStorage
    let suspectId = draftSuspectId;
    let evidenceCodes = draftEvidenceCodes;
    let explanation = draftExplanation;

    if (!suspectId || !explanation) {
      try {
        const raw = localStorage.getItem(`case_zero_draft_${participant.id}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (!suspectId && parsed.selectedSuspectId) suspectId = parsed.selectedSuspectId;
          if ((!evidenceCodes || evidenceCodes.length === 0) && parsed.selectedEvidenceCodes) {
            evidenceCodes = parsed.selectedEvidenceCodes;
          }
          if (!explanation && parsed.explanation) explanation = parsed.explanation;
        }
      } catch (e) {}
    }

    try {
      const receipt = await submitInvestigation(
        session.id,
        participant.id,
        suspectId,
        evidenceCodes,
        explanation,
        participant.participant_name,
        session.started_at,
        true, // isAutoSubmit = true
        tabSwitchCount
      );

      setSubmissionReceipt(receipt);
      setSession((prev) => (prev ? { ...prev, status: 'submitted' } : null));
      setCurrentStage(5);
      setMaxStageReached(5);
      soundFX.playClueFound();
    } catch (err) {
      console.error('Failed to auto-submit investigation:', err);
    } finally {
      setIsAutoSubmitting(false);
    }
  };

  const handleResetForNextDetective = () => {
    setIsResetting(true);
    soundFX.playCameraSwitch();

    setTimeout(() => {
      resetForNextParticipant();
      setParticipant(null);
      setSession(null);
      setCurrentStage(0);
      setMaxStageReached(1);
      setCollectedEvidence([]);
      setConnectedLinks([]);
      setSuspectNotes({});
      setSubmissionReceipt(null);
      setDraftSuspectId('');
      setDraftEvidenceCodes([]);
      setDraftExplanation('');
      setTimeLeft(900);
      setTabSwitchCount(0);
      setShowTabSwitchWarning(false);
      autoSubmitTriggeredRef.current = false;
      setIsResetting(false);
      soundFX.playClueFound();
    }, 1000);
  };

  // Update session stage helper
  const goToStage = (stage: InvestigationStage) => {
    setCurrentStage(stage);
    if (stage > maxStageReached) {
      setMaxStageReached(stage);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (session) {
      updateSessionProgress(session.id, {
        stage_reached: Math.max(stage, maxStageReached),
      });
    }
  };

  const handleStartInvestigation = (newParticipant: Participant, newSession: InvestigationSession) => {
    setParticipant(newParticipant);
    setSession(newSession);
    setCurrentStage(1);
    setMaxStageReached(1);
    setTimeLeft(900);
    setTabSwitchCount(0);
    setShowTabSwitchWarning(false);
    autoSubmitTriggeredRef.current = false;
    soundFX.startAmbientHum();
  };

  const handleCollectEvidence = (code: string) => {
    if (!collectedEvidence.includes(code)) {
      const updated = [...collectedEvidence, code];
      setCollectedEvidence(updated);
      if (session) {
        updateSessionProgress(session.id, {
          collected_evidence_ids: updated,
        });
      }
    }
  };

  const handleToggleLink = (suspectId: string, evidenceCode: string) => {
    const exists = connectedLinks.some(
      (l) => l.suspectId === suspectId && l.evidenceCode === evidenceCode
    );
    let updated;
    if (exists) {
      updated = connectedLinks.filter(
        (l) => !(l.suspectId === suspectId && l.evidenceCode === evidenceCode)
      );
    } else {
      updated = [...connectedLinks, { suspectId, evidenceCode }];
    }
    setConnectedLinks(updated);
    if (session) {
      updateSessionProgress(session.id, {
        connected_links: updated,
      });
    }
  };

  const handleSaveSuspectNote = (suspectId: string, note: string) => {
    const updated = { ...suspectNotes, [suspectId]: note };
    setSuspectNotes(updated);
    if (session) {
      updateSessionProgress(session.id, {
        suspect_notes: updated,
      });
    }
  };

  const handleSubmissionSuccess = (receipt: SubmissionReceipt) => {
    setSubmissionReceipt(receipt);
    if (session) {
      setSession({ ...session, status: 'submitted' });
    }
  };

  const handleToggleMute = () => {
    const muted = soundFX.toggleMute();
    setIsMuted(muted);
  };

  if (isAdminView) {
    return (
      <AdminLeaderboard
        onExit={() => {
          if (window.location.hash) {
            window.location.hash = '';
          }
          if (window.location.pathname !== '/') {
            window.history.pushState(null, '', '/');
          }
          setIsAdminView(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#ede7dc] text-[#1c1917] flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      
      {/* Navigation Header */}
      <Navbar
        currentStage={currentStage}
        maxStageReached={maxStageReached}
        onNavigateStage={goToStage}
        participant={participant}
        session={session}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        timeLeft={timeLeft}
        tabSwitchCount={tabSwitchCount}
      />

      {/* Friendly Tab-Switch Alert Banner */}
      {showTabSwitchWarning && (
        <div className="bg-amber-100 border-b border-amber-300 px-4 py-2.5 text-[#1c1917] font-mono text-xs flex items-center justify-between shadow-sm animate-fade-in sticky top-16 z-40">
          <div className="flex items-center space-x-2.5 max-w-7xl mx-auto w-full">
            <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-950 font-bold border border-amber-300 text-[10px] uppercase">
              ATTENTION
            </span>
            <span className="font-semibold text-stone-900">
              Stay in the Case Zero window during your investigation.
            </span>
            <span className="text-stone-600 text-[11px] hidden sm:inline">
              (Tab switch detected: #{tabSwitchCount})
            </span>
          </div>
          <button
            onClick={() => setShowTabSwitchWarning(false)}
            className="text-stone-600 hover:text-stone-900 font-bold px-2 py-0.5 rounded text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Investigation Stage Views */}
      <main className="flex-1 pb-16">
        {currentStage === 0 && (
          <Stage0Registration onStart={handleStartInvestigation} />
        )}

        {currentStage === 1 && (
          <Stage1Story
            onProceed={() => goToStage(2)}
            collectedEvidence={collectedEvidence}
            onCollectEvidence={handleCollectEvidence}
          />
        )}

        {currentStage === 2 && (
          <Stage2SceneInvestigation
            collectedEvidence={collectedEvidence}
            onCollectEvidence={handleCollectEvidence}
            onProceed={() => goToStage(3)}
          />
        )}

        {currentStage === 3 && (
          <Stage3Suspects
            suspectNotes={suspectNotes}
            onSaveSuspectNote={handleSaveSuspectNote}
            onProceed={() => goToStage(4)}
          />
        )}

        {currentStage === 4 && (
          <Stage4EvidenceBoard
            collectedEvidence={collectedEvidence}
            onCollectEvidence={handleCollectEvidence}
            connectedLinks={connectedLinks}
            onToggleLink={handleToggleLink}
            onProceed={() => goToStage(5)}
          />
        )}

        {currentStage === 5 && participant && session && (
          <Stage5Submission
            participant={participant}
            session={session}
            collectedEvidence={collectedEvidence}
            onSubmissionSuccess={handleSubmissionSuccess}
            existingReceipt={submissionReceipt}
            onResetForNext={handleResetForNextDetective}
            draftSuspectId={draftSuspectId}
            onDraftSuspectChange={setDraftSuspectId}
            draftEvidenceCodes={draftEvidenceCodes}
            onDraftEvidenceChange={setDraftEvidenceCodes}
            draftExplanation={draftExplanation}
            onDraftExplanationChange={setDraftExplanation}
            isAutoSubmitting={isAutoSubmitting}
            tabSwitchCount={tabSwitchCount}
          />
        )}
      </main>

      {/* 1-Second Lab PC Reset Transition Overlay */}
      {isResetting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-fade-in text-[#1c1917]">
          <div className="bg-[#f5f0e6] border-2 border-[#cfc7b7] rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-900 border border-blue-300 mx-auto flex items-center justify-center animate-spin">
              <RotateCcw className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-black text-xl text-[#1c1917]">
                RESETTING FOR NEXT DETECTIVE...
              </h3>
              <p className="text-xs text-stone-600 font-mono mt-1">
                Clearing active session caches in 1 second. Ready for the next participant!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Footer */}
      <footer className="border-t border-[#cfc7b7] bg-[#f5f0e6] py-6 text-center text-xs font-mono text-stone-600 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-bold text-stone-900">CASE ZERO // THE VISUAL MYSTERY CHALLENGE</span>
          <span className="text-gray-500">
            FROSTPEAK CONSERVATORY FORENSIC INCIDENT ARCHIVE
          </span>
          <span className="text-amber-700 font-semibold italic">
            “Every Detail Tells a Story. Can You Find the Truth?”
          </span>
        </div>
      </footer>

    </div>
  );
};
