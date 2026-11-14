import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, AlertOctagon, Briefcase, FileText, 
  ArrowRight, CheckCircle2, ChevronRight, MessageSquareQuote, Edit3, Bookmark 
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 03 OF 05</span>
            <span>//</span>
            <span>PERSONS OF INTEREST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            EXAMINE THE FOUR SUSPECTS
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-sans">
            Analyze suspect statements, physical clothing against CCTV captures, carried equipment, verified alibis, and hidden motives.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-700 text-gray-300">
            DOSSIERS: <strong className="text-amber-400">4 VERIFIED</strong>
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
              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 relative bg-charcoal-900 shadow-xl ${
                isSelected
                  ? 'border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
                  : 'border-charcoal-800 hover:border-charcoal-700 hover:bg-charcoal-850'
              }`}
            >
              {/* Portrait Aspect Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal-950">
                <img
                  src={suspect.portrait_url}
                  alt={suspect.display_name}
                  className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                />
                
                {/* Note Indicator Tag */}
                {hasNote && (
                  <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-amber-500 text-charcoal-950 shadow-md">
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}

                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-950/20 to-transparent"></div>

                <div className="absolute bottom-2.5 left-3 right-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                    SUSPECT 0{suspect.display_order}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold font-mono text-white leading-tight">
                    {suspect.display_name}
                  </h3>
                  <p className="text-[11px] text-gray-300 truncate font-sans">
                    {suspect.role}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Suspect Deep Dive Dossier */}
      <div className="bg-charcoal-900 border border-charcoal-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Dossier Header */}
        <div className="p-6 bg-charcoal-950/90 border-b border-charcoal-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-500/50 shrink-0 shadow-md">
              <img
                src={selectedSuspect.portrait_url}
                alt={selectedSuspect.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                  SUBJECT DOSSIER // 0{selectedSuspect.display_order}
                </span>
              </div>
              <h2 className="text-2xl font-black font-mono text-white mt-1">
                {selectedSuspect.display_name}
              </h2>
              <p className="text-xs font-mono text-gray-400">
                {selectedSuspect.role}
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-charcoal-900 p-1.5 rounded-xl border border-charcoal-800 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('statement');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'statement'
                  ? 'bg-amber-500 text-charcoal-950 font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              STATEMENT & ALIBI
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('clothing');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'clothing'
                  ? 'bg-amber-500 text-charcoal-950 font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              ATTIRE (CCTV MATCH)
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('belongings');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'belongings'
                  ? 'bg-amber-500 text-charcoal-950 font-bold shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              BELONGINGS
            </button>
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('motive');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
                activeTab === 'motive'
                  ? 'bg-amber-500 text-charcoal-950 font-bold shadow'
                  : 'text-gray-400 hover:text-white'
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
            <div className="p-4 rounded-xl bg-charcoal-950/60 border border-charcoal-800 space-y-1.5">
              <span className="text-[11px] font-mono text-amber-500 uppercase font-semibold">
                BACKGROUND SUMMARY
              </span>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
                {selectedSuspect.public_profile.background}
              </p>
            </div>

            {/* Dynamic Tab Body */}
            {activeTab === 'statement' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
                  <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs">
                    <MessageSquareQuote className="w-4 h-4" />
                    <span className="font-bold">OFFICIAL VERBATIM STATEMENT</span>
                  </div>
                  <blockquote className="text-sm font-sans italic text-gray-200 border-l-2 border-amber-500 pl-3 py-1 leading-relaxed">
                    “{selectedSuspect.public_profile.statement}”
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-2">
                  <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="font-bold">FORENSIC ALIBI VERIFICATION</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed font-sans">
                    {selectedSuspect.public_profile.alibi}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'clothing' && (
              <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs">
                  <FileText className="w-4 h-4" />
                  <span className="font-bold">VERIFIED APPAREL ON INCIDENT NIGHT</span>
                </div>
                <p className="text-sm text-gray-200 font-sans leading-relaxed">
                  {selectedSuspect.public_profile.clothing}
                </p>
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs font-mono space-y-1">
                  <strong className="block text-amber-400">FORENSIC CORRELATION TIP:</strong>
                  <span>Cross-check this attire against CAM 3 & CAM 4 corridor movements (11:12 PM – 11:18 PM), the green tartan snag on the side service door, and the snow-boot footprints near the heater.</span>
                </div>
              </div>
            )}

            {activeTab === 'belongings' && (
              <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
                <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs">
                  <Briefcase className="w-4 h-4" />
                  <span className="font-bold">GEAR & TOOLS CARRIED DURING INCIDENT</span>
                </div>
                <p className="text-sm text-gray-200 font-sans leading-relaxed">
                  {selectedSuspect.public_profile.belongings}
                </p>
                <div className="p-3 rounded-lg bg-charcoal-900 border border-charcoal-700 text-gray-400 text-xs font-mono">
                  <span>Pay close attention to B-Wing electronic keycards, tea service trays, sampling tweezers, and latex gloves that carry bioluminescent orchid residue.</span>
                </div>
              </div>
            )}

            {activeTab === 'motive' && (
              <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
                <div className="flex items-center space-x-2 text-red-400 font-mono text-xs">
                  <AlertOctagon className="w-4 h-4" />
                  <span className="font-bold">POTENTIAL MOTIVE ASSESSMENT</span>
                </div>
                <p className="text-sm text-gray-200 font-sans leading-relaxed">
                  {selectedSuspect.public_profile.possible_motive}
                </p>
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 text-red-300 text-xs font-mono">
                  <span>Ask yourself: Who had the motive and chemical means to synthesize the Midnight Orchid toxin and poison Dr. Vance's tea?</span>
                </div>
              </div>
            )}

          </div>

          {/* Detective Personal Notes Sidebar (Span 1) */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-3">
              <div className="flex items-center justify-between text-amber-500 font-mono text-xs">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>INVESTIGATOR'S LOG</span>
                </span>
                {noteSaved && (
                  <span className="text-emerald-400 flex items-center space-x-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>SAVED</span>
                  </span>
                )}
              </div>

              <textarea
                value={currentNote}
                onChange={handleNoteChange}
                placeholder={`Type your investigative observations about ${selectedSuspect.display_name}...`}
                rows={5}
                className="w-full bg-charcoal-900 border border-charcoal-700 focus:border-amber-500 rounded-lg p-3 text-xs text-white placeholder-gray-600 font-mono outline-none resize-none"
              />

              <button
                onClick={handleSaveNote}
                className="w-full py-2.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-gray-200 hover:text-amber-300 font-mono text-xs font-bold transition"
              >
                SAVE LOG FOR {selectedSuspect.display_name.toUpperCase()}
              </button>
            </div>

            {/* Suspect Quick Comparison Box */}
            <div className="p-3.5 rounded-xl bg-charcoal-950/40 border border-charcoal-800/60 text-[11px] font-mono text-gray-500 space-y-1.5">
              <span className="text-gray-400 font-semibold block">QUICK JUMP:</span>
              <div className="space-y-1">
                {INITIAL_SUSPECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                      selectedSuspect.id === s.id ? 'bg-amber-500/15 text-amber-300 font-bold border border-amber-500/30' : 'hover:text-gray-300'
                    }`}
                  >
                    <span>{s.display_name}</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal-800">
        <p className="text-xs font-mono text-gray-400 font-sans">
          All 4 suspects reviewed? Proceed to the Interactive Evidence Board to pin clues and map timeline events.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] transform hover:scale-[1.02]"
        >
          <span>PROCEED TO STAGE 04: EVIDENCE COLLECTION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
