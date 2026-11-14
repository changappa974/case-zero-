import React, { useState } from 'react';
import { 
  FolderLock, CheckCircle2, Link2, Clock, ZoomIn, AlertTriangle, 
  ArrowRight, Filter, ChevronRight, X, ShieldAlert, Sparkles, MapPin, Eye, Search 
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

interface VisualEvidenceHotspot {
  id: string;
  title: string;
  panel: 'bwing_lab' | 'side_door';
  x: number; // percentage coordinates on Image 3
  y: number;
  evidenceCode: string;
  previewImg: string;
  notes: string;
  details: string;
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
  const [activeTab, setActiveTab] = useState<'visual_sheets' | 'board' | 'timeline' | 'links'>('visual_sheets');
  const [timelineIndex, setTimelineIndex] = useState<number>(6); // default to 23:12:00
  const [activeVisualHotspot, setActiveVisualHotspot] = useState<VisualEvidenceHotspot | null>(null);

  const visualHotspots: VisualEvidenceHotspot[] = [
    {
      id: 'keycard',
      title: 'Lab Keycard Terminal & Inactivity Log',
      panel: 'bwing_lab',
      x: 16,
      y: 73,
      evidenceCode: 'EV-05',
      previewImg: '/evidence/lab-keycard-log.jpg',
      notes: 'Last keycard swipe at 10:58 PM. Zero keystroke activity between 11:00 PM and 11:22 PM.',
      details: 'Dr. Evelyn Hayes logged into the terminal at 10:58 PM, but the system logs show complete silence from 11:00 to 11:22 PM. This completely refutes her claim that she was working alone in the lab during the murder window.'
    },
    {
      id: 'faucet',
      title: 'Left-Handed Pollen Smudge on Sink Faucet',
      panel: 'bwing_lab',
      x: 41,
      y: 80,
      evidenceCode: 'EV-04',
      previewImg: '/evidence/faucet-blue-smudge.jpg',
      notes: 'Left-handed downward thumb grip on left faucet handle coated in 470nm blue bioluminescent orchid pollen.',
      details: 'Fluorescence spectroscopy confirms the substance on the faucet handle is Midnight Orchid pollen. The smudge orientation indicates the perpetrator gripped and twisted the valve with their left hand. Dr. Evelyn Hayes is left-handed.'
    },
    {
      id: 'gloves',
      title: 'Discarded Gloves & Stained Tissue in Waste Bin',
      panel: 'bwing_lab',
      x: 26,
      y: 78,
      evidenceCode: 'EV-03',
      previewImg: '/evidence/discarded-gloves.jpg',
      notes: 'Waste bin contains discarded latex gloves and crumpled tissue glowing brightly with bioluminescent orchid pollen.',
      details: 'Found inside the B-Wing prep lab waste bin at 11:35 PM. The latex gloves match Dr. Evelyn Hayes hand size (Small) and carry residues of both Midnight Orchid pollen and Cyanocryptin neurotoxin.'
    },
    {
      id: 'deadbolt',
      title: 'Heavy Brass Deadbolt Locked From Inside',
      panel: 'side_door',
      x: 70,
      y: 58,
      evidenceCode: 'EV-06',
      previewImg: '/evidence/brass-deadbolt.jpg',
      notes: 'Heavy brass deadbolt engaged from the INSIDE. Bottom threshold frost layer is completely unbroken.',
      details: 'The deadbolt was locked from within the conservatory and cannot be operated from outside. The continuous crystalline frost seal along the bottom sill proves nobody entered or left through this door.'
    },
    {
      id: 'tartan',
      title: 'Dark Green Tartan Fabric Snagged on Outside Handle',
      panel: 'side_door',
      x: 87,
      y: 60,
      evidenceCode: 'EV-07',
      previewImg: '/evidence/green-tartan-handle.jpg',
      notes: 'Scrap of wool tartan snagged on exterior handle. Victor Thorne attempted door at 10:50 PM but could not enter.',
      details: 'Matches Victor Thorne green tartan blazer. Snagged when Victor pulled on the locked exterior handle at 10:50 PM. Victor was exonerated by the inside deadbolt and his verified presence at the Lobby Bar from 11:00 to 11:25 PM.'
    },
    {
      id: 'footprints',
      title: 'Melted Snow-Boot Footprints at Heater Vent',
      panel: 'side_door',
      x: 89,
      y: 80,
      evidenceCode: 'EV-08',
      previewImg: '/evidence/melted-footprints.jpg',
      notes: 'Boot footprints completely melted and desiccated at the edges (>20 minutes prior to 11:30 PM discovery).',
      details: 'Tread analysis matches Clara Sterling shearling boots from her 11:05 PM heater inspection. The dried borders confirm the tracks were created more than 20 minutes before discovery and represent routine maintenance.'
    }
  ];

  const filterTypes = [
    { id: 'all', label: 'ALL EVIDENCE (8)' },
    { id: 'physical_trace', label: 'PHYSICAL TRACES' },
    { id: 'access_log', label: 'ACCESS LOGS' },
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
            Inspect B-Wing Lab & Side Door forensic panels, examine evidence cards, scrub the timeline, and link clues to suspects.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1.5 bg-charcoal-900 p-1.5 rounded-lg border border-charcoal-800 font-mono text-xs overflow-x-auto">
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('visual_sheets');
            }}
            className={`px-3 py-1.5 rounded whitespace-nowrap transition ${
              activeTab === 'visual_sheets'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            VISUAL EVIDENCE SHEET (IMG 3)
          </button>
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('board');
            }}
            className={`px-3 py-1.5 rounded whitespace-nowrap transition ${
              activeTab === 'board'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EVIDENCE DOSSIER ({INITIAL_EVIDENCE.length})
          </button>
          <button
            onClick={() => {
              soundFX.playCameraSwitch();
              setActiveTab('timeline');
            }}
            className={`px-3 py-1.5 rounded whitespace-nowrap transition ${
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
            className={`px-3 py-1.5 rounded whitespace-nowrap transition ${
              activeTab === 'links'
                ? 'bg-amber-500 text-charcoal-950 font-bold'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            SUSPECT-CLUE MATRIX ({connectedLinks.length} PINS)
          </button>
        </div>
      </div>

      {/* VIEW 1: VISUAL EVIDENCE SHEETS (IMAGE 3 RECREATION) */}
      {activeTab === 'visual_sheets' && (
        <div className="space-y-6">
          <div className="bg-charcoal-900/80 border border-charcoal-800 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div>
              <span className="text-amber-400 font-bold">FORENSIC REFERENCE SHEET 03 // LAB & SERVICE ENTRANCE</span>
              <p className="text-gray-400 text-[11px] mt-0.5">
                Click on the interactive yellow markers below to inspect keycard logs, faucet smudges, gloves, deadbolts, and footprints.
              </p>
            </div>
            <span className="px-3 py-1 rounded bg-black/60 border border-charcoal-700 text-cyan-400">
              CLICK TO INVESTIGATE HOTSPOTS
            </span>
          </div>

          {/* Interactive Sheet Container */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-charcoal-700 shadow-2xl">
            <div className="relative w-full aspect-[16/9]">
              <img
                src="/reference/evidence-sheet.jpg"
                alt="Image 3: B-Wing Lab and Side Passage Evidence"
                className="w-full h-full object-contain pointer-events-none select-none"
              />

              {/* Interactive Hotspot Buttons */}
              {visualHotspots.map((spot) => {
                const isCollected = collectedEvidence.includes(spot.evidenceCode);
                const isSelected = activeVisualHotspot?.id === spot.id;

                return (
                  <button
                    key={spot.id}
                    onClick={() => {
                      soundFX.playCameraSwitch();
                      setActiveVisualHotspot(spot);
                    }}
                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group"
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isSelected ? 'bg-amber-400' : isCollected ? 'bg-emerald-500' : 'bg-cyan-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-7 w-7 border-2 items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isSelected
                          ? 'bg-amber-500 border-white text-charcoal-950 font-bold'
                          : isCollected
                          ? 'bg-emerald-700 border-white text-white'
                          : 'bg-cyan-950 border-cyan-400 text-cyan-200'
                      }`}>
                        <Eye className="w-4 h-4" />
                      </span>
                    </span>

                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-9 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded bg-charcoal-950/95 border border-amber-500/50 text-[11px] font-mono text-amber-300 shadow-xl z-30">
                      {spot.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hotspot Inspector Modal */}
          {activeVisualHotspot && (
            <div className="p-5 rounded-xl bg-charcoal-900 border border-amber-500/60 shadow-2xl space-y-4 animate-in fade-in duration-200">
              <div className="flex items-start justify-between border-b border-charcoal-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    FORENSIC TARGET // {activeVisualHotspot.evidenceCode}
                  </span>
                  <h4 className="text-lg font-bold font-mono text-white mt-1">
                    {activeVisualHotspot.title}
                  </h4>
                </div>
                <button
                  onClick={() => setActiveVisualHotspot(null)}
                  className="p-1 rounded bg-charcoal-800 hover:bg-charcoal-700 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-mono text-xs">
                <div className="rounded-lg overflow-hidden bg-black border border-charcoal-800 aspect-video md:aspect-square flex items-center justify-center">
                  <img
                    src={activeVisualHotspot.previewImg}
                    alt={activeVisualHotspot.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <p className="text-gray-300 text-sm leading-relaxed font-sans">
                    {activeVisualHotspot.details}
                  </p>

                  <div className="p-3 rounded bg-charcoal-950/80 border border-charcoal-800 text-gray-300 space-y-1">
                    <span className="text-amber-500 font-bold block text-[11px]">EXAMINATION NOTE:</span>
                    <p>{activeVisualHotspot.notes}</p>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-gray-400">
                      EVIDENCE CODE: <strong className="text-amber-400">{activeVisualHotspot.evidenceCode}</strong>
                    </span>

                    {collectedEvidence.includes(activeVisualHotspot.evidenceCode) ? (
                      <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>LOGGED IN EVIDENCE INVENTORY</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          soundFX.playClueFound();
                          onCollectEvidence(activeVisualHotspot.evidenceCode);
                        }}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold transition shadow-lg"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>COLLECT THIS CLUE</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: EVIDENCE CARDS GRID */}
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

      {/* VIEW 3: INTERACTIVE TIMELINE SCRUBBER */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-charcoal-800 pb-4">
            <div>
              <h3 className="text-lg font-bold font-mono text-white">
                FROSTPEAK CONSERVATORY CRIME TIMELINE (22:50 – 23:30)
              </h3>
              <p className="text-xs text-gray-400 font-sans">
                Drag the time scrubber to cross-reference suspect movements, tea delivery, corridor transits, and fatal toxin timing.
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
              <span>22:50 (VICTOR ATTEMPT)</span>
              <span>23:00 (TEA DELIVERY)</span>
              <span className="text-amber-400 font-bold">23:12 (EVELYN TRANSIT)</span>
              <span className="text-red-400 font-bold">23:24 (COLLAPSE)</span>
              <span>23:30 (DISCOVERY)</span>
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
                        CRITICAL ANOMALY
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
                  <span>SUBJECT INVOLVED: <strong className="text-white">{ev.involvedParty}</strong></span>
                  <span className="text-[11px] text-gray-500 uppercase">SOURCE: {ev.sourceType}</span>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      {/* VIEW 4: SUSPECT-CLUE CORRELATION MATRIX */}
      {activeTab === 'links' && (
        <div className="p-6 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-6">
          <div className="border-b border-charcoal-800 pb-4">
            <h3 className="text-lg font-bold font-mono text-white">
              SUSPECT & EVIDENCE CORRELATION PINBOARD
            </h3>
            <p className="text-xs text-gray-400 font-sans mt-0.5">
              Click the pin icons to connect or disconnect evidence clues to suspects. Link multiple clues to build your case.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {INITIAL_SUSPECTS.map((suspect) => {
              const suspectLinks = connectedLinks.filter((l) => l.suspectId === suspect.id);

              return (
                <div key={suspect.id} className="p-4 rounded-xl bg-charcoal-950/80 border border-charcoal-800 space-y-4">
                  <div className="flex items-center space-x-3 border-b border-charcoal-800 pb-3">
                    <img
                      src={suspect.portrait_url}
                      alt={suspect.display_name}
                      className="w-10 h-10 rounded-full object-cover border border-amber-500/40"
                    />
                    <div>
                      <h4 className="text-sm font-bold font-mono text-white">{suspect.display_name}</h4>
                      <span className="text-[10px] font-mono text-amber-500/80">
                        {suspectLinks.length} CLUES PINNED
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {INITIAL_EVIDENCE.map((ev) => {
                      const linked = isLinked(suspect.id, ev.code);

                      return (
                        <button
                          key={ev.id}
                          onClick={() => handleLinkClick(suspect.id, ev.code)}
                          className={`w-full text-left p-2 rounded text-xs font-mono transition flex items-center justify-between border ${
                            linked
                              ? 'bg-amber-500/15 border-amber-500/50 text-amber-300'
                              : 'bg-charcoal-900 border-charcoal-800 text-gray-400 hover:text-white'
                          }`}
                        >
                          <span className="truncate pr-2">{ev.code}: {ev.title}</span>
                          <Link2 className={`w-3.5 h-3.5 shrink-0 ${linked ? 'text-amber-400' : 'text-gray-600'}`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Evidence Viewer */}
      {modalEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-charcoal-900 border border-charcoal-700 rounded-xl p-6 shadow-2xl space-y-4 font-mono text-xs">
            <div className="flex items-start justify-between border-b border-charcoal-800 pb-3">
              <div>
                <span className="text-amber-400 font-bold">{modalEvidence.code}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{modalEvidence.title}</h3>
              </div>
              <button
                onClick={() => setModalEvidence(null)}
                className="p-1 rounded bg-charcoal-800 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-charcoal-800">
              <img
                src={modalEvidence.media_url}
                alt={modalEvidence.title}
                className="w-full h-full object-cover"
              />
            </div>

            <p className="text-gray-300 text-sm font-sans leading-relaxed">
              {modalEvidence.description}
            </p>

            {modalEvidence.metadata && (
              <div className="bg-charcoal-950 p-3 rounded-lg border border-charcoal-800 space-y-1">
                <span className="text-amber-500 font-bold block text-[11px]">METADATA ATTRIBUTES:</span>
                {Object.entries(modalEvidence.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-gray-400 text-[11px]">
                    <span className="uppercase">{k.replace('_', ' ')}:</span>
                    <span className="text-white font-bold">{String(v)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  soundFX.playClueFound();
                  onCollectEvidence(modalEvidence.code);
                  setModalEvidence(null);
                }}
                className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold uppercase transition"
              >
                {collectedEvidence.includes(modalEvidence.code) ? 'ALREADY LOGGED' : 'ADD TO EVIDENCE DOSSIER'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal-800">
        <p className="text-xs font-mono text-gray-400">
          Ensure you have correlated the evidence with the CCTV movements before making your final accusation.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <span>PROCEED TO STAGE 05: FINAL SUBMISSION</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
