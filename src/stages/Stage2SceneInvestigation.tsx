import React, { useState } from 'react';
import { 
  Camera, Volume2, VolumeX, ArrowRight, CheckCircle2, 
  Radio, Clock, Eye, Sparkles, Activity 
} from 'lucide-react';
import { CCTV_FEEDS, AUDIO_LOGS } from '../lib/caseData';
import { CCTVFeed, AudioLog } from '../types';
import { soundFX } from '../lib/audioService';
import { CinematicVideoPlayer, VideoHotspot } from '../components/CinematicVideoPlayer';

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
  const [selectedCam, setSelectedCam] = useState<CCTVFeed>(CCTV_FEEDS[0]);
  const [activeHotspot, setActiveHotspot] = useState<VideoHotspot | null>(null);
  
  // Audio logs player state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const handleSelectCam = (cam: CCTVFeed) => {
    soundFX.playCameraSwitch();
    setSelectedCam(cam);
    setActiveHotspot(null);
  };

  const handlePlayAudio = (log: AudioLog) => {
    if (playingAudioId === log.id) {
      soundFX.stopAudioPlayback();
      setPlayingAudioId(null);
    } else {
      soundFX.stopAudioPlayback();
      setPlayingAudioId(log.id);
      soundFX.playVoiceLog(log, () => {
        setPlayingAudioId(null);
      });
    }
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 02 OF 05</span>
            <span>//</span>
            <span>SURVEILLANCE & RECONSTRUCTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            INVESTIGATE THE CCTV RECORDINGS & AUDIO REELS
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1 font-sans">
            Review 5 synchronized estate surveillance camera feeds. Switch angles, scrub the timeline, inspect suspicious reflections with the magnify lens, and listen to intercepted audio recordings.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-charcoal-900 border border-charcoal-700 text-gray-300">
            CLUES LOGGED: <strong className="text-amber-400">{collectedEvidence.length} / 8</strong>
          </span>
        </div>
      </div>

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: CCTV Monitor & Active Video (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Cinematic Canvas Surveillance Player */}
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

          {/* Camera Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {CCTV_FEEDS.map((cam) => {
              const isSelected = selectedCam.id === cam.id;

              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCam(cam)}
                  className={`p-3 rounded-xl border text-left font-mono transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-charcoal-900 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/40'
                      : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}>
                      {cam.camCode}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  </div>
                  <p className="text-xs font-bold text-gray-200 truncate font-mono">
                    {cam.title}
                  </p>
                  <p className="text-[10px] text-gray-500 truncate mt-0.5">
                    {cam.timestamp}
                  </p>
                </button>
              );
            })}
          </div>

        </div>

        {/* Right Column: Audio Intercepts & Hotspot Inspector (Span 1) */}
        <div className="space-y-6">
          
          {/* Acoustic & Audio Logs Panel */}
          <div className="p-5 rounded-2xl bg-charcoal-900 border border-charcoal-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs font-bold">
                <Radio className="w-4 h-4" />
                <span>AUDIO INTERCEPT REELS</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-charcoal-800 text-gray-400 font-bold">
                {AUDIO_LOGS.length} TAPES
              </span>
            </div>

            <div className="space-y-3">
              {AUDIO_LOGS.map((log) => {
                const isPlayingThis = playingAudioId === log.id;

                return (
                  <div
                    key={log.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isPlayingThis
                        ? 'bg-amber-950/30 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                        : 'bg-charcoal-950/60 border-charcoal-800/80 hover:border-charcoal-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">{log.code}</span>
                      <span className="text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-bold text-white mb-1">
                      {log.title}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono italic mb-3 leading-relaxed">
                      {log.transcript}
                    </p>

                    {/* Interactive Playable Button */}
                    <button
                      onClick={() => handlePlayAudio(log)}
                      className={`w-full py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center space-x-2 transition ${
                        isPlayingThis
                          ? 'bg-amber-500 text-charcoal-950 shadow-lg'
                          : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-200'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Activity className="w-3.5 h-3.5 animate-spin text-charcoal-950" />
                          <span>TRANSMITTING AUDIO... (CLICK TO STOP)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>PLAY AUDIO REEL</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hotspot Inspector Box */}
          {activeHotspot ? (
            <div className="p-5 rounded-2xl bg-charcoal-900 border border-amber-500/50 shadow-2xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-amber-500 font-mono text-xs border-b border-charcoal-800 pb-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>INSPECTED DETAIL</span>
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold font-mono text-white">
                  {activeHotspot.title}
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed font-sans">
                  {activeHotspot.description}
                </p>
              </div>

              {activeHotspot.clueCode && (
                <div className="pt-2">
                  {collectedEvidence.includes(activeHotspot.clueCode) ? (
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2.5 rounded-lg border border-emerald-800/40 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>LOGGED IN EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCollectClue(activeHotspot.clueCode!)}
                      className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center space-x-1.5 transition shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COLLECT CLUE TO EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-charcoal-900/60 border border-charcoal-800 text-center py-6 text-xs text-gray-500 font-mono space-y-2">
              <Eye className="w-6 h-6 mx-auto text-charcoal-600" />
              <p>Click any pulsing amber marker on the footage to inspect suspicious objects.</p>
            </div>
          )}

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal-800">
        <p className="text-xs font-mono text-gray-400 font-sans">
          Make sure to review all 5 cameras and listen to the audio logs before questioning the suspects.
        </p>
        <button
          onClick={() => {
            soundFX.stopAudioPlayback();
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)] transform hover:scale-[1.02]"
        >
          <span>PROCEED TO STAGE 03: EXAMINE SUSPECTS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
