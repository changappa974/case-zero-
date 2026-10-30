import React from 'react';
import { Volume2, VolumeX, Shield, Lock, Activity, Eye } from 'lucide-react';
import { InvestigationStage, Participant, InvestigationSession } from '../types';
import { soundFX } from '../lib/audioService';

interface NavbarProps {
  currentStage: InvestigationStage;
  maxStageReached: number;
  onNavigateStage: (stage: InvestigationStage) => void;
  participant: Participant | null;
  session: InvestigationSession | null;
  onOpenOrganizer: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  maxStageReached,
  onNavigateStage,
  participant,
  session,
  onOpenOrganizer,
  isMuted,
  onToggleMute,
}) => {
  const stages: { stage: InvestigationStage; label: string; short: string }[] = [
    { stage: 1, label: 'Stage 1: Watch Story', short: '01 Story' },
    { stage: 2, label: 'Stage 2: Scene & CCTV', short: '02 Scene' },
    { stage: 3, label: 'Stage 3: Suspects', short: '03 Suspects' },
    { stage: 4, label: 'Stage 4: Evidence Board', short: '04 Evidence' },
    { stage: 5, label: 'Stage 5: Final Submission', short: '05 Submit' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-charcoal-950/90 backdrop-blur-md border-b border-charcoal-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigateStage(participant ? 1 : 0)}>
          <div className="relative flex items-center justify-center w-9 h-9 rounded bg-charcoal-900 border border-amber-500/40 text-amber-500 font-bold font-mono text-sm tracking-wider shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            CZ
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-600 rounded-full"></span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold tracking-widest text-white text-base">CASE ZERO</span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                FORENSIC HUD
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block tracking-wide">
              Meridian Innovation Hall Investigation
            </p>
          </div>
        </div>

        {/* Stage Progress Pills (Shown when participant registered) */}
        {participant && (
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
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
                  className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : isUnlocked
                      ? 'bg-charcoal-900/80 text-gray-400 hover:text-gray-200 border border-charcoal-700/60 hover:border-charcoal-600'
                      : 'bg-charcoal-950/40 text-gray-600 border border-charcoal-900 cursor-not-allowed opacity-60'
                  }`}
                >
                  <span>{s.short}</span>
                  {isSubmitted ? (
                    <Lock className="w-3 h-3 text-red-500" />
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
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono bg-charcoal-900 px-2.5 py-1 rounded border border-charcoal-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-gray-400">AGENT:</span>
              <span className="text-gray-200 font-semibold truncate max-w-[120px]">
                {participant.participant_name}
              </span>
            </div>
          )}

          {/* Audio Hum Toggle */}
          <button
            onClick={() => {
              onToggleMute();
              soundFX.playCameraSwitch();
            }}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 rounded bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-800 text-gray-400 hover:text-amber-400 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
          </button>

          {/* Organizer Access Portal */}
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              onOpenOrganizer();
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded bg-charcoal-900 hover:bg-charcoal-800 border border-charcoal-700 text-xs font-mono text-gray-300 hover:text-amber-300 transition"
          >
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">ORGANIZER</span>
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
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
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
