import React, { useState } from 'react';
import { 
  Camera, ArrowRight, CheckCircle2, 
  Clock, Eye, Sparkles 
} from 'lucide-react';
import { CCTVFeed } from '../types';
import { soundFX } from '../lib/audioService';
import { CinematicVideoPlayer, VideoHotspot } from '../components/CinematicVideoPlayer';
import { useLanguage } from '../lib/i18n';

interface Stage2SceneInvestigationProps {
  collectedEvidence: string[];
  onCollectEvidence: (code: string) => void;
  onProceed: () => void;
}

export const Stage2SceneInvestigation: React.FC<Stage2SceneInvestigationProps> = ({
  collectedEvidence,
  onCollectEvidence,
  onProceed,
}) => {
  const { t, getTranslatedCCTV } = useLanguage();
  const cctvFeeds = getTranslatedCCTV();
  const [selectedCamId, setSelectedCamId] = useState<string>(cctvFeeds[0].id);
  const [activeHotspot, setActiveHotspot] = useState<VideoHotspot | null>(null);

  const selectedCam = cctvFeeds.find((c) => c.id === selectedCamId) || cctvFeeds[0];

  const handleSelectCam = (cam: CCTVFeed) => {
    soundFX.playCameraSwitch();
    setSelectedCamId(cam.id);
    setActiveHotspot(null);
  };

  const handleCollectClue = (code: string) => {
    soundFX.playClueFound();
    onCollectEvidence(code);
    setActiveHotspot(null);
  };

  const getPanModeForCam = (id: string): 'pan_right' | 'pan_left' | 'zoom_in' | 'slow_pulse' => {
    if (id === 'cctv-1') return 'zoom_in';
    if (id === 'cctv-2') return 'pan_left';
    if (id === 'cctv-3') return 'pan_right';
    if (id === 'cctv-4') return 'zoom_in';
    return 'slow_pulse';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc7b7] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-900 font-mono text-xs tracking-wider font-bold">
            <span>{t('stage_2_badge_text', 'STAGE 02 OF 05 // SURVEILLANCE & RECONSTRUCTION')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-[#1c1917] mt-1">
            {t('stage_2_heading', 'INVESTIGATE THE ESTATE CCTV SURVEILLANCE')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-sans">
            {t('stage_2_desc', 'Review 5 synchronized estate surveillance camera feeds. Switch angles, scrub the timeline, and inspect suspicious forensic details with the interactive canvas markers.')}
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e6] border border-[#cfc7b7] text-stone-800 shadow-sm font-semibold">
            {t('clues_logged_stat', 'CLUES LOGGED:')} <strong className="text-blue-900 font-bold">{collectedEvidence.length} / 8</strong>
          </span>
        </div>
      </div>

      {/* At-A-Glance CCTV Surveillance Timeline for 15-Minute Solving */}
      <div className="bg-[#f5f0e6] border border-[#cfc7b7] p-4 rounded-xl space-y-2 shadow-sm font-mono text-xs">
        <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-2">
          <span className="text-blue-950 font-bold flex items-center space-x-1.5">
            <Clock className="w-4 h-4 text-blue-800" />
            <span>{t('cctv_timeline_title', 'ESTATE SURVEILLANCE TIMELINE RECONSTRUCTION (11:00 PM – 11:24 PM)')}</span>
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-950 border border-blue-300 font-bold text-[10px]">
            {t('cctv_key_sequence', 'KEY FORENSIC SEQUENCE')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] pt-1">
          <div className="p-2.5 rounded-lg bg-[#e6dfd2] border border-[#cfc7b7]">
            <span className="text-stone-600 font-bold block">11:00 PM (CAM 1)</span>
            <span className="text-stone-900 font-medium">{t('timeline_1100', 'Chef Marco delivers tea tray to conservatory. Victor Thorne seen at Lobby Bar.')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e6dfd2] border border-[#cfc7b7]">
            <span className="text-stone-600 font-bold block">11:05 PM (CAM 2)</span>
            <span className="text-stone-900 font-medium">{t('timeline_1105', 'Clara Sterling enters to calibrate radiator; departs at 11:08 PM.')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e6dfd2] border border-[#cfc7b7]">
            <span className="text-stone-600 font-bold block">11:12 PM (CAM 3)</span>
            <span className="text-stone-900 font-medium">{t('timeline_1112', 'Individual in yellow cardigan and apron walks toward service passage.')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e6dfd2] border border-[#cfc7b7]">
            <span className="text-stone-600 font-bold block">11:18 PM (CAM 4)</span>
            <span className="text-stone-900 font-medium">{t('timeline_1118', 'Individual in yellow cardigan returns through B-Wing holding a cloth.')}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#e6dfd2] border border-[#cfc7b7]">
            <span className="text-stone-600 font-bold block">11:24 PM (CAM 5)</span>
            <span className="text-stone-900 font-medium">{t('timeline_1124', 'Deadbolt locked from inside. Dr. Vance collapses; clock freezes at 11:24.')}</span>
          </div>
        </div>
      </div>

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: CCTV Monitor & Active Video (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Cinematic Canvas Surveillance Player in warm card container */}
          <div className="bg-[#f5f0e6] p-4 rounded-2xl border border-[#cfc7b7] shadow-sm">
            <CinematicVideoPlayer
              key={selectedCam.id}
              posterUrl={selectedCam.posterUrl}
              title={selectedCam.title}
              camCode={selectedCam.camCode}
              timestamp={selectedCam.timestamp}
              duration={10}
              panMode={getPanModeForCam(selectedCam.id)}
              hotspots={selectedCam.hotspots || []}
              collectedEvidence={collectedEvidence}
              onCollectClue={handleCollectClue}
              onHotspotClick={(hs) => setActiveHotspot(hs)}
              autoPlay={true}
            />
          </div>

          {/* Camera Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
            {cctvFeeds.map((cam) => {
              const isSelected = selectedCam.id === cam.id;

              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCam(cam)}
                  className={`p-3 rounded-xl border text-left font-mono transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-[#dfd7c8] border-2 border-blue-900 shadow-md ring-1 ring-blue-300'
                      : 'bg-[#f5f0e6] border-[#cfc7b7] hover:border-[#b8b09f] hover:bg-[#ece5d8] text-stone-800 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-bold ${isSelected ? 'text-blue-950 font-black' : 'text-stone-600'}`}>
                      {cam.camCode}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                  </div>
                  <p className={`text-xs font-bold truncate font-mono ${isSelected ? 'text-blue-950 font-black' : 'text-stone-900'}`}>
                    {cam.title}
                  </p>
                  <p className="text-[10px] text-stone-600 truncate mt-0.5 font-semibold">
                    {cam.timestamp}
                  </p>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Feed Details & Hotspot Inspector (Span 1) */}
        <div className="space-y-5">
          
          {/* Surveillance Camera Intelligence Panel */}
          <div className="p-5 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] space-y-3.5 shadow-sm font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-3">
              <div className="flex items-center space-x-2 text-blue-950 font-bold">
                <Camera className="w-4 h-4 text-blue-800" />
                <span>SURVEILLANCE INTEL</span>
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>FEED LIVE</span>
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-stone-500 text-[10px] uppercase font-bold block">ACTIVE ANGLE:</span>
                <h4 className="font-bold text-sm text-[#1c1917] font-display">{selectedCam.camCode} // {selectedCam.title}</h4>
              </div>

              <div className="flex items-center space-x-1.5 text-stone-700 text-[11px] bg-[#e6dfd2] p-2 rounded-lg border border-[#cfc7b7]">
                <Clock className="w-3.5 h-3.5 text-blue-900 shrink-0" />
                <span>TIMECODE: <strong>{selectedCam.timestamp}</strong></span>
              </div>

              {selectedCam.location && (
                <div className="text-stone-700 text-[11px]">
                  <span className="text-stone-500 font-bold block text-[10px]">ZONE:</span>
                  <span>{selectedCam.location}</span>
                </div>
              )}

              <p className="text-stone-600 font-sans text-xs pt-1 leading-relaxed border-t border-[#cfc7b7]">
                Click on the interactive markers on the feed to zoom in and log critical evidence into your case file.
              </p>
            </div>
          </div>

          {/* Quick Hotspot Inspector Box */}
          {activeHotspot ? (
            <div className="p-5 rounded-2xl bg-[#f5f0e6] border-2 border-blue-800 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-blue-950 font-mono text-xs border-b border-[#cfc7b7] pb-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>INSPECTED DETAIL</span>
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-stone-500 hover:text-stone-900 p-1 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold font-display text-[#1c1917]">
                  {activeHotspot.title}
                </h4>
                <p className="text-xs text-stone-800 mt-1 leading-relaxed font-sans font-medium">
                  {activeHotspot.description}
                </p>
              </div>

              {activeHotspot.clueCode && (
                <div className="pt-2">
                  {collectedEvidence.includes(activeHotspot.clueCode) ? (
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-900 bg-emerald-100 p-2.5 rounded-lg border border-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                      <span>LOGGED IN EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCollectClue(activeHotspot.clueCode!)}
                      className="w-full py-2.5 rounded-lg bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-xs flex items-center justify-center space-x-1.5 transition shadow-md"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COLLECT CLUE TO EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] text-center py-8 text-xs text-stone-600 font-mono space-y-2 shadow-sm">
              <Eye className="w-6 h-6 mx-auto text-blue-900/60" />
              <p className="font-bold text-stone-800">INTERACTIVE INSPECTOR</p>
              <p className="text-[11px] text-stone-600 font-sans">
                Click any pulsing amber marker on the footage to inspect suspicious objects and log clues.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#cfc7b7] bg-[#f5f0e6] p-6 rounded-2xl shadow-sm">
        <p className="text-xs font-mono text-stone-700 font-medium">
          Make sure to review all 5 cameras and collect forensic clues before questioning the suspects.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>{t('proceed_suspects_btn', 'PROCEED TO STAGE 03: EXAMINE SUSPECTS')}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
