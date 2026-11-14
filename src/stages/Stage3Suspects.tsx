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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-700 font-mono text-xs tracking-wider font-bold">
            <span>STAGE 03 OF 05</span>
            <span>//</span>
            <span>PERSONS OF INTEREST</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-slate-900 mt-1">
            EXAMINE THE FOUR SUSPECTS
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            Analyze suspect statements, physical clothing against CCTV captures, carried equipment, verified alibis, and hidden motives.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm font-semibold">
            DOSSIERS: <strong className="text-blue-700 font-bold">4 VERIFIED</strong>
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
              className={`group cursor-pointer rounded-2xl overflow-hidden border transition-all duration-200 relative bg-white shadow-sm hover:shadow-md ${
                isSelected
                  ? 'border-2 border-blue-600 ring-2 ring-blue-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Portrait Box */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100">
                <img
                  src={suspect.portrait_url}
                  alt={suspect.display_name}
                  className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                />
                
                {/* Note Indicator Tag */}
                {hasNote && (
                  <div className="absolute top-2.5 right-2.5 p-1 rounded-md bg-blue-600 text-white shadow-md">
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                  </div>
                )}
              </div>

              {/* Clear Info Banner Below Image */}
              <div className="p-3 bg-white border-t border-slate-100">
                <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 font-bold">
                  SUSPECT 0{suspect.display_order}
                </span>
                <h3 className="text-base font-bold font-mono text-slate-900 leading-tight">
                  {suspect.display_name}
                </h3>
                <p className="text-xs text-slate-500 truncate font-sans font-medium mt-0.5">
                  {suspect.role}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Suspect Deep Dive Dossier */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        
        {/* Dossier Header */}
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 shrink-0 shadow-sm bg-white">
              <img
                src={selectedSuspect.portrait_url}
                alt={selectedSuspect.display_name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-blue-800 font-mono text-[10px] font-bold">
                  SUBJECT DOSSIER // 0{selectedSuspect.display_order}
                </span>
              </div>
              <h2 className="text-2xl font-black font-mono text-slate-900 mt-1">
                {selectedSuspect.display_name}
              </h2>
              <p className="text-xs font-mono text-slate-600 font-medium">
                {selectedSuspect.role}
              </p>
            </div>
          </div>

          {/* Quick Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200 font-mono text-xs overflow-x-auto">
            <button
              onClick={() => {
                soundFX.playCameraSwitch();
                setActiveTab('statement');
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition font-semibold ${
                activeTab === 'statement'
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
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
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
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
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
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
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
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
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-[11px] font-mono text-blue-900 uppercase font-bold">
                BACKGROUND SUMMARY
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans font-medium">
                {selectedSuspect.public_profile.background}
              </p>
            </div>

            {/* Dynamic Tab Body */}
            {activeTab === 'statement' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-blue-900 font-mono text-xs font-bold">
                    <MessageSquareQuote className="w-4 h-4 text-blue-600" />
                    <span>OFFICIAL VERBATIM STATEMENT</span>
                  </div>
                  <blockquote className="text-sm font-sans italic text-slate-800 border-l-4 border-amber-500 pl-3 py-1 leading-relaxed bg-white p-3 rounded-r-lg border-y border-r border-slate-200">
                    “{selectedSuspect.public_profile.statement}”
                  </blockquote>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-800 font-mono text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>FORENSIC ALIBI VERIFICATION</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans font-medium bg-white p-3 rounded-lg border border-slate-200">
                    {selectedSuspect.public_profile.alibi}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'clothing' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-mono text-xs font-bold">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>VERIFIED APPAREL ON INCIDENT NIGHT</span>
                </div>
                <p className="text-sm text-slate-800 font-sans leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-medium">
                  {selectedSuspect.public_profile.clothing}
                </p>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono space-y-1">
                  <strong className="block text-amber-800 font-bold">FORENSIC CORRELATION TIP:</strong>
                  <span>Cross-check this attire against CAM 3 & CAM 4 corridor movements (11:12 PM – 11:18 PM), the green tartan snag on the side service door, and the snow-boot footprints near the heater.</span>
                </div>
              </div>
            )}

            {activeTab === 'belongings' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-blue-900 font-mono text-xs font-bold">
                  <Briefcase className="w-4 h-4 text-blue-600" />
                  <span>GEAR & TOOLS CARRIED DURING INCIDENT</span>
                </div>
                <p className="text-sm text-slate-800 font-sans leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-medium">
                  {selectedSuspect.public_profile.belongings}
                </p>
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-medium">
                  <span>Pay close attention to B-Wing electronic keycards, tea service trays, sampling tweezers, and latex gloves that carry bioluminescent orchid residue.</span>
                </div>
              </div>
            )}

            {activeTab === 'motive' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center space-x-2 text-red-700 font-mono text-xs font-bold">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  <span>POTENTIAL MOTIVE ASSESSMENT</span>
                </div>
                <p className="text-sm text-slate-800 font-sans leading-relaxed bg-white p-3 rounded-lg border border-slate-200 font-medium">
                  {selectedSuspect.public_profile.possible_motive}
                </p>
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs font-mono font-medium">
                  <span>Ask yourself: Who had the motive and chemical means to synthesize the Midnight Orchid toxin and poison Dr. Vance's tea?</span>
                </div>
              </div>
            )}

          </div>

          {/* Detective Personal Notes Sidebar (Span 1) */}
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-blue-900 font-mono text-xs">
                <span className="flex items-center space-x-1.5 font-bold">
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>INVESTIGATOR'S LOG</span>
                </span>
                {noteSaved && (
                  <span className="text-emerald-700 flex items-center space-x-1 font-bold">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>SAVED</span>
                  </span>
                )}
              </div>

              <textarea
                value={currentNote}
                onChange={handleNoteChange}
                placeholder={`Type your investigative observations about ${selectedSuspect.display_name}...`}
                rows={5}
                className="w-full bg-white border-2 border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-100 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 font-mono outline-none resize-none shadow-inner"
              />

              <button
                onClick={handleSaveNote}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold transition shadow-sm"
              >
                SAVE LOG FOR {selectedSuspect.display_name.toUpperCase()}
              </button>
            </div>

            {/* Suspect Quick Comparison Box */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1.5">
              <span className="text-slate-800 font-bold block">QUICK JUMP:</span>
              <div className="space-y-1">
                {INITIAL_SUSPECTS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition flex items-center justify-between ${
                      selectedSuspect.id === s.id ? 'bg-blue-100 text-blue-900 font-bold border border-blue-200' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{s.display_name}</span>
                    <ChevronRight className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200 bg-white p-6 rounded-2xl shadow-sm">
        <p className="text-xs font-mono text-slate-600 font-medium">
          All 4 suspects reviewed? Proceed to the Interactive Evidence Board to pin clues and map timeline events.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>PROCEED TO STAGE 04: EVIDENCE BOARD</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
