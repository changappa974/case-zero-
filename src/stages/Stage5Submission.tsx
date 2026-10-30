import React, { useState } from 'react';
import { 
  Lock, CheckCircle2, AlertTriangle, ShieldCheck, FileCheck, 
  Send, Sparkles, Printer, User, FileText, CornerDownRight 
} from 'lucide-react';
import { INITIAL_SUSPECTS, INITIAL_EVIDENCE } from '../lib/caseData';
import { Participant, InvestigationSession, SubmissionReceipt } from '../types';
import { submitInvestigation } from '../lib/supabase';
import { soundFX } from '../lib/audioService';
import confetti from 'canvas-confetti';

interface Stage5SubmissionProps {
  participant: Participant;
  session: InvestigationSession;
  collectedEvidence: string[];
  initialSuspectId?: string;
  onSubmissionSuccess: (receipt: SubmissionReceipt) => void;
  existingReceipt?: SubmissionReceipt | null;
}

export const Stage5Submission: React.FC<Stage5SubmissionProps> = ({
  participant,
  session,
  collectedEvidence,
  initialSuspectId,
  onSubmissionSuccess,
  existingReceipt,
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(initialSuspectId || '');
  const [selectedEvidenceCodes, setSelectedEvidenceCodes] = useState<string[]>(
    collectedEvidence.length > 0 ? collectedEvidence : ['EV-01', 'EV-04']
  );
  const [explanation, setExplanation] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(existingReceipt || null);

  const isLocked = session.status === 'submitted' || Boolean(receipt);

  const toggleEvidence = (code: string) => {
    if (isLocked) return;
    soundFX.playCameraSwitch();
    if (selectedEvidenceCodes.includes(code)) {
      setSelectedEvidenceCodes(selectedEvidenceCodes.filter((c) => c !== code));
    } else {
      setSelectedEvidenceCodes([...selectedEvidenceCodes, code]);
    }
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
        explanation
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
          colors: ['#f59e0b', '#dc2626', '#10b981'],
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

    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 animate-fade-in">
        
        {/* Big Status Banner matching Prompt Specification */}
        <div className="p-8 rounded-2xl bg-charcoal-900 border border-emerald-500/50 shadow-[0_0_50px_rgba(16,185,129,0.15)] text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center shadow-lg">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">
              OFFICIAL VERIFICATION CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-mono text-white tracking-tight">
              INVESTIGATION SUBMITTED SUCCESSFULLY.
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 font-mono">
              Your findings have been permanently encrypted and sealed in the database.
            </p>
          </div>

          {/* Sealed Confirmation Code Box */}
          <div className="inline-block p-4 rounded-xl bg-charcoal-950 border border-charcoal-700 font-mono text-center">
            <span className="text-[11px] text-gray-400 block mb-1">OFFICIAL CASE REFERENCE CODE</span>
            <span className="text-xl sm:text-2xl font-black text-amber-400 tracking-widest">
              {receipt?.confirmation_code || 'CZ-VERIFIED-2026'}
            </span>
          </div>
        </div>

        {/* Sealed Dossier Summary */}
        <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 font-mono text-xs space-y-4">
          <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
            <span className="text-amber-500 font-bold flex items-center space-x-1.5">
              <Lock className="w-4 h-4" />
              <span>SEALED PARTICIPANT RECORD</span>
            </span>
            <span className="text-gray-500">
              {receipt?.submitted_at ? new Date(receipt.submitted_at).toLocaleString() : 'SEALED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-300">
            <div>
              <span className="text-gray-500 block">INVESTIGATING AGENT:</span>
              <span className="text-white font-bold text-sm">{participant.participant_name}</span>
            </div>
            <div>
              <span className="text-gray-500 block">SESSION ID:</span>
              <span className="text-gray-400 text-[11px] truncate">{session.id}</span>
            </div>
            {chosenSuspect && (
              <div>
                <span className="text-gray-500 block">SELECTED RESPONSIBLE PARTY:</span>
                <span className="text-amber-400 font-bold text-sm">{chosenSuspect.display_name}</span>
              </div>
            )}
            <div>
              <span className="text-gray-500 block">EVIDENCE PIECES ATTACHED:</span>
              <span className="text-white font-bold">{selectedEvidenceCodes.join(', ') || 'ATTACHED'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-charcoal-800 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">
              Evaluation & final scores are reviewed confidentially by the challenge organizers.
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 font-mono text-xs flex items-center space-x-1.5 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT RECEIPT</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  // Active Submission Form
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 05 OF 05</span>
            <span>//</span>
            <span>FINAL VERDICT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            SUBMIT YOUR INVESTIGATION
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Answer the three core forensic questions. Once submitted, your answers will be locked and cannot be changed.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs text-amber-400">
          <span className="px-3 py-1.5 rounded bg-amber-950/40 border border-amber-800/40">
            FINAL DOSSIER SEAL
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* QUESTION 1: WHO IS RESPONSIBLE? */}
      <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center space-x-2 text-amber-500 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xs">
            1
          </span>
          <h3>WHO IS RESPONSIBLE FOR THE INCIDENT?</h3>
        </div>
        <p className="text-xs text-gray-400 font-sans">
          Select the person who took or moved the prototype during the 74-second outage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {INITIAL_SUSPECTS.map((s) => {
            const isSelected = selectedSuspectId === s.id;

            return (
              <div
                key={s.id}
                onClick={() => {
                  soundFX.playCameraSwitch();
                  setSelectedSuspectId(s.id);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-2 ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700 text-gray-300'
                }`}
              >
                <img
                  src={s.portrait_url}
                  alt={s.display_name}
                  className="w-14 h-14 sm:w-full sm:aspect-square rounded-lg object-cover"
                />
                <div className="font-mono">
                  <div className="flex items-center space-x-1.5">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                    <h4 className="font-bold text-xs sm:text-sm text-white">{s.display_name}</h4>
                  </div>
                  <p className="text-[10px] text-gray-400">{s.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 2: WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION? */}
      <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center space-x-2 text-amber-500 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xs">
            2
          </span>
          <h3>WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION?</h3>
        </div>
        <p className="text-xs text-gray-400 font-sans">
          Select all critical clues that substantiate what happened (select at least 2).
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {INITIAL_EVIDENCE.map((ev) => {
            const isSelected = selectedEvidenceCodes.includes(ev.code);

            return (
              <div
                key={ev.id}
                onClick={() => toggleEvidence(ev.code)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700 text-gray-400'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="font-bold text-amber-400">{ev.code}</span>
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-charcoal-950' : 'border-charcoal-700'
                    }`}>
                      {isSelected && '✓'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-gray-200 line-clamp-2">
                    {ev.title}
                  </p>
                </div>
                <span className="text-[10px] uppercase text-gray-500 font-mono mt-2">
                  {ev.evidence_type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 3: HOW EXACTLY DID IT HAPPEN? */}
      <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-4">
        <div className="flex items-center space-x-2 text-amber-500 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-xs">
            3
          </span>
          <h3>HOW EXACTLY DID IT HAPPEN?</h3>
        </div>
        <p className="text-xs text-gray-400 font-sans">
          Explain what triggered the outage, how the prototype was secured or removed, where it was placed, and the individual's motive or reasoning.
        </p>

        <div className="space-y-2">
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={5}
            placeholder="Detail your explanation: What hazard was detected? Why was Sub-Panel B-4 isolated? What key or access was used, and where is the prototype now?..."
            className="w-full bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl p-4 text-xs sm:text-sm text-white placeholder-gray-600 font-mono outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-gray-500">
            <span>Minimum 30 characters</span>
            <span className={explanation.length < 30 ? 'text-red-400' : 'text-emerald-400'}>
              {explanation.length} characters entered
            </span>
          </div>
        </div>
      </div>

      {/* Submission CTA */}
      <div className="pt-4 border-t border-charcoal-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-xs font-mono text-gray-400">
          <Lock className="w-4 h-4 text-amber-500" />
          <span>Submissions are final and permanently recorded under {participant.participant_name}.</span>
        </div>

        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            setShowConfirmModal(true);
          }}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold font-mono text-sm tracking-wider flex items-center justify-center space-x-2 transition shadow-[0_0_25px_rgba(220,38,38,0.4)] disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>FINALIZE & SUBMIT INVESTIGATION</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-500 border-b border-charcoal-800 pb-3">
              <ShieldCheck className="w-6 h-6 text-amber-500" />
              <h3 className="font-mono font-bold text-white text-base">
                CONFIRM FINAL SUBMISSION
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
              Are you ready to submit your findings? Once submitted, your case file will be permanently sealed in the Supabase database and cannot be modified.
            </p>

            <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs font-mono text-gray-400 space-y-1">
              <div>
                <span className="text-gray-500">AGENT:</span> <strong className="text-white">{participant.participant_name}</strong>
              </div>
              <div>
                <span className="text-gray-500">SELECTED SUSPECT:</span>{' '}
                <strong className="text-amber-400">
                  {INITIAL_SUSPECTS.find((s) => s.id === selectedSuspectId)?.display_name || 'None Selected'}
                </strong>
              </div>
              <div>
                <span className="text-gray-500">SUPPORTING CLUES:</span>{' '}
                <strong className="text-white">{selectedEvidenceCodes.length} attached</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 font-mono text-xs transition"
              >
                CANCEL / REVIEW
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs transition flex items-center space-x-2"
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
