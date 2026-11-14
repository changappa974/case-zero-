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
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#1c1917] font-mono">
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
              <p className="mt-2 text-xs font-mono text-red-700 font-bold flex items-center space-x-1">
                <span>⚠</span>
                <span>{errorMessage}</span>
              </p>
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
