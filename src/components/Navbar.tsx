import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Lock, Clock } from 'lucide-react';
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
  timeLeft?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStage,
  onNavigateStage,
  participant,
  session,
  isMuted,
  onToggleMute,
  timeLeft: externalTimeLeft,
}) => {
  // 15-Minute Countdown Timer (900 seconds)
  const [localTimeLeft, setLocalTimeLeft] = useState<number>(900);

  useEffect(() => {
    if (!participant || externalTimeLeft !== undefined) return;

    const storageKey = `case_zero_timer_${participant.id}`;
    let startTime = localStorage.getItem(storageKey);
    if (!startTime) {
      startTime = session?.started_at ? new Date(session.started_at).getTime().toString() : Date.now().toString();
      localStorage.setItem(storageKey, startTime);
    }

    const startMs = parseInt(startTime, 10) || Date.now();
    const updateTimer = () => {
      if (session?.status === 'submitted') return;
      const elapsed = Math.floor((Date.now() - startMs) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setLocalTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [participant, session, externalTimeLeft]);

  const timeLeft = externalTimeLeft !== undefined ? externalTimeLeft : localTimeLeft;

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSubmitted = session?.status === 'submitted';

  const stages: { stage: InvestigationStage; label: string; short: string }[] = [
    { stage: 1, label: 'Stage 1: The Crime Scene', short: '01 Scene' },
    { stage: 2, label: 'Stage 2: CCTV Recordings', short: '02 CCTV' },
    { stage: 3, label: 'Stage 3: Suspect Files', short: '03 Suspects' },
    { stage: 4, label: 'Stage 4: Evidence Board', short: '04 Evidence' },
    { stage: 5, label: 'Stage 5: Final Verdict', short: '05 Verdict' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#f5f0e6]/95 backdrop-blur-md border-b border-[#cfc7b7] text-[#1c1917] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand */}
        <div 
          className="flex items-center cursor-pointer group py-1 shrink-0" 
          onClick={() => onNavigateStage(participant ? 1 : 0)}
        >
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display font-black tracking-wide text-[#1c1917] text-xl group-hover:text-blue-900 transition">
                CASE ZERO
              </span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-200/90 text-amber-900 border border-amber-300 font-bold">
                FORENSIC HUD
              </span>
            </div>
            <p className="text-[11px] text-stone-600 hidden lg:block tracking-wide font-medium">
              Frostpeak Conservatory Murder Investigation
            </p>
          </div>
        </div>

        {/* Stage Progress Pills (All unlocked once registered so users don't get stuck) */}
        {participant && (
          <nav className="hidden md:flex items-center space-x-1.5 lg:space-x-2">
            {stages.map((s) => {
              const isCurrent = currentStage === s.stage;
              const isVerdictSubmitted = isSubmitted && s.stage === 5;

              return (
                <button
                  key={s.stage}
                  onClick={() => {
                    soundFX.playCameraSwitch();
                    onNavigateStage(s.stage);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono tracking-wider transition-all flex items-center space-x-1.5 ${
                    isCurrent
                      ? 'bg-blue-800 text-white border border-blue-900 shadow-sm font-bold'
                      : 'bg-[#e6dfd2] text-stone-800 hover:text-stone-950 hover:bg-[#ded6c7] border border-[#cfc7b7] font-semibold'
                  }`}
                >
                  <span>{s.short}</span>
                  {isVerdictSubmitted && (
                    <Lock className="w-3 h-3 text-emerald-700" />
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Tools & 15-Minute Countdown Timer */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          
          {/* 15-Minute Countdown Timer */}
          {participant && (
            <div
              title="15-Minute Investigation Time Limit"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-bold border transition-all shadow-sm ${
                isSubmitted
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                  : timeLeft <= 120
                  ? 'bg-red-100 text-red-950 border-red-400 animate-pulse'
                  : timeLeft <= 300
                  ? 'bg-amber-100 text-amber-950 border-amber-400'
                  : 'bg-[#e6dfd2] text-stone-900 border-[#cfc7b7]'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 ${!isSubmitted && timeLeft <= 120 ? 'text-red-700 animate-spin' : 'text-stone-700'}`} />
              <span className="font-mono text-sm tracking-wide">
                {isSubmitted ? 'SUBMITTED' : formatTimer(timeLeft)}
              </span>
              <span className="text-[10px] text-stone-600 uppercase font-semibold hidden sm:inline">
                {isSubmitted ? 'SEALED' : 'LEFT'}
              </span>
            </div>
          )}

          {/* Active Participant info */}
          {participant && (
            <div className="hidden sm:flex items-center space-x-2 text-xs font-mono bg-[#e6dfd2] px-3 py-1.5 rounded-lg border border-[#cfc7b7] shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              <span className="text-stone-600 font-semibold">AGENT:</span>
              <span className="text-blue-900 font-bold truncate max-w-[100px] lg:max-w-[130px]">
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
              onClick={() => onNavigateStage(s.stage)}
              className={`px-2.5 py-1 rounded-md whitespace-nowrap mr-1.5 ${
                currentStage === s.stage
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : 'text-stone-800 bg-[#f5f0e6] border border-[#cfc7b7] font-medium'
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
