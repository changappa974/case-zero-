import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Stage0Registration } from './stages/Stage0Registration';
import { Stage1Story } from './stages/Stage1Story';
import { Stage2SceneInvestigation } from './stages/Stage2SceneInvestigation';
import { Stage3Suspects } from './stages/Stage3Suspects';
import { Stage4EvidenceBoard } from './stages/Stage4EvidenceBoard';
import { Stage5Submission } from './stages/Stage5Submission';
import { OrganizerDashboard } from './components/OrganizerDashboard';
import { InvestigationStage, Participant, InvestigationSession, SubmissionReceipt } from './types';
import { getSavedSession, updateSessionProgress } from './lib/supabase';
import { soundFX } from './lib/audioService';

export const App: React.FC = () => {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [session, setSession] = useState<InvestigationSession | null>(null);
  const [currentStage, setCurrentStage] = useState<InvestigationStage>(0);
  const [maxStageReached, setMaxStageReached] = useState<number>(1);
  const [collectedEvidence, setCollectedEvidence] = useState<string[]>([]);
  const [connectedLinks, setConnectedLinks] = useState<{ suspectId: string; evidenceCode: string; note?: string }[]>([]);
  const [suspectNotes, setSuspectNotes] = useState<Record<string, string>>({});
  const [submissionReceipt, setSubmissionReceipt] = useState<SubmissionReceipt | null>(null);
  
  // Organizer overlay modal
  const [showOrganizer, setShowOrganizer] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Restore session on mount
  useEffect(() => {
    const saved = getSavedSession();
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
    }
  }, []);

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

  return (
    <div className="min-h-screen bg-charcoal-950 text-gray-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Navigation Header */}
      <Navbar
        currentStage={currentStage}
        maxStageReached={maxStageReached}
        onNavigateStage={goToStage}
        participant={participant}
        session={session}
        onOpenOrganizer={() => setShowOrganizer(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Investigation Stage Views */}
      <main className="flex-1 pb-16">
        {currentStage === 0 && (
          <Stage0Registration onStart={handleStartInvestigation} />
        )}

        {currentStage === 1 && (
          <Stage1Story onProceed={() => goToStage(2)} />
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
          />
        )}
      </main>

      {/* Organizer Console Modal */}
      {showOrganizer && (
        <OrganizerDashboard onClose={() => setShowOrganizer(false)} />
      )}

      {/* Cinematic Footer */}
      <footer className="border-t border-charcoal-800/80 bg-charcoal-950 py-6 text-center text-xs font-mono text-gray-600">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CASE ZERO // THE VISUAL MYSTERY CHALLENGE</span>
          <span className="text-gray-500">
            MERIDIAN INNOVATION HALL SECURITY INCIDENT ARCHIVE
          </span>
          <span className="text-amber-500/80">
            “Every Detail Tells a Story. Can You Find the Truth?”
          </span>
        </div>
      </footer>

    </div>
  );
};
