import React, { useState } from 'react';
import { ShieldAlert, ArrowRight, Video, Search, Users, Database, Fingerprint, Lock } from 'lucide-react';
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
            REF: MERIDIAN-2026-B4
          </span>
        </div>

        {/* Title & Tagline matching Prompt Specification */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-block px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs tracking-widest">
            THE VISUAL MYSTERY CHALLENGE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
            CASE ZERO
          </h1>
          <p className="text-sm sm:text-base font-medium text-amber-500/90 tracking-wide font-sans italic">
            “Every Detail Tells a Story. Can You Find the Truth?”
          </p>
          <p className="text-sm text-gray-400 max-w-md mx-auto pt-2">
            An incident has occurred. The truth is hidden in what you see.
          </p>
        </div>

        {/* Brief Incident Context */}
        <div className="bg-charcoal-950/60 border border-charcoal-800/80 rounded-lg p-4 mb-8 text-xs font-mono text-gray-400 space-y-1.5">
          <div className="flex justify-between text-gray-300 pb-1 border-b border-charcoal-800">
            <span className="text-amber-500">LOCATION:</span>
            <span>Meridian Innovation Hall — Tech Exhibition</span>
          </div>
          <div className="flex justify-between text-gray-300 pb-1 border-b border-charcoal-800">
            <span className="text-amber-500">INCIDENT TIME:</span>
            <span>20:14:12 – 20:15:26 (74 Seconds Outage)</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span className="text-amber-500">MISSING ASSET:</span>
            <span className="text-red-400 font-semibold">Emergency Communication Prototype “AURORA”</span>
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
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name to generate session..."
                disabled={loading}
                className="w-full bg-charcoal-950 border border-charcoal-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-lg px-4 py-3.5 text-sm text-white placeholder-gray-600 font-mono transition outline-none"
                autoFocus
              />
              <Fingerprint className="absolute right-3.5 top-3.5 w-5 h-5 text-gray-600" />
            </div>
            <p className="text-[11px] text-gray-500 mt-1.5 font-mono">
              No email or phone number required. Your name is bound to your encrypted investigation session.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-800/70 text-red-300 text-xs font-mono flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-charcoal-950 font-bold font-mono tracking-wider py-4 rounded-lg flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <span className="w-4 h-4 border-2 border-charcoal-950 border-t-transparent rounded-full animate-spin"></span>
                <span>INITIALIZING FORENSIC HUD...</span>
              </span>
            ) : (
              <>
                <span>START INVESTIGATION</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-8 pt-6 border-t border-charcoal-800/80 text-[11px] font-mono text-gray-400">
          <div className="flex items-center space-x-1.5 p-2 rounded bg-charcoal-950/40 border border-charcoal-800/60">
            <Video className="w-3.5 h-3.5 text-amber-500" />
            <span>Cinematic CCTV</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded bg-charcoal-950/40 border border-charcoal-800/60">
            <Search className="w-3.5 h-3.5 text-amber-500" />
            <span>Evidence Board</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded bg-charcoal-950/40 border border-charcoal-800/60">
            <Users className="w-3.5 h-3.5 text-amber-500" />
            <span>4 Suspects</span>
          </div>
          <div className="flex items-center space-x-1.5 p-2 rounded bg-charcoal-950/40 border border-charcoal-800/60">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>Locked Submission</span>
          </div>
        </div>

      </div>
    </div>
  );
};
