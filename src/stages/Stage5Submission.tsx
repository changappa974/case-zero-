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
          colors: ['#2563eb', '#d97706', '#10b981'],
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
        
        {/* Big Status Banner */}
        <div className="p-8 rounded-2xl bg-white border-2 border-emerald-500 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-400 text-emerald-600 mx-auto flex items-center justify-center shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              OFFICIAL VERIFICATION CONFIRMED
            </span>
            <h1 className="text-2xl sm:text-4xl font-black font-mono text-slate-900 tracking-tight pt-2">
              INVESTIGATION SUBMITTED SUCCESSFULLY.
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-mono">
              Your findings have been permanently encrypted and sealed in the database.
            </p>
          </div>

          {/* Sealed Confirmation Code Box */}
          <div className="inline-block p-4 rounded-xl bg-slate-50 border-2 border-slate-300 font-mono text-center shadow-sm">
            <span className="text-[11px] text-slate-500 font-bold block mb-1">OFFICIAL CASE REFERENCE CODE</span>
            <span className="text-xl sm:text-2xl font-black text-blue-900 tracking-widest">
              {receipt?.confirmation_code || 'CZ-VERIFIED-2026'}
            </span>
          </div>
        </div>

        {/* Sealed Dossier Summary */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200 font-mono text-xs space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-blue-900 font-bold flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>SEALED PARTICIPANT RECORD</span>
            </span>
            <span className="text-slate-500 font-semibold">
              {receipt?.submitted_at ? new Date(receipt.submitted_at).toLocaleString() : 'SEALED'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-700">
            <div>
              <span className="text-slate-500 font-semibold block">INVESTIGATING AGENT:</span>
              <span className="text-slate-900 font-bold text-sm">{participant.participant_name}</span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block">SESSION ID:</span>
              <span className="text-slate-600 text-[11px] font-mono truncate">{session.id}</span>
            </div>
            {chosenSuspect && (
              <div>
                <span className="text-slate-500 font-semibold block">ACCUSED MURDERER:</span>
                <span className="text-blue-900 font-bold text-sm">{chosenSuspect.display_name}</span>
              </div>
            )}
            <div>
              <span className="text-slate-500 font-semibold block">EVIDENCE PIECES ATTACHED:</span>
              <span className="text-slate-900 font-bold">{selectedEvidenceCodes.join(', ') || 'ATTACHED'}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-500 font-medium">
              Evaluation & final scores are reviewed confidentially by the challenge organizers.
            </span>
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-mono text-xs font-bold flex items-center space-x-1.5 transition shadow-sm"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-wider font-bold">
            <span>STAGE 05 OF 05</span>
            <span>//</span>
            <span>FINAL VERDICT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
            SUBMIT YOUR INVESTIGATION
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Answer the three core forensic questions. Once submitted, your answers will be locked and cannot be changed.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm font-bold">
            FINAL DOSSIER SEAL
          </span>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-mono flex items-center space-x-2 shadow-sm font-bold">
          <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* QUESTION 1: WHO IS THE MURDERER? */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-900 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-900 flex items-center justify-center text-xs font-black">
            1
          </span>
          <h3 className="text-base text-slate-900 font-black">WHO IS THE MURDERER?</h3>
        </div>
        <p className="text-xs text-slate-600 font-sans">
          Select the individual responsible for the murder of Dr. Arthur Vance at Frostpeak Conservatory.
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
                className={`p-3 rounded-2xl border cursor-pointer transition-all flex sm:flex-col items-center sm:items-start space-x-3 sm:space-x-0 sm:space-y-2 ${
                  isSelected
                    ? 'bg-blue-50 border-2 border-blue-600 ring-2 ring-blue-100 text-slate-900 shadow-md'
                    : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
                }`}
              >
                <img
                  src={s.portrait_url}
                  alt={s.display_name}
                  className="w-14 h-14 sm:w-full sm:aspect-square rounded-xl object-cover border border-slate-200"
                />
                <div className="font-mono">
                  <div className="flex items-center space-x-1.5">
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{s.display_name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold">{s.role}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 2: WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION? */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-900 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-900 flex items-center justify-center text-xs font-black">
            2
          </span>
          <h3 className="text-base text-slate-900 font-black">WHICH PIECES OF EVIDENCE PROVE YOUR CONCLUSION?</h3>
        </div>
        <p className="text-xs text-slate-600 font-sans">
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
                    ? 'bg-blue-600 text-white border-2 border-blue-600 shadow-sm'
                    : 'bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className={`font-bold ${isSelected ? 'text-amber-300' : 'text-blue-700'}`}>{ev.code}</span>
                    <span className={`w-4 h-4 rounded-full border flex items-center justify-center font-bold text-[10px] ${
                      isSelected ? 'bg-white text-blue-700 border-white' : 'border-slate-300 text-transparent'
                    }`}>
                      ✓
                    </span>
                  </div>
                  <p className={`text-xs font-bold line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {ev.title}
                  </p>
                </div>
                <span className={`text-[10px] uppercase font-mono mt-2 font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                  {ev.evidence_type}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* QUESTION 3: HOW WAS THE MURDER COMMITTED & WHAT EVIDENCE PROVES IT? */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center space-x-2 text-blue-900 font-mono text-sm font-bold">
          <span className="w-6 h-6 rounded-full bg-blue-100 border border-blue-300 text-blue-900 flex items-center justify-center text-xs font-black">
            3
          </span>
          <h3 className="text-base text-slate-900 font-black">HOW WAS THE MURDER COMMITTED & WHAT EVIDENCE PROVES IT?</h3>
        </div>
        <p className="text-xs text-slate-600 font-sans">
          Explain the sequence of events: How was the Midnight Orchid toxin introduced into the tea? What disproves the culprit's alibi? What forensic traces (left-handed smudge, gloves in bin, corridor movements, financial audit) prove your conclusion?
        </p>

        <div className="space-y-2">
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={5}
            placeholder="Detail your explanation: Explain how Dr. Arthur Vance was poisoned, how the Midnight Orchid toxin was introduced into his Earl Grey tea, the timeline contradiction between the B-Wing lab and corridor CCTV, and the physical traces (faucet smudge, gloves, funding fraud) proving who committed the murder..."
            className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 rounded-xl p-4 text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-mono outline-none shadow-inner font-medium"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-500 font-semibold">
            <span>Minimum 30 characters</span>
            <span className={explanation.length < 30 ? 'text-red-600 font-bold' : 'text-emerald-700 font-bold'}>
              {explanation.length} characters entered
            </span>
          </div>
        </div>
      </div>

      {/* Submission CTA */}
      <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-600 font-medium">
          <Lock className="w-4 h-4 text-amber-600" />
          <span>Submissions are final and permanently recorded under {participant.participant_name}.</span>
        </div>

        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            setShowConfirmModal(true);
          }}
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono text-sm tracking-wider flex items-center justify-center space-x-2 transition shadow-md hover:shadow-lg disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          <span>FINALIZE & SUBMIT INVESTIGATION</span>
        </button>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl text-slate-900">
            <div className="flex items-center space-x-3 text-blue-900 border-b border-slate-200 pb-3">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <h3 className="font-mono font-bold text-slate-900 text-base">
                CONFIRM FINAL SUBMISSION
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 font-sans leading-relaxed font-medium">
              Are you ready to submit your findings? Once submitted, your case file will be permanently sealed in the Supabase database and cannot be modified.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-700 space-y-1.5">
              <div>
                <span className="text-slate-500 font-semibold">AGENT:</span> <strong className="text-slate-900 font-bold">{participant.participant_name}</strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">SELECTED SUSPECT:</span>{' '}
                <strong className="text-blue-900 font-bold">
                  {INITIAL_SUSPECTS.find((s) => s.id === selectedSuspectId)?.display_name || 'None Selected'}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 font-semibold">SUPPORTING CLUES:</span>{' '}
                <strong className="text-slate-900 font-bold">{selectedEvidenceCodes.length} attached</strong>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs font-bold transition"
              >
                CANCEL / REVIEW
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono text-xs transition flex items-center space-x-2 shadow-sm"
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
