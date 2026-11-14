import React from 'react';
import { Volume2, VolumeX, Lock } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-[#f5f0e6]/95 backdrop-blur-md border-b border-[#cfc7b7] text-[#1c1917] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand (Icon box removed as requested) */}
        <div 
          className="flex items-center cursor-pointer group py-1" 
          onClick={() => onNavigateStage(participant ? 1 : 0)}
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-black tracking-widest text-[#1c1917] text-lg group-hover:text-blue-900 transition">
                CASE ZERO
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300 font-bold">
                FORENSIC HUD
              </span>
            </div>
            <p className="text-[11px] text-stone-600 hidden sm:block tracking-wide font-medium">
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
                      ? 'bg-blue-800 text-white border border-blue-900 shadow-sm font-bold'
                      : isUnlocked
                      ? 'bg-[#e6dfd2] text-stone-800 hover:text-stone-950 hover:bg-[#ded6c7] border border-[#cfc7b7] font-semibold'
                      : 'bg-[#eae4d8] text-stone-400 border border-[#ddd6c8] cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{s.short}</span>
                  {isSubmitted ? (
                    <Lock className="w-3 h-3 text-emerald-700" />
                  ) : !isUnlocked ? (
                    <Lock className="w-2.5 h-2.5 text-stone-400" />
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
            <div className="flex items-center space-x-2 text-xs font-mono bg-[#e6dfd2] px-3.5 py-1.5 rounded-lg border border-[#cfc7b7] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-stone-600 font-semibold">AGENT:</span>
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
            className="p-2 rounded-lg bg-[#e6dfd2] hover:bg-[#ded6c7] border border-[#cfc7b7] text-stone-700 hover:text-stone-900 transition shadow-sm"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-600" /> : <Volume2 className="w-4 h-4 text-stone-800" />}
          </button>
        </div>

      </div>

      {/* Mobile Stage Selector */}
      {participant && (
        <div className="md:hidden flex items-center justify-between px-3 py-2 bg-[#ede7dc] border-t border-[#cfc7b7] overflow-x-auto text-[11px] font-mono">
          {stages.map((s) => (
            <button
              key={s.stage}
              onClick={() => s.stage <= maxStageReached && onNavigateStage(s.stage)}
              disabled={s.stage > maxStageReached}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap mr-1.5 ${
                currentStage === s.stage
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : s.stage <= maxStageReached
                  ? 'text-stone-800 bg-[#f5f0e6] border border-[#cfc7b7] font-medium'
                  : 'text-stone-400 bg-[#eae4d8] border border-[#ddd6c8] opacity-60'
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
