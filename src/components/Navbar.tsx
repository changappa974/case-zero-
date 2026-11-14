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
    <header className="sticky top-0 z-50 bg-charcoal-950/95 backdrop-blur-md border-b border-charcoal-800 text-gray-200 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => onNavigateStage(participant ? 1 : 0)}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-charcoal-900 border border-amber-500/40 text-amber-500 font-bold font-mono text-sm tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:border-amber-400 transition">
            CZ
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black tracking-widest text-white text-base">CASE ZERO</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                FORENSIC HUD
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block tracking-wide font-sans">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.25)] font-bold'
                      : isUnlocked
                      ? 'bg-charcoal-900/80 text-gray-400 hover:text-gray-200 border border-charcoal-800 hover:border-charcoal-700'
                      : 'bg-charcoal-950/40 text-gray-600 border border-charcoal-900 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span>{s.short}</span>
                  {isSubmitted ? (
                    <Lock className="w-3 h-3 text-emerald-400" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 text-gray-600" />
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
            <div className="flex items-center space-x-2 text-xs font-mono bg-charcoal-900/90 px-3 py-1.5 rounded-lg border border-charcoal-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-400">AGENT:</span>
              <span className="text-amber-400 font-bold truncate max-w-[130px]">
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
            className="p-2 rounded-lg bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-800 text-gray-400 hover:text-amber-400 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>
        </div>

      </div>

      {/* Mobile Stage Selector */}
      {participant && (
        <div className="md:hidden flex items-center justify-between px-3 py-2 bg-charcoal-900 border-t border-charcoal-800 overflow-x-auto text-[11px] font-mono">
          {stages.map((s) => (
            <button
              key={s.stage}
              onClick={() => s.stage <= maxStageReached && onNavigateStage(s.stage)}
              disabled={s.stage > maxStageReached}
              className={`px-2 py-1 rounded whitespace-nowrap mr-1.5 ${
                currentStage === s.stage
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : s.stage <= maxStageReached
                  ? 'text-gray-400'
                  : 'text-gray-700'
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
