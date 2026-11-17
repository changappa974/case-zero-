import React, { useState, useEffect } from 'react';
import { ShieldAlert, ArrowRight, Video, Search, Users, Database, Fingerprint, Lock, KeyRound, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { registerParticipant, isStationLocked, unlockStation } from '../lib/supabase';
import { Participant, InvestigationSession } from '../types';
import { soundFX } from '../lib/audioService';

interface Stage0RegistrationProps {
  onStart: (participant: Participant, session: InvestigationSession) => void;
}

export const Stage0Registration: React.FC<Stage0RegistrationProps> = ({ onStart }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [stationLocked, setStationLocked] = useState<boolean>(false);
  const [organizerPasscode, setOrganizerPasscode] = useState('');
  const [passcodeError, setPasscodeError] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState(false);

  useEffect(() => {
    setStationLocked(isStationLocked());
  }, []);

  const handleUnlockStation = (e: React.FormEvent) => {
    e.preventDefault();
    setPasscodeError('');
    if (!organizerPasscode.trim()) {
      setPasscodeError('Please enter the organizer passcode.');
      soundFX.playAlertBeep();
      return;
    }

    const success = unlockStation(organizerPasscode);
    if (success) {
      soundFX.playClueFound();
      setPasscodeSuccess(true);
      setTimeout(() => {
        setStationLocked(false);
        setPasscodeSuccess(false);
        setOrganizerPasscode('');
        setErrorMessage('');
      }, 700);
    } else {
      soundFX.playAlertBeep();
      setPasscodeError('Invalid organizer passcode. Station remains locked.');
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your full name to proceed with authorization.');
      soundFX.playAlertBeep();
      return;
    }

    // Secondary safety check for station lock
    if (isStationLocked()) {
      setStationLocked(true);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    soundFX.playCameraSwitch();

    try {
      const { participant, session } = await registerParticipant(trimmed);
      soundFX.playClueFound();
      soundFX.startAmbientHum();

      // Forced Fullscreen Mode (Kiosk Mode) trigger on Start Investigation
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if ((document.documentElement as any).webkitRequestFullscreen) {
          (document.documentElement as any).webkitRequestFullscreen();
        }
      } catch (e) {}

      onStart(participant, session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      soundFX.playAlertBeep();
    } finally {
      setLoading(false);
    }
  };

  // If this device / browser has already completed a submission
  if (stationLocked) {
    return (
      <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#ede7dc]">
        <div className="absolute inset-0 bg-[radial-gradient(#b8b09f_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

        <div className="relative w-full max-w-xl bg-[#f5f0e6] border-2 border-red-400 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-4 mb-6">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              <span className="text-xs font-mono uppercase tracking-widest text-red-900 font-bold bg-red-100 px-3 py-1 rounded-full border border-red-300">
                STATION LOCKED // SUBMISSION RECORDED
              </span>
            </div>
            <Lock className="w-5 h-5 text-red-700" />
          </div>

          {/* Exact Required Lock Headline */}
          <div className="text-center space-y-3 mb-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-100 border border-red-300 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-red-700 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#1c1917] font-display">
              Investigation already completed on this station.
            </h1>
            <p className="text-sm text-stone-700 font-sans leading-relaxed max-w-md mx-auto">
              A Case Zero investigation submission has already been recorded and sealed on this browser terminal. To prevent retakes and preserve competition integrity, access is restricted.
            </p>
          </div>

          {/* Organizer Unlock Box */}
          <div className="mt-8 bg-[#e6dfd2] border border-[#cfc7b7] rounded-xl p-5 shadow-inner">
            <div className="flex items-center space-x-2 mb-3">
              <KeyRound className="w-4 h-4 text-amber-900" />
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-amber-950">
                Organizer / Proctor Unlock Gate
              </h3>
            </div>
            <p className="text-xs text-stone-700 font-sans mb-4">
              If you are an event judge or proctor preparing this PC station for the next participant, enter the organizer passcode below to unlock:
            </p>

            <form onSubmit={handleUnlockStation} className="space-y-3">
              <div>
                <input
                  type="password"
                  value={organizerPasscode}
                  onChange={(e) => {
                    setOrganizerPasscode(e.target.value);
                    if (passcodeError) setPasscodeError('');
                  }}
                  placeholder="Enter organizer passcode"
                  className="w-full bg-[#faf7f2] border-2 border-[#cfc7b7] focus:border-blue-800 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-2.5 text-sm font-mono text-[#1c1917] placeholder-stone-400 font-semibold"
                />
              </div>

              {passcodeError && (
                <p className="text-xs font-mono text-red-700 font-bold flex items-center space-x-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{passcodeError}</span>
                </p>
              )}

              {passcodeSuccess && (
                <p className="text-xs font-mono text-emerald-800 font-bold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Station unlocked! Initializing clean registration terminal...</span>
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-amber-800 hover:bg-amber-900 text-white font-mono font-bold text-xs tracking-wider uppercase rounded-xl transition shadow-sm hover:shadow"
              >
                UNLOCK STATION FOR NEXT DETECTIVE
              </button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <a
              href="/leaderboard"
              className="text-xs font-mono text-blue-900 hover:text-blue-950 underline font-bold"
            >
              Go to Live Event Leaderboard &rarr;
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#ede7dc]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#b8b09f_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-[#f5f0e6] border border-[#cfc7b7] rounded-2xl p-6 sm:p-10 shadow-lg backdrop-blur-xl">
        
        {/* Forensic Classification Stamp */}
        <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-red-800 font-bold bg-red-100/80 px-2.5 py-1 rounded-full border border-red-300">
              CLASSIFIED DOSSIER // RESTRICTED ACCESS
            </span>
          </div>
          <span className="text-[11px] font-mono text-stone-600 font-semibold">
            REF: FROSTPEAK-2026-CASE-0
          </span>
        </div>

        {/* Title & Tagline */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-amber-200/90 border border-amber-400 text-amber-950 font-mono text-xs tracking-widest uppercase font-bold">
            THE VISUAL MYSTERY CHALLENGE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1c1917] font-display">
            CASE ZERO
          </h1>
          <p className="text-base sm:text-lg font-semibold text-amber-900 tracking-wide font-sans italic">
            “Every Detail Tells a Story. Can You Find the Truth?”
          </p>
          <p className="text-sm text-stone-700 max-w-md mx-auto pt-1 font-medium">
            An incident has occurred. The truth is hidden in what you see.
          </p>
        </div>

        {/* Incident Summary Card */}
        <div className="bg-[#e6dfd2] border border-[#cfc7b7] rounded-xl p-4 mb-8 text-xs font-mono text-stone-800 space-y-2.5">
          <div className="flex justify-between pb-2 border-b border-[#cfc7b7]">
            <span className="text-amber-900 font-bold">CASE FILE:</span>
            <span className="text-[#1c1917] font-bold">MURDER AT FROSTPEAK CONSERVATORY</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#cfc7b7]">
            <span className="text-amber-900 font-bold">LOCATION:</span>
            <span className="font-semibold text-stone-800">Frostpeak Conservatory & B-Wing Laboratory</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#cfc7b7]">
            <span className="text-amber-900 font-bold">INCIDENT TIME:</span>
            <span className="font-semibold text-stone-800">23:24:00 (Surveillance Window: 22:50 – 23:30)</span>
          </div>
          <div className="flex justify-between pb-2 border-b border-[#cfc7b7] bg-amber-100/70 -mx-4 px-4 py-1.5 rounded-lg">
            <span className="text-amber-950 font-bold flex items-center space-x-1">
              <span>⏱️ TIME LIMIT:</span>
            </span>
            <span className="text-amber-950 font-black">15 MINUTES (Live countdown begins on start)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-amber-900 font-bold">INCIDENT:</span>
            <span className="text-red-800 font-bold">Dr. Arthur Vance found deceased with poisoned tea & glowing blue orchid pollen</span>
          </div>
        </div>

        {/* Form: Full Name Only */}
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-mono tracking-wider uppercase text-stone-900 font-bold mb-2">
              Participant Full Name <span className="text-red-700">*</span>
            </label>
            <div className="relative">
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                placeholder="e.g., Detective Alex Mercer"
                maxLength={60}
                disabled={loading}
                className="w-full bg-[#faf7f2] border-2 border-[#cfc7b7] focus:border-blue-800 focus:ring-2 focus:ring-blue-200 rounded-xl px-4 py-3 text-base font-mono text-[#1c1917] placeholder-stone-400 font-semibold shadow-inner transition"
                autoFocus
              />
            </div>
            {errorMessage && (
              <div className="mt-3 p-3.5 rounded-xl bg-red-100 border border-red-300 text-red-900 font-mono text-xs font-bold flex items-start space-x-2.5 shadow-sm animate-pulse">
                <AlertTriangle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="block uppercase tracking-wider text-[10px] text-red-700">AUTHORIZATION DENIED</span>
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              </div>
            )}
            <p className="mt-2 text-[11px] font-mono text-stone-600">
              Your name links to your secure investigation session and final submission receipt. No email, phone, or password required.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative flex items-center justify-center space-x-2 bg-blue-800 hover:bg-blue-900 text-white font-mono font-bold text-sm tracking-wider uppercase py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{loading ? 'INITIALIZING INVESTIGATION...' : 'START INVESTIGATION'}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </button>
        </form>

        {/* Visual Pillars */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-[#cfc7b7] text-center font-mono text-xs text-stone-700">
          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7]">
            <Video className="w-4 h-4 mx-auto mb-1 text-blue-800" />
            <span className="font-semibold text-stone-900">Cinematic Scene</span>
          </div>
          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7]">
            <Search className="w-4 h-4 mx-auto mb-1 text-amber-800" />
            <span className="font-semibold text-stone-900">Forensic Clues</span>
          </div>
          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7]">
            <Users className="w-4 h-4 mx-auto mb-1 text-emerald-800" />
            <span className="font-semibold text-stone-900">4 Real Suspects</span>
          </div>
        </div>

      </div>
    </div>
  );
};
