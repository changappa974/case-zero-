import React, { useState } from 'react';
import { 
  Lock, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, 
  Send, Sparkles, Printer, User, FileText, CornerDownRight,
  RotateCcw, UserPlus, Clock, Download, Award
} from 'lucide-react';
import { INITIAL_SUSPECTS, INITIAL_EVIDENCE } from '../lib/caseData';
import { Participant, InvestigationSession, SubmissionReceipt } from '../types';
import { submitInvestigation } from '../lib/supabase';
import { downloadCertifiedCard } from '../lib/certificateGenerator';
import { soundFX } from '../lib/audioService';
import confetti from 'canvas-confetti';

interface Stage5SubmissionProps {
  participant: Participant;
  session: InvestigationSession;
  collectedEvidence: string[];
  initialSuspectId?: string;
  onSubmissionSuccess: (receipt: SubmissionReceipt) => void;
  existingReceipt?: SubmissionReceipt | null;
  onResetForNext?: () => void;
  draftSuspectId?: string;
  onDraftSuspectChange?: (id: string) => void;
  draftEvidenceCodes?: string[];
  onDraftEvidenceChange?: (codes: string[]) => void;
  draftExplanation?: string;
  onDraftExplanationChange?: (text: string) => void;
  isAutoSubmitting?: boolean;
  tabSwitchCount?: number;
}

export const Stage5Submission: React.FC<Stage5SubmissionProps> = ({
  participant,
  session,
  collectedEvidence,
  initialSuspectId,
  onSubmissionSuccess,
  existingReceipt,
  onResetForNext,
  draftSuspectId,
  onDraftSuspectChange,
  draftEvidenceCodes,
  onDraftEvidenceChange,
  draftExplanation,
  onDraftExplanationChange,
  isAutoSubmitting = false,
  tabSwitchCount = 0,
}) => {
  // Initialize with drafted values or saved localStorage
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(() => {
    if (draftSuspectId) return draftSuspectId;
    if (initialSuspectId) return initialSuspectId;
    try {
      const raw = localStorage.getItem(`case_zero_draft_${participant.id}`);
      if (raw) return JSON.parse(raw).selectedSuspectId || '';
    } catch (e) {}
    return '';
  });

  const [selectedEvidenceCodes, setSelectedEvidenceCodes] = useState<string[]>(() => {
    if (draftEvidenceCodes && draftEvidenceCodes.length > 0) return draftEvidenceCodes;
    try {
      const raw = localStorage.getItem(`case_zero_draft_${participant.id}`);
      if (raw && JSON.parse(raw).selectedEvidenceCodes?.length) {
        return JSON.parse(raw).selectedEvidenceCodes;
      }
    } catch (e) {}
    return collectedEvidence.length > 0 ? collectedEvidence : ['EV-01', 'EV-04'];
  });

  const [explanation, setExplanation] = useState<string>(() => {
    if (draftExplanation) return draftExplanation;
    try {
      const raw = localStorage.getItem(`case_zero_draft_${participant.id}`);
      if (raw) return JSON.parse(raw).explanation || '';
    } catch (e) {}
    return '';
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showPasteWarning, setShowPasteWarning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(existingReceipt || null);

  const isLocked = session.status === 'submitted' || Boolean(receipt);

  // Copy-Paste and Drag-and-Drop Blocking on Deduction Textarea
  const handlePasteBlocked = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    soundFX.playAlertBeep();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 5000);
  };

  const handleDropBlocked = (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    soundFX.playAlertBeep();
    setShowPasteWarning(true);
    setTimeout(() => setShowPasteWarning(false), 5000);
  };

  // Sync draft changes to parent state and localStorage
  const handleSuspectSelect = (id: string) => {
    if (isLocked) return;
    soundFX.playCameraSwitch();
    setSelectedSuspectId(id);
    if (onDraftSuspectChange) onDraftSuspectChange(id);
    try {
      const draft = { selectedSuspectId: id, selectedEvidenceCodes, explanation };
      localStorage.setItem(`case_zero_draft_${participant.id}`, JSON.stringify(draft));
    } catch (e) {}
  };

  const toggleEvidence = (code: string) => {
    if (isLocked) return;
    soundFX.playCameraSwitch();
    let updated: string[];
    if (selectedEvidenceCodes.includes(code)) {
      updated = selectedEvidenceCodes.filter((c) => c !== code);
    } else {
      updated = [...selectedEvidenceCodes, code];
    }
    setSelectedEvidenceCodes(updated);
    if (onDraftEvidenceChange) onDraftEvidenceChange(updated);
    try {
      const draft = { selectedSuspectId, selectedEvidenceCodes: updated, explanation };
      localStorage.setItem(`case_zero_draft_${participant.id}`, JSON.stringify(draft));
    } catch (e) {}
  };

  const handleExplanationChange = (text: string) => {
    if (isLocked) return;
    setExplanation(text);
    if (onDraftExplanationChange) onDraftExplanationChange(text);
    try {
      const draft = { selectedSuspectId, selectedEvidenceCodes, explanation: text };
      localStorage.setItem(`case_zero_draft_${participant.id}`, JSON.stringify(draft));
    } catch (e) {}
  };

  const handleSubmit = async () => {
    if (!selectedSuspectId) {
      setErrorMsg('Please select the individual you believe is responsible for the incident.');
      soundFX.playAlertBeep();
      return;
    }
    if (selectedEvidenceCodes.length === 0) {
      setErrorMsg('Please select at least one supporting piece of evidence.');
      soundFX.playAlertBeep();
      return;
    }
    if (explanation.trim().length < 30) {
      setErrorMsg('Please provide a substantive explanation of how it happened (at least 30 characters).');
      soundFX.playAlertBeep();
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    setShowConfirmModal(false);
    soundFX.playCameraSwitch();

    try {
      const result = await submitInvestigation(
        session.id,
        participant.id,
        selectedSuspectId,
        selectedEvidenceCodes,
        explanation,
        participant.participant_name,
        session.started_at,
        false, // isAutoSubmit
        tabSwitchCount
      );

      setReceipt(result);
      onSubmissionSuccess(result);
      soundFX.playClueFound();

      // Trigger celebratory forensic confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1d4ed8', '#b45309', '#15803d'],
        });
      } catch (e) {}

    } catch (err: any) {
      setErrorMsg(err.message || 'Submission failed. Please check network connection.');
      soundFX.playAlertBeep();
    } finally {
      setIsSubmitting(false);
    }
  };

  // If already submitted and locked, display the Sealed Receipt screen!
  if (isLocked) {
    const chosenSuspect = INITIAL_SUSPECTS.find((s) => s.id === selectedSuspectId);

    const startMs = session.started_at ? new Date(session.started_at).getTime() : Date.now();
    const endMs = receipt?.submitted_at ? new Date(receipt.submitted_at).getTime() : Date.now();
    const durationSeconds = Math.max(1, Math.floor((endMs - startMs) / 1000));
    const mins = Math.floor(durationSeconds / 60);
    const secs = durationSeconds % 60;
    const timeTakenFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;
    const filingDate = new Date(receipt?.submitted_at || Date.now()).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const confirmationCode = receipt?.confirmation_code || 'CZ-' + session.id.substring(0, 8).toUpperCase();

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
        
        {/* Big Status Banner */}
        <div className="p-8 rounded-2xl bg-[#f5f0e6] border-2 border-emerald-600 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-800 mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-900 font-bold bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
              OFFICIAL VERIFICATION CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-display text-[#1c1917] tracking-tight pt-2">
              INVESTIGATION SUBMITTED SUCCESSFULLY.
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 font-mono">
              Your findings have been permanently encrypted and sealed in the database.
            </p>
          </div>

          {/* Sealed Confirmation Code Box */}
          <div className="inline-block p-4 rounded-xl bg-[#e6dfd2] border-2 border-[#cfc7b7] font-mono text-center shadow-sm">
            <span className="text-[11px] text-stone-600 font-bold block mb-1">OFFICIAL CASE REFERENCE CODE</span>
            <span className="text-xl sm:text-2xl font-black text-blue-950 tracking-widest">
              {confirmationCode}
            </span>
          </div>
        </div>

        {/* STYLISH GRAPHIC CARD // CASE ZERO CERTIFIED */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5 text-amber-600" />
              <h2 className="text-lg font-black font-display text-[#1c1917] uppercase tracking-wide">
                OFFICIAL DETECTIVE CERTIFICATE & CARD
              </h2>
            </div>
            <span className="text-[11px] font-mono text-stone-600 font-semibold">
              Projector & Print Ready • Ready for Instant Download
            </span>
          </div>

          {/* The Visual Graphic Card Container */}
          <div className="relative rounded-3xl bg-gradient-to-br from-[#0a0d14] via-[#0f172a] to-[#050811] border-2 border-amber-500/80 p-6 sm:p-10 shadow-2xl text-white overflow-hidden font-sans">
            
            {/* Subtle Guilloche / Grid Lines */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(#f59e0b 1px, transparent 1px), linear-gradient(90deg, #f59e0b 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Ornamental Gold Corner Accents */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-amber-400 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-amber-400 pointer-events-none" />

            <div className="relative z-10 space-y-6">
              
              {/* Card Header */}
              <div className="text-center space-y-1 border-b border-amber-500/30 pb-4">
                <span className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-amber-400 uppercase block">
                  SPECIAL FORENSIC DIVISION // INCIDENT ARCHIVE
                </span>
                <h3 className="text-xl sm:text-3xl font-black font-display tracking-tight text-white uppercase">
                  CASE ZERO: THE VISUAL MYSTERY CHALLENGE
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 italic font-serif">
                  Frostpeak Conservatory Homicide Investigation Inquiry
                </p>
              </div>

              {/* Commendation Name & Body */}
              <div className="text-center space-y-2 py-2">
                <span className="text-[11px] sm:text-xs font-mono tracking-widest text-slate-300 uppercase font-semibold">
                  THIS CERTIFIES THAT INVESTIGATING DETECTIVE
                </span>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-amber-200 tracking-wide drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
                  {participant.participant_name.toUpperCase()}
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-xl mx-auto leading-relaxed pt-1">
                  has completed the forensic review of surveillance reels, physical evidence, and suspect alibis, successfully filing their deduction into the incident archive.
                </p>
              </div>

              {/* Key Details & Official Rubber Stamp Row */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                
                {/* Time Taken Box */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 text-center sm:text-left space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    TIME TAKEN
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {timeTakenFormatted}
                  </span>
                </div>

                {/* Case Reference Box */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 text-center sm:text-left space-y-0.5 sm:col-span-1">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    CASE CODE
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white truncate block">
                    {confirmationCode}
                  </span>
                </div>

                {/* Filing Date Box */}
                <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-3 text-center sm:text-left space-y-0.5">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                    RECORDED
                  </span>
                  <span className="text-xs sm:text-sm font-bold font-mono text-white block">
                    {filingDate}
                  </span>
                </div>

                {/* Official "CASE ZERO CERTIFIED" Stamp (Tilted Rubber Stamp) */}
                <div className="flex justify-center sm:justify-end">
                  <div className="transform -rotate-12 transition hover:rotate-0 duration-300 select-none">
                    <div className="border-4 border-red-600 rounded-2xl p-2.5 px-4 text-center bg-red-950/40 backdrop-blur-sm border-dashed shadow-[0_0_20px_rgba(220,38,38,0.35)]">
                      <span className="text-[9px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                        ★ FORENSIC SEAL ★
                      </span>
                      <span className="text-lg sm:text-xl font-black text-red-500 tracking-wider font-display block leading-none my-1">
                        CASE ZERO
                      </span>
                      <span className="text-xs sm:text-sm font-black text-red-400 tracking-widest uppercase block leading-none">
                        CERTIFIED
                      </span>
                      <span className="text-[8px] font-mono uppercase text-red-300 font-semibold block mt-0.5">
                        OFFICIAL VERIFIED
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer Micro-text */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-2">
                <span>SECURITY DIGEST: #{session.id.substring(0, 16)}</span>
                <span>CRYPTOGRAPHICALLY SEALED // FROSTPEAK JURY VERIFICATION</span>
              </div>

            </div>
          </div>

          {/* Action Download Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <button
              onClick={() => {
                soundFX.playClueFound();
                downloadCertifiedCard({
                  participantName: participant.participant_name,
                  timeTaken: timeTakenFormatted,
                  confirmationCode,
                  submittedAt: filingDate,
                });
              }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center space-x-2.5 shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
            >
              <Download className="w-4 h-4 text-stone-950" />
              <span>DOWNLOAD DETECTIVE CARD (PNG)</span>
            </button>

            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#e6dfd2] hover:bg-[#ded6c7] border border-[#cfc7b7] text-stone-800 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-sm"
            >
              <Printer className="w-4 h-4 text-stone-700" />
              <span>PRINT RECEIPT</span>
            </button>
          </div>
        </div>

        {/* Sealed Dossier Summary */}
        <div className="p-6 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] font-mono text-xs space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-3">
            <span className="text-blue-950 font-bold flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-blue-800" />
              <span>SEALED PARTICIPANT RECORD</span>
            </span>
            <span className="text-stone-600 font-semibold">
              {receipt?.submitted_at ? new Date(receipt.submitted_at).toLocaleString() : 'SEALED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-stone-800">
            <div>
              <span className="text-stone-600 font-semibold block">INVESTIGATING AGENT:</span>
              <span className="text-[#1c1917] font-bold text-sm">{participant.participant_name}</span>
            </div>
            <div>
              <span className="text-stone-600 font-semibold block">SESSION ID:</span>
              <span className="text-stone-700 text-[11px] font-mono truncate">{session.id}</span>
            </div>
            {chosenSuspect && (
              <div>
                <span className="text-stone-600 font-semibold block">ACCUSED MURDERER:</span>
                <span className="text-blue-950 font-bold text-sm">{chosenSuspect.display_name}</span>
              </div>
            )}
            <div>
              <span className="text-stone-600 font-semibold block">EVIDENCE PIECES ATTACHED:</span>
              <span className="text-[#1c1917] font-bold">{selectedEvidenceCodes.join(', ') || 'ATTACHED'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#cfc7b7] flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-stone-600 font-medium">
              Evaluation & final scores are reviewed confidentially by the challenge organizers.
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#e6dfd2] hover:bg-[#ded6c7] border border-[#cfc7b7] text-stone-800 font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-stone-700" />
              <span>PRINT RECEIPT</span>
            </button>
          </div>

          {/* NEXT PARTICIPANT / LAB PC RESET BUTTON */}
          {onResetForNext && (
            <div className="pt-4 border-t-2 border-dashed border-[#cfc7b7] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#ede7dc] p-5 rounded-2xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-xs font-mono font-bold text-stone-900 uppercase flex items-center justify-center sm:justify-start space-x-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-900" />
                  <span>LAB PC SHARING // ROUND RESET</span>
                </span>
                <p className="text-[11px] text-stone-600 font-sans">
                  Taking turns in rounds? Clear this laptop in 1 second for the next student. ({participant.participant_name}'s score is already permanently saved in the organizer leaderboard).
                </p>
              </div>
              <button
                onClick={() => {
                  soundFX.playCameraSwitch();
                  setShowResetConfirm(true);
                }}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg shrink-0 transform hover:-translate-y-0.5"
              >
                <UserPlus className="w-4 h-4 text-amber-300" />
                <span>RESET FOR NEXT DETECTIVE</span>
              </button>
            </div>
          )}
        </div>

        {/* RESET CONFIRMATION MODAL */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-[#f5f0e6] border-2 border-[#cfc7b7] rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl text-[#1c1917]">
              <div className="flex items-center space-x-3 text-blue-950 border-b border-[#cfc7b7] pb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-900 border border-blue-200">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-[#1c1917] text-base">
                    START FRESH FOR NEXT DETECTIVE?
                  </h3>
                  <p className="text-[11px] font-mono text-stone-500">1-SECOND LAB PC RESET</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-700 font-sans leading-relaxed">
                This will clear active session caches from this browser so the next detective can register their name and start immediately.
              </p>

              <div className="p-3.5 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] text-xs font-mono space-y-1">
                <div className="text-emerald-900 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Submission confirmed for {participant.participant_name}</span>
                </div>
                <div className="text-stone-600 text-[11px]">
                  Ref: {receipt?.confirmation_code || 'CZ-VERIFIED'} • Recorded in live jury leaderboard
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-800 font-mono text-xs font-bold transition"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => {
                    setShowResetConfirm(false);
                    if (onResetForNext) onResetForNext();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-950 text-white font-mono text-xs font-bold flex items-center space-x-2 shadow-sm transition"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>YES, RESET IN 1 SECOND</span>
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Active Submission Form
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 relative">
      
      {/* Auto-Submitting Overlay on Timer Expiration */}
      {isAutoSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in text-[#1c1917]">
          <div className="bg-[#f5f0e6] border-2 border-red-500 rounded-3xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-100 text-red-900 border-2 border-red-400 mx-auto flex items-center justify-center animate-pulse shadow-md">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase px-3 py-1 rounded-full bg-red-200 text-red-950 font-bold border border-red-300">
                15:00 TIME LIMIT EXPIRED
              </span>
              <h3 className="font-display font-black text-2xl text-[#1c1917] mt-2">
                AUTO-SUBMITTING CASE...
              </h3>
              <p className="text-xs text-stone-700 font-mono mt-1.5 leading-relaxed">
                Securing whatever answers and deductions you have typed so far. Your work is safely recorded in the database!
              </p>
            </div>
            <div className="pt-2 flex items-center justify-center space-x-2 text-xs font-mono text-stone-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-800 animate-ping"></span>
              <span>Submitting to live event leaderboard...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc7b7] pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-900 font-mono text-xs tracking-wider font-bold">
            <span>STAGE 05 OF 05</span>
            <span>//</span>
            <span>FINAL VERDICT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1c1917] mt-1">
            SUBMIT YOUR INVESTIGATION
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-sans">
            Answer the three core forensic questions. Once submitted, your answers will be locked and cannot be changed.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e6] border border-[#cfc7b7] text-stone-800 shadow-sm font-bold">
            FINAL DOSSIER SEAL
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-900 text-xs font-mono flex items-center space-x-2 shadow-sm font-bold">
          <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* QUESTION 1: WHO IS THE MURDERER? */}
      <div className="p-6 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-950 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-950 flex items-center justify-center text-xs font-black">
            1
          </span>
          <h3 className="text-base text-[#1c1917] font-black">WHO IS THE MURDERER?</h3>
        </div>
        <p className="text-xs text-stone-700 font-sans">
          Select the individual responsible for the murder of Dr. Arthur Vance at Frostpeak Conservatory.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {INITIAL_SUSPECTS.map((s) => {
            const isSelected = selectedSuspectId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => handleSuspectSelect(s.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-2 ${
                  isSelected
                    ? 'bg-[#dfd7c8] border-2 border-blue-900 ring-2 ring-blue-300 text-[#1c1917] shadow-md'
                    : 'bg-[#fbf9f5] border-2 border-[#cfc7b7] hover:border-[#9e9484] text-stone-800 shadow-sm'
                }`}
              >
                <img
                  src={s.portrait_url}
                  alt={s.display_name}
                  className="w-14 h-14 sm:w-full sm:aspect-square rounded-xl object-cover border border-[#cfc7b7]"
                />
                <div className="font-mono">
                  <div className="flex items-center space-x-1.5">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-900" />}
                    <h4 className="font-bold text-xs sm:text-sm text-[#1c1917]">{s.display_name}</h4>
                  </div>
                  <p className="text-[10px] text-stone-600 font-semibold">{s.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 2: WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION? */}
      <div className="p-6 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-950 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-950 flex items-center justify-center text-xs font-black">
            2
          </span>
          <h3 className="text-base text-[#1c1917] font-black">WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION?</h3>
        </div>
        <p className="text-xs text-stone-700 font-sans">
          Select all critical clues that substantiate the murder method, false alibi, and forensic link to the culprit (select at least 2).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {INITIAL_EVIDENCE.map((ev) => {
            const isSelected = selectedEvidenceCodes.includes(ev.code);

            return (
              <div
                key={ev.id}
                onClick={() => toggleEvidence(ev.code)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-800 text-white border-2 border-blue-900 shadow-sm'
                    : 'bg-[#fbf9f5] border-2 border-[#cfc7b7] hover:border-[#9e9484] text-stone-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-blue-900'}`}>{ev.code}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                      isSelected ? 'bg-white text-blue-900 border-white' : 'border-[#cfc7b7] text-transparent'
                    }`}>
                      ✓
                    </span>
                  </div>
                  <p className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-white' : 'text-[#1c1917]'}`}>
                    {ev.title}
                  </p>
                </div>
                <span className={`text-[10px] uppercase font-mono mt-2 font-semibold ${isSelected ? 'text-blue-200' : 'text-stone-600'}`}>
                  {ev.evidence_type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 3: HOW WAS THE MURDER COMMITTED & WHAT EVIDENCE PROVES IT? */}
      <div className="p-6 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-950 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-950 flex items-center justify-center text-xs font-black">
            3
          </span>
          <h3 className="text-base text-[#1c1917] font-black">HOW WAS THE MURDER COMMITTED & WHAT EVIDENCE PROVES IT?</h3>
        </div>
        <p className="text-xs text-stone-700 font-sans">
          State your conclusion clearly: Identify who committed the murder, analyze how their claimed alibi is disproved by the timeline and forensic evidence, explain how the crime was executed, and what motive drove the killer.
        </p>

        <div className="space-y-2">
          <textarea
            value={explanation}
            onChange={(e) => handleExplanationChange(e.target.value)}
            onPaste={handlePasteBlocked}
            onDrop={handleDropBlocked}
            rows={6}
            placeholder="Type your complete investigative conclusion here: State who committed the murder, explain how the crime was executed, why their alibi fails against the physical evidence and CCTV timeline, and what motive drove them..."
            className="w-full bg-[#faf7f2] border-2 border-[#cfc7b7] focus:border-blue-800 focus:ring-2 focus:ring-blue-200 rounded-xl p-4 text-xs sm:text-sm text-[#1c1917] placeholder-stone-400 font-mono outline-none shadow-inner font-medium"
          />

          {showPasteWarning && (
            <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-amber-950 text-xs font-mono flex items-center space-x-2 animate-fade-in shadow-sm font-semibold">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Copy-paste is disabled in the explanation box. Please type your deduction manually to demonstrate your reasoning.</span>
            </div>
          )}

          <div className="flex justify-between items-center text-[11px] font-mono text-stone-600 font-semibold">
            <span className="flex items-center space-x-1.5 text-stone-500">
              <Lock className="w-3 h-3 text-stone-400" />
              <span>Minimum 30 characters (Manual typing required • Copy-paste blocked)</span>
            </span>
            <span className={explanation.length < 30 ? 'text-red-700 font-bold' : 'text-emerald-800 font-bold'}>
              {explanation.length} characters entered
            </span>
          </div>
        </div>
      </div>

      {/* Submission CTA */}
      <div className="pt-4 border-t border-[#cfc7b7] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f5f0e6] p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono text-stone-700 font-medium">
          <Lock className="w-4 h-4 text-amber-800" />
          <span>Submissions are final and permanently recorded under {participant.participant_name}.</span>
        </div>

        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            setShowConfirmModal(true);
          }}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-sm tracking-wider flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>FINALIZE & SUBMIT INVESTIGATION</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#f5f0e6] border border-[#cfc7b7] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-[#1c1917]">
            <div className="flex items-center space-x-3 text-blue-950 border-b border-[#cfc7b7] pb-3">
              <ShieldCheck className="w-6 h-6 text-blue-800" />
              <h3 className="font-display font-bold text-[#1c1917] text-base">
                CONFIRM FINAL SUBMISSION
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-800 font-sans leading-relaxed font-medium">
              Are you ready to submit your findings? Once submitted, your case file will be permanently sealed in the Supabase database and cannot be modified.
            </p>

            <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] text-xs font-mono text-stone-800 space-y-1.5">
              <div>
                <span className="text-stone-600 font-semibold">AGENT:</span> <strong className="text-[#1c1917] font-bold">{participant.participant_name}</strong>
              </div>
              <div>
                <span className="text-stone-600 font-semibold">SELECTED SUSPECT:</span>{' '}
                <strong className="text-blue-950 font-bold">
                  {INITIAL_SUSPECTS.find((s) => s.id === selectedSuspectId)?.display_name || 'None Selected'}
                </strong>
              </div>
              <div>
                <span className="text-stone-600 font-semibold">SUPPORTING CLUES:</span>{' '}
                <strong className="text-[#1c1917] font-bold">{selectedEvidenceCodes.length} attached</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-[#e6dfd2] hover:bg-[#ded6c7] text-stone-800 font-mono text-xs font-bold transition"
              >
                CANCEL / REVIEW
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-xs transition flex items-center space-x-2 shadow-sm"
              >
                {isSubmitting ? (
                  <span>SEALING FILE...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>YES, SUBMIT CASE</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
