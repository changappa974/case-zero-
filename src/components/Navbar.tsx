import React from 'react';
import { Volume2, VolumeX, Lock, Shield, Sparkles, User } from 'lucide-react';
import { InvestigationStage, Participant, InvestigationSession } from '../types';
import { soundFX } from '../lib/audioService';

interface NavbarProps {
  currentStage: InvestigationStage;
  maxStageReached: number;
  onNavigateStage: (stage: InvestigationStage) => void;
  participant: Participant | null;
  session: InvestigationSession | null;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  maxStageReached,
  onNavigateStage,
  participant,
  session,
  isMuted,
  onToggleMute,
}) => {
  const stages: { stage: InvestigationStage; label: string; short: string }[] = [
    { stage: 1, label: 'Stage 1: The Crime Scene', short: '01 Scene' },
    { stage: 2, label: 'Stage 2: CCTV Recordings', short: '02 CCTV' },
    { stage: 3, label: 'Stage 3: Suspect Files', short: '03 Suspects' },
    { stage: 4, label: 'Stage 4: Evidence Board', short: '04 Evidence' },
    { stage: 5, label: 'Stage 5: Final Verdict', short: '05 Verdict' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => onNavigateStage(participant ? 1 : 0)}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 font-bold font-mono text-sm tracking-wider shadow-sm group-hover:bg-slate-800 transition">
            CZ
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black tracking-widest text-slate-900 text-base">CASE ZERO</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300 font-bold">
                FORENSIC HUD
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block tracking-wide font-medium">
              Frostpeak Conservatory Murder Investigation
            </p>
          </div>
        </div>

        {/* Stage Progress Pills (Shown when participant registered) */}
        {participant && (
          <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            {stages.map((s) => {
              const isCurrent = currentStage === s.stage;
              const isUnlocked = s.stage <= maxStageReached;
              const isSubmitted = session?.status === 'submitted' && s.stage === 5;

              return (
                <button
                  key={s.stage}
                  onClick={() => {
                    if (isUnlocked) {
                      soundFX.playCameraSwitch();
                      onNavigateStage(s.stage);
                    }
                  }}
                  disabled={!isUnlocked}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-blue-600 text-white border border-blue-600 shadow-sm font-bold'
                      : isUnlocked
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 hover:bg-slate-200 border border-slate-200 font-semibold'
                      : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{s.short}</span>
                  {isSubmitted ? (
                    <Lock className="w-3 h-3 text-emerald-600" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 text-slate-400" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Tools & Badges */}
        <div className="flex items-center space-x-3">
          {/* Active Participant info */}
          {participant && (
            <div className="flex items-center space-x-2 text-xs font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500 font-semibold">AGENT:</span>
              <span className="text-blue-900 font-bold truncate max-w-[130px]">
                {participant.participant_name}
              </span>
            </div>
          )}

          {/* Sound Mute / Unmute Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundFX.playCameraSwitch();
            }}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 hover:text-slate-900 transition shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-slate-700" />}
          </button>
        </div>

      </div>

      {/* Mobile Stage Selector */}
      {participant && (
        <div className="md:hidden flex items-center justify-between px-3 py-2 bg-slate-100 border-t border-slate-200 overflow-x-auto text-[11px] font-mono">
          {stages.map((s) => (
            <button
              key={s.stage}
              onClick={() => s.stage <= maxStageReached && onNavigateStage(s.stage)}
              disabled={s.stage > maxStageReached}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap mr-1.5 ${
                currentStage === s.stage
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : s.stage <= maxStageReached
                  ? 'text-slate-700 bg-white border border-slate-200 font-medium'
                  : 'text-slate-400 bg-slate-50 border border-slate-200 opacity-60'
              }`}
            >
              {s.short}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
