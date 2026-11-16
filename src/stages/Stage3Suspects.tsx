import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, AlertOctagon, Briefcase, FileText, 
  ArrowRight, CheckCircle2, ChevronRight, MessageSquareQuote, Edit3, Bookmark, ShieldAlert 
} from 'lucide-react';
import { INITIAL_SUSPECTS } from '../lib/caseData';
import { Suspect } from '../types';
import { soundFX } from '../lib/audioService';

interface Stage3SuspectsProps {
  suspectNotes: Record<string, string>;
  onSaveSuspectNote: (suspectId: string, note: string) => void;
  onProceed: () => void;
}

export const Stage3Suspects: React.FC<Stage3SuspectsProps> = ({
  suspectNotes,
  onSaveSuspectNote,
  onProceed,
}) => {
  const [selectedSuspect, setSelectedSuspect] = useState<Suspect>(INITIAL_SUSPECTS[0]);
  const [activeTab, setActiveTab] = useState<'statement' | 'clothing' | 'belongings' | 'motive'>('statement');
  const [currentNote, setCurrentNote] = useState<string>(suspectNotes[selectedSuspect.id] || '');
  const [noteSaved, setNoteSaved] = useState(false);

  const handleSelect = (s: Suspect) => {
    soundFX.playCameraSwitch();
    setSelectedSuspect(s);
    setCurrentNote(suspectNotes[s.id] || '');
    setNoteSaved(false);
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentNote(e.target.value);
    setNoteSaved(false);
  };

  const handleSaveNote = () => {
    onSaveSuspectNote(selectedSuspect.id, currentNote);
    setNoteSaved(true);
    soundFX.playClueFound();
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc7b7] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-900 font-mono text-xs tracking-wider font-bold">
            <span>STAGE 03 OF 05</span>
            <span>//</span>
            <span>PERSONS OF INTEREST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1c1917] mt-1">
            EXAMINE THE FOUR SUSPECTS
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-sans">
            Analyze suspect statements, physical clothing against CCTV captures, carried equipment, verified alibis, and hidden motives.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e6] border border-[#cfc7b7] text-stone-800 shadow-sm font-semibold">
            DOSSIERS: <strong className="text-blue-900 font-bold">4 VERIFIED</strong>
          </span>
        </div>
      </div>

      {/* Suspect Selector Cards (4 Columns) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {INITIAL_SUSPECTS.map((suspect) => {
          const isSelected = selectedSuspect.id === suspect.id;
          const hasNote = Boolean(suspectNotes[suspect.id]);

          return (
            <div
              key={suspect.id}
              onClick={() => handleSelect(suspect)}
              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 relative bg-[#f5f0e6] shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-2 border-blue-900 ring-2 ring-blue-300 shadow-md bg-[#eee7db]'
                  : 'border-[#cfc7b7] hover:border-[#b8b09f]'
              }`}
            >
              {/* Portrait Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#e6dfd2]">
                <img
                  src={suspect.portrait_url}
                  alt={suspect.display_name}
                  className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                />
                
                {/* Note Indicator Tag */}
                {hasNote && (
                  <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-blue-800 text-white shadow-md">
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>

              {/* Clear Info Banner Below Image */}
              <div className="p-3 bg-[#f5f0e6] border-t border-[#cfc7b7]">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-900 font-bold">
                  SUSPECT 0{suspect.display_order}
                </span>
                <h3 className="text-base font-bold font-display text-[#1c1917] leading-tight">
                  {suspect.display_name}
                </h3>
                <p className="text-xs text-stone-600 truncate font-sans font-medium mt-0.5">
                  {suspect.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* At-A-Glance Suspect Alibi & Exoneration Matrix for 15-Minute Solving */}
      <div className="bg-[#f5f0e6] border border-[#cfc7b7] p-4 rounded-xl shadow-sm font-mono text-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-2">
          <span className="text-blue-950 font-bold flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-800" />
            <span>SUSPECT ALIBI VERIFICATION & MOTIVE SUMMARY</span>
          </span>
          <span className="text-[11px] text-stone-600 font-semibold">
            CROSS-REFERENCE TO IDENTIFY FALSE ALIBI
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-1">
            <span className="font-bold text-stone-900 text-xs block">1. CLARA STERLING</span>
            <p className="text-stone-700"><strong>Alibi:</strong> Checked radiator at 11:05 PM, exited 11:08 PM.</p>
            <p className="text-emerald-800 font-semibold">✓ Corroborated by CAM 2 & heater telemetry.</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">EXONERATED</span>
          </div>

          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-1">
            <span className="font-bold text-stone-900 text-xs block">2. VICTOR THORNE</span>
            <p className="text-stone-700"><strong>Alibi:</strong> Side door locked at 10:50 PM; at Lobby Bar 11:00–11:30 PM.</p>
            <p className="text-emerald-800 font-semibold">✓ Corroborated by bar footage & unbroken frost on door.</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">EXONERATED</span>
          </div>

          <div className="p-3 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-1">
            <span className="font-bold text-stone-900 text-xs block">3. CHEF MARCO</span>
            <p className="text-stone-700"><strong>Alibi:</strong> Delivered tea at 11:00 PM, returned to kitchen.</p>
            <p className="text-emerald-800 font-semibold">✓ Corroborated by kitchen records; teapot was pure.</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold">EXONERATED</span>
          </div>

          <div className="p-3 rounded-xl bg-red-100 border-2 border-red-400 space-y-1 shadow-sm">
            <span className="font-black text-red-950 text-xs block">4. DR. EVELYN HAYES ⚠</span>
            <p className="text-red-900"><strong>Claimed Alibi:</strong> Alone in B-Wing Lab 11:00–11:25 PM.</p>
            <p className="text-red-950 font-bold">✗ CONTRADICTED: CCTV shows passage transit at 11:12 & 11:18 PM with glowing cloth. Zero lab activity 11:00–11:22 PM.</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded bg-red-700 text-white text-[10px] font-bold uppercase">PRIMARY SUSPECT // FALSE ALIBI</span>
          </div>
        </div>
      </div>

      {/* Selected Suspect Deep Dive Dossier */}
      <div className="bg-[#f5f0e6] border border-[#cfc7b7] rounded-2xl overflow-hidden shadow-sm">
        
        {/* Dossier Header */}
        <div className="p-6 bg-[#eae4d8] border-b border-[#cfc7b7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#cfc7b7] shrink-0 shadow-sm bg-white">
              <img
                src={selectedSuspect.portrait_url}
                alt={selectedSuspect.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-300 text-blue-950 font-mono text-[10px] font-bold">
                  SUBJECT DOSSIER // 0{selectedSuspect.display_order}
                </span>
              </div>
              <h2 className="text-2xl font-black font-display text-[#1c1917] mt-1">
                {selectedSuspect.display_name}
              </h2>
              <p className="text-xs font-mono text-stone-700 font-semibold">
                {selectedSuspect.role}
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-[#e2dbce] p-1.5 rounded-xl border border-[#cfc7b7] font-mono text-xs overflow-x-auto">
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('statement');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                activeTab === 'statement'
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : 'text-stone-800 hover:text-stone-950 hover:bg-[#d6cebf]'
              }`}
            >
              STATEMENT & ALIBI
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('clothing');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                activeTab === 'clothing'
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : 'text-stone-800 hover:text-stone-950 hover:bg-[#d6cebf]'
              }`}
            >
              ATTIRE (CCTV MATCH)
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('belongings');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                activeTab === 'belongings'
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : 'text-stone-800 hover:text-stone-950 hover:bg-[#d6cebf]'
              }`}
            >
              BELONGINGS
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('motive');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                activeTab === 'motive'
                  ? 'bg-blue-800 text-white font-bold shadow-sm'
                  : 'text-stone-800 hover:text-stone-950 hover:bg-[#d6cebf]'
              }`}
            >
              MOTIVE AUDIT
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Dossier Details (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Background Narrative */}
            <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-1.5">
              <span className="text-[11px] font-mono text-blue-950 uppercase font-bold">
                BACKGROUND SUMMARY
              </span>
              <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-sans font-medium">
                {selectedSuspect.public_profile.background}
              </p>
            </div>

            {/* Dynamic Tab Body */}
            {activeTab === 'statement' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-2">
                  <div className="flex items-center space-x-2 text-blue-950 font-mono text-xs font-bold">
                    <MessageSquareQuote className="w-4 h-4 text-blue-800" />
                    <span>OFFICIAL VERBATIM STATEMENT</span>
                  </div>
                  <blockquote className="text-sm font-sans italic text-stone-900 border-l-4 border-amber-600 pl-3 py-1 leading-relaxed bg-[#fbf9f5] p-3 rounded-r-lg border-y border-r border-[#cfc7b7]">
                    “{selectedSuspect.public_profile.statement}”
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-950 font-mono text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    <span>FORENSIC ALIBI VERIFICATION</span>
                  </div>
                  <p className="text-xs text-stone-800 leading-relaxed font-sans font-medium bg-[#fbf9f5] p-3 rounded-lg border border-[#cfc7b7]">
                    {selectedSuspect.public_profile.alibi}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'clothing' && (
              <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-3">
                <div className="flex items-center space-x-2 text-blue-950 font-mono text-xs font-bold">
                  <FileText className="w-4 h-4 text-blue-800" />
                  <span>VERIFIED APPAREL ON INCIDENT NIGHT</span>
                </div>
                <p className="text-sm text-stone-800 font-sans leading-relaxed bg-[#fbf9f5] p-3 rounded-lg border border-[#cfc7b7] font-medium">
                  {selectedSuspect.public_profile.clothing}
                </p>
                <div className="p-3 rounded-lg bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-mono space-y-1">
                  <strong className="block text-amber-900 font-bold">FORENSIC CORRELATION TIP:</strong>
                  <span>Cross-check this attire against CAM 3 & CAM 4 corridor movements (11:12 PM – 11:18 PM), the green tartan snag on the side service door, and the snow-boot footprints near the heater.</span>
                </div>
              </div>
            )}

            {activeTab === 'belongings' && (
              <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-3">
                <div className="flex items-center space-x-2 text-blue-950 font-mono text-xs font-bold">
                  <Briefcase className="w-4 h-4 text-blue-800" />
                  <span>GEAR & TOOLS CARRIED DURING INCIDENT</span>
                </div>
                <p className="text-sm text-stone-800 font-sans leading-relaxed bg-[#fbf9f5] p-3 rounded-lg border border-[#cfc7b7] font-medium">
                  {selectedSuspect.public_profile.belongings}
                </p>
                <div className="p-3 rounded-lg bg-[#e2dbce] border border-[#cfc7b7] text-stone-800 text-xs font-mono font-medium">
                  <span>Pay close attention to B-Wing electronic keycards, tea service trays, sampling tweezers, and latex gloves that carry bioluminescent orchid residue.</span>
                </div>
              </div>
            )}

            {activeTab === 'motive' && (
              <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-3">
                <div className="flex items-center space-x-2 text-red-900 font-mono text-xs font-bold">
                  <AlertOctagon className="w-4 h-4 text-red-700" />
                  <span>POTENTIAL MOTIVE ASSESSMENT</span>
                </div>
                <p className="text-sm text-stone-800 font-sans leading-relaxed bg-[#fbf9f5] p-3 rounded-lg border border-[#cfc7b7] font-medium">
                  {selectedSuspect.public_profile.possible_motive}
                </p>
                <div className="p-3 rounded-lg bg-red-100/80 border border-red-300 text-red-900 text-xs font-mono font-medium">
                  <span>Ask yourself: Who had the motive and chemical means to synthesize the Midnight Orchid toxin and poison Dr. Vance's tea?</span>
                </div>
              </div>
            )}

          </div>

          {/* Detective Personal Notes Sidebar (Span 1) */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] space-y-3">
              <div className="flex items-center justify-between text-blue-950 font-mono text-xs">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Edit3 className="w-3.5 h-3.5 text-blue-800" />
                  <span>INVESTIGATOR'S LOG</span>
                </span>
                {noteSaved && (
                  <span className="text-emerald-800 flex items-center space-x-1 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                    <span>SAVED</span>
                  </span>
                )}
              </div>

              <textarea
                value={currentNote}
                onChange={handleNoteChange}
                placeholder={`Type your investigative observations about ${selectedSuspect.display_name}...`}
                rows={5}
                className="w-full bg-[#faf7f2] border-2 border-[#cfc7b7] focus:border-blue-800 focus:ring-1 focus:ring-blue-200 rounded-xl p-3 text-xs text-[#1c1917] placeholder-stone-400 font-mono outline-none resize-none shadow-inner"
              />

              <button
                onClick={handleSaveNote}
                className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-mono text-xs font-bold transition shadow-sm"
              >
                SAVE LOG FOR {selectedSuspect.display_name.toUpperCase()}
              </button>
            </div>

            {/* Suspect Quick Comparison Box */}
            <div className="p-3.5 rounded-xl bg-[#e6dfd2] border border-[#cfc7b7] text-[11px] font-mono text-stone-700 space-y-1.5">
              <span className="text-stone-900 font-bold block">QUICK JUMP:</span>
              <div className="space-y-1">
                {INITIAL_SUSPECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                      selectedSuspect.id === s.id ? 'bg-blue-100 text-blue-950 font-bold border border-blue-300' : 'hover:bg-[#dfd7c8] text-stone-800'
                    }`}
                  >
                    <span>{s.display_name}</span>
                    <ChevronRight className="w-3 h-3 text-stone-500" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#cfc7b7] bg-[#f5f0e6] p-6 rounded-2xl shadow-sm">
        <p className="text-xs font-mono text-stone-700 font-medium">
          All 4 suspects reviewed? Proceed to the Interactive Evidence Board to pin clues and map timeline events.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>PROCEED TO STAGE 04: EVIDENCE BOARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
