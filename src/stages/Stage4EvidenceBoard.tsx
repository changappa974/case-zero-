import React, { useState } from 'react';
import { 
  FolderLock, CheckCircle2, Link2, Clock, ZoomIn, AlertTriangle, 
  ArrowRight, Filter, ChevronRight, X, ShieldAlert, Sparkles, MapPin 
} from 'lucide-react';
import { INITIAL_EVIDENCE, INITIAL_SUSPECTS, TIMELINE_EVENTS } from '../lib/caseData';
import { Evidence, Suspect } from '../types';
import { soundFX } from '../lib/audioService';

interface Stage4EvidenceBoardProps {
  collectedEvidence: string[];
  onCollectEvidence: (code: string) => void;
  connectedLinks: { suspectId: string; evidenceCode: string; note?: string }[];
  onToggleLink: (suspectId: string, evidenceCode: string) => void;
  onProceed: () => void;
}

export const Stage4EvidenceBoard: React.FC<Stage4EvidenceBoardProps> = ({
  collectedEvidence,
  onCollectEvidence,
  connectedLinks,
  onToggleLink,
  onProceed,
}) => {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [modalEvidence, setModalEvidence] = useState<Evidence | null>(null);
  const [activeTab, setActiveTab] = useState<'board' | 'timeline' | 'links'>('board');
  const [timelineIndex, setTimelineIndex] = useState<number>(4); // default to 20:14:12 blackout

  const filterTypes = [
    { id: 'all', label: 'ALL EVIDENCE (8)' },
    { id: 'telemetry', label: 'TELEMETRY' },
    { id: 'cctv_frame', label: 'CCTV FRAMES' },
    { id: 'access_log', label: 'ACCESS LOGS' },
    { id: 'physical_trace', label: 'PHYSICAL TRACES' },
    { id: 'statement_contradiction', label: 'CONTRADICTIONS' },
  ];

  const filteredEvidence = INITIAL_EVIDENCE.filter((ev) => {
    if (selectedType === 'all') return true;
    return ev.evidence_type === selectedType;
  });

  const isLinked = (suspectId: string, evidenceCode: string) => {
    return connectedLinks.some((l) => l.suspectId === suspectId && l.evidenceCode === evidenceCode);
  };

  const handleLinkClick = (suspectId: string, evidenceCode: string) => {
    soundFX.playClueFound();
    onToggleLink(suspectId, evidenceCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 04 OF 05</span>
            <span>//</span>
            <span>CORRELATION MATRIX</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            INTERACTIVE EVIDENCE BOARD
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pin forensic evidence cards, compare timeline timestamps, link clues to suspects, and isolate contradictions.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-charcoal-900 p-1.5 rounded-lg border border-charcoal-800 font-mono text-xs">
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('board');
            }}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'board'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EVIDENCE CARDS ({INITIAL_EVIDENCE.length})
          </button>
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('timeline');
            }}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'timeline'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            TIMELINE SCRUBBER
          </button>
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('links');
            }}
            className={`px-3 py-1.5 rounded transition ${
              activeTab === 'links'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SUSPECT-CLUE MATRIX ({connectedLinks.length} PINS)
          </button>
        </div>
      </div>

      {/* VIEW 1: EVIDENCE CARDS GRID */}
      {activeTab === 'board' && (
        <div className="space-y-6">
          
          {/* Filters Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 text-xs font-mono">
            {filterTypes.map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundFX.playCameraSwitch();
                  setSelectedType(f.id);
                }}
                className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition ${
                  selectedType === f.id
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                    : 'bg-charcoal-900 border-charcoal-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredEvidence.map((ev) => {
              const isCollected = collectedEvidence.includes(ev.code);
              const linkCount = connectedLinks.filter((l) => l.evidenceCode === ev.code).length;

              return (
                <div
                  key={ev.id}
                  className="group bg-charcoal-900 border border-charcoal-800 hover:border-charcoal-700 rounded-xl overflow-hidden transition-all duration-200 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    {/* Media Thumbnail with Zoom */}
                    <div
                      className="relative aspect-video w-full overflow-hidden bg-charcoal-950 cursor-pointer"
                      onClick={() => {
                        soundFX.playCameraSwitch();
                        setModalEvidence(ev);
                      }}
                    >
                      <img
                        src={ev.media_url}
                        alt={ev.title}
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      
                      {/* Top Overlay Badge */}
                      <div className="absolute top-2 left-2 flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded bg-black/85 border border-charcoal-700 text-amber-400 font-mono text-[11px] font-bold">
                          {ev.code}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-black/85 border border-charcoal-800 text-[10px] font-mono text-gray-400 uppercase">
                          {ev.evidence_type}
                        </span>
                      </div>

                      <div className="absolute top-2 right-2 p-1.5 rounded bg-black/80 text-gray-400 group-hover:text-amber-400 transition">
                        <ZoomIn className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-bold font-mono text-white leading-tight">
                        {ev.title}
                      </h4>
                      <p className="text-xs text-gray-400 font-sans line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 bg-charcoal-950/60 border-t border-charcoal-800 flex items-center justify-between text-xs font-mono">
                    <button
                      onClick={() => {
                        soundFX.playClueFound();
                        onCollectEvidence(ev.code);
                      }}
                      className={`px-2.5 py-1 rounded transition flex items-center space-x-1.5 ${
                        isCollected
                          ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-400'
                          : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isCollected ? 'LOGGED' : 'COLLECT'}</span>
                    </button>

                    <button
                      onClick={() => {
                        soundFX.playCameraSwitch();
                        setModalEvidence(ev);
                      }}
                      className="text-gray-400 hover:text-amber-400 transition flex items-center space-x-1"
                    >
                      <span>INSPECT</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* VIEW 2: INTERACTIVE TIMELINE SCRUBBER */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-mono text-white">
                CRITICAL INCIDENT TIMELINE (20:05 – 20:25)
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                Drag the time slider to cross-verify physical movements and isolate the 74-second window.
              </p>
            </div>
            <div className="text-xs font-mono text-amber-400 bg-amber-950/40 px-3 py-1.5 rounded border border-amber-800/50">
              CURRENT EVENT: {TIMELINE_EVENTS[timelineIndex].timestamp}
            </div>
          </div>

          {/* Timeline Range Slider */}
          <div className="space-y-2">
            <input
              type="range"
              min={0}
              max={TIMELINE_EVENTS.length - 1}
              step={1}
              value={timelineIndex}
              onChange={(e) => {
                soundFX.playCameraSwitch();
                setTimelineIndex(parseInt(e.target.value));
              }}
              className="w-full h-2 bg-charcoal-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-gray-500">
              <span>20:05 (PRESENTATION START)</span>
              <span className="text-red-400 font-bold">20:14:12 (BLACKOUT)</span>
              <span className="text-amber-400 font-bold">20:15:26 (RESTORATION)</span>
              <span>20:25 (AFTERMATH)</span>
            </div>
          </div>

          {/* Active Timeline Item Card */}
          {(() => {
            const ev = TIMELINE_EVENTS[timelineIndex];
            return (
              <div className={`p-5 rounded-xl border transition-all ${
                ev.isAnomaly
                  ? 'bg-amber-950/20 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : 'bg-charcoal-950/80 border-charcoal-800'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 font-mono text-xs">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-500" />
                    <span className="text-amber-400 font-bold text-sm">{ev.timestamp}</span>
                    {ev.isAnomaly && (
                      <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] uppercase font-bold animate-pulse">
                        ANOMALY RECORDED
                      </span>
                    )}
                  </div>
                  <span className="text-gray-400 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-500" />
                    <span>{ev.location}</span>
                  </span>
                </div>

                <h4 className="text-base font-bold font-mono text-white mb-1.5">
                  {ev.title}
                </h4>
                <p className="text-xs sm:text-sm text-gray-300 font-sans leading-relaxed">
                  {ev.detail}
                </p>

                <div className="mt-4 pt-3 border-t border-charcoal-800 flex items-center justify-between text-xs font-mono text-gray-400">
                  <span>INVOLVED: <strong className="text-white">{ev.involvedParty}</strong></span>
                  <span className="uppercase text-[11px] px-2 py-0.5 rounded bg-charcoal-800 text-gray-300">
                    SOURCE: {ev.sourceType}
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Timeline Summary Table */}
          <div className="space-y-2 pt-4">
            <h4 className="text-xs font-mono uppercase text-gray-400 font-semibold">
              ALL RECORDED CHRONOLOGICAL MILESTONES:
            </h4>
            <div className="space-y-1.5">
              {TIMELINE_EVENTS.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    soundFX.playCameraSwitch();
                    setTimelineIndex(idx);
                  }}
                  className={`p-2.5 rounded-lg border text-xs font-mono cursor-pointer transition flex items-center justify-between ${
                    timelineIndex === idx
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                      : 'bg-charcoal-950/60 border-charcoal-800/80 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-300">{item.timestamp}</span>
                    <span className="text-gray-200 truncate max-w-sm sm:max-w-md">{item.title}</span>
                  </div>
                  {item.isAnomaly && (
                    <span className="text-[10px] text-amber-400 font-bold px-1.5 py-0.5 rounded bg-amber-950 border border-amber-800">
                      FLAG
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* VIEW 3: SUSPECT-CLUE CONNECTION MATRIX */}
      {activeTab === 'links' && (
        <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div className="border-b border-charcoal-800 pb-4">
            <h3 className="text-lg font-bold font-mono text-white">
              SUSPECT & EVIDENCE CORRELATION BOARD
            </h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Click any intersection cell to pin or unpin evidence to that suspect's dossier.
            </p>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-charcoal-800 text-gray-400">
                  <th className="p-3 text-left">EVIDENCE ITEM</th>
                  {INITIAL_SUSPECTS.map((s) => (
                    <th key={s.id} className="p-3 text-center min-w-[120px]">
                      <div className="flex flex-col items-center space-y-1">
                        <img
                          src={s.portrait_url}
                          alt={s.display_name}
                          className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                        />
                        <span className="text-white font-bold">{s.display_name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {INITIAL_EVIDENCE.map((ev) => (
                  <tr key={ev.id} className="hover:bg-charcoal-850/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-amber-400">{ev.code}</div>
                      <div className="text-gray-200 text-[11px] truncate max-w-xs">{ev.title}</div>
                    </td>
                    {INITIAL_SUSPECTS.map((s) => {
                      const linked = isLinked(s.id, ev.code);

                      return (
                        <td key={s.id} className="p-3 text-center">
                          <button
                            onClick={() => handleLinkClick(s.id, ev.code)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all flex items-center justify-center space-x-1 mx-auto ${
                              linked
                                ? 'bg-amber-500 text-charcoal-950 font-bold border-amber-400 shadow-md'
                                : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-400 border-charcoal-600'
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>{linked ? 'PINNED' : 'LINK'}</span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Forensic Modal Inspector */}
      {modalEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-charcoal-900 border border-charcoal-700 rounded-xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-4">
            
            <div className="p-4 bg-charcoal-950 border-b border-charcoal-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold">
                  {modalEvidence.code}
                </span>
                <span className="text-xs font-mono text-gray-400 uppercase">
                  FORENSIC FILE // {modalEvidence.evidence_type}
                </span>
              </div>
              <button
                onClick={() => setModalEvidence(null)}
                className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="aspect-video w-full rounded-lg overflow-hidden bg-charcoal-950 border border-charcoal-800">
                <img
                  src={modalEvidence.media_url}
                  alt={modalEvidence.title}
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h3 className="text-lg font-bold font-mono text-white">
                  {modalEvidence.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 font-sans mt-2 leading-relaxed">
                  {modalEvidence.description}
                </p>
              </div>

              {/* Metadata Key-Value Grid */}
              {modalEvidence.metadata && Object.keys(modalEvidence.metadata).length > 0 && (
                <div className="p-3 rounded-lg bg-charcoal-950 border border-charcoal-800 text-xs font-mono space-y-1">
                  <span className="text-amber-500 font-bold block mb-1">METADATA FIELDS:</span>
                  {Object.entries(modalEvidence.metadata).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-gray-400 border-b border-charcoal-800/40 pb-0.5">
                      <span className="capitalize">{k.replace('_', ' ')}:</span>
                      <span className="text-gray-200 font-semibold">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-charcoal-950 border-t border-charcoal-800 flex justify-between">
              <button
                onClick={() => setModalEvidence(null)}
                className="px-4 py-2 rounded bg-charcoal-800 text-gray-300 hover:text-white text-xs font-mono"
              >
                CLOSE
              </button>
              <button
                onClick={() => {
                  soundFX.playClueFound();
                  onCollectEvidence(modalEvidence.code);
                  setModalEvidence(null);
                }}
                className="px-5 py-2 rounded bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>COLLECT INTO CASE DOSSIER</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal-800">
        <p className="text-xs font-mono text-gray-400">
          Ready to submit your findings? Ensure you have identified who took the prototype, why, and which clues prove it.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <span>PROCEED TO STAGE 5: SUBMIT INVESTIGATION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
