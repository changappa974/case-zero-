import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Video, Search, Users, Database, Fingerprint, Lock, Compass } from 'lucide-react';
import { registerParticipant } from '../lib/supabase';
import { Participant, InvestigationSession } from '../types';
import { soundFX } from '../lib/audioService';

interface Stage0RegistrationProps {
  onStart: (participant: Participant, session: InvestigationSession) => void;
}

export const Stage0Registration: React.FC<Stage0RegistrationProps> = ({ onStart }) => {
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = fullName.trim();
    if (!trimmed) {
      setErrorMessage('Please enter your full name to proceed with authorization.');
      soundFX.playAlertBeep();
      return;
    }

    setLoading(true);
    setErrorMessage('');
    soundFX.playCameraSwitch();

    try {
      const { participant, session } = await registerParticipant(trimmed);
      soundFX.playClueFound();
      soundFX.startAmbientHum();
      onStart(participant, session);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
      soundFX.playAlertBeep();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2430_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>

      <div className="relative w-full max-w-2xl bg-charcoal-900/90 border border-charcoal-800 rounded-xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Forensic Classification Stamp */}
        <div className="flex items-center justify-between border-b border-charcoal-800 pb-4 mb-6">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
            <span className="text-xs font-mono uppercase tracking-widest text-red-500 font-semibold">
              CLASSIFIED DOSSIER // RESTRICTED ACCESS
            </span>
          </div>
          <span className="text-[11px] font-mono text-gray-500">
            REF: FROSTPEAK-2026-CASE-0
          </span>
        </div>

        {/* Title & Tagline matching Prompt Specification */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-block px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-widest uppercase">
            THE VISUAL MYSTERY CHALLENGE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
            CASE ZERO
          </h1>
          <p className="text-sm sm:text-base font-medium text-amber-500/90 tracking-wide font-sans italic">
            “Every Detail Tells a Story. Can You Find the Truth?”
          </p>
          <p className="text-sm text-gray-300 max-w-md mx-auto pt-2">
            An incident has occurred. The truth is hidden in what you see.
          </p>
        </div>

        {/* Brief Incident Context */}
        <div className="bg-charcoal-950/70 border border-charcoal-800/80 rounded-lg p-4 mb-8 text-xs font-mono text-gray-400 space-y-2">
          <div className="flex justify-between text-gray-300 pb-1.5 border-b border-charcoal-800/80">
            <span className="text-amber-500">CASE FILE:</span>
            <span className="text-white font-semibold">MURDER AT FROSTPEAK CONSERVATORY</span>
          </div>
          <div className="flex justify-between text-gray-300 pb-1.5 border-b border-charcoal-800/80">
            <span className="text-amber-500">LOCATION:</span>
            <span>Frostpeak Conservatory & B-Wing Laboratory</span>
          </div>
          <div className="flex justify-between text-gray-300 pb-1.5 border-b border-charcoal-800/80">
            <span className="text-amber-500">INCIDENT TIME:</span>
            <span>23:24:00 (Surveillance Window: 22:50 – 23:30)</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span className="text-amber-500">INCIDENT:</span>
            <span className="text-red-400 font-semibold">Dr. Arthur Vance found deceased with poisoned tea & glowing blue orchid pollen</span>
          </div>
        </div>

        {/* Form: Full Name Only */}
        <form onSubmit={handleStart} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-xs font-mono tracking-wider uppercase text-gray-300 mb-2">
              Participant Full Name <span className="text-red-500">*</span>
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
                className="w-full bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-4 py-3 text-sm font-mono text-white placeholder-gray-600 transition"
                autoFocus
              />
            </div>
            {errorMessage && (
              <p className="mt-2 text-xs font-mono text-red-400 flex items-center space-x-1">
                <span>⚠</span>
                <span>{errorMessage}</span>
              </p>
            )}
            <p className="mt-2 text-[11px] font-mono text-gray-500">
              Your name links to your secure investigation session and final submission receipt. No email, phone, or password required.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full group relative flex items-center justify-center space-x-2 bg-gradient-to-r from-red-700 via-amber-600 to-amber-500 hover:from-red-600 hover:to-amber-400 text-charcoal-950 font-mono font-bold text-sm tracking-wider uppercase py-3.5 px-6 rounded-lg shadow-lg hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            <span>{loading ? 'INITIALIZING INVESTIGATION...' : 'START INVESTIGATION'}</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition" />
          </button>
        </form>

        {/* Visual Pillars */}
        <div className="grid grid-cols-3 gap-3 pt-6 mt-6 border-t border-charcoal-800/80 text-center font-mono text-[11px] text-gray-400">
          <div className="p-2 rounded bg-charcoal-950/40 border border-charcoal-800/50">
            <Video className="w-4 h-4 mx-auto mb-1 text-amber-500/80" />
            <span>Cinematic Scene</span>
          </div>
          <div className="p-2 rounded bg-charcoal-950/40 border border-charcoal-800/50">
            <Search className="w-4 h-4 mx-auto mb-1 text-amber-500/80" />
            <span>Forensic Evidence</span>
          </div>
          <div className="p-2 rounded bg-charcoal-950/40 border border-charcoal-800/50">
            <Users className="w-4 h-4 mx-auto mb-1 text-amber-500/80" />
            <span>4 Real Suspects</span>
          </div>
        </div>

      </div>
    </div>
  );
};
