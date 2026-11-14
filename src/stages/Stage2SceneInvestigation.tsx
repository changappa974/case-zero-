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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#cfc7b7] pb-5">
        <div>
          <div className="flex items-center space-x-2 text-amber-900 font-mono text-xs tracking-wider font-bold">
            <span>STAGE 02 OF 05</span>
            <span>//</span>
            <span>SURVEILLANCE & RECONSTRUCTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-[#1c1917] mt-1">
            INVESTIGATE THE CCTV RECORDINGS & AUDIO REELS
          </h2>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 font-sans">
            Review 5 synchronized estate surveillance camera feeds. Switch angles, scrub the timeline, inspect suspicious reflections with the magnify lens, and listen to intercepted audio recordings.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#f5f0e6] border border-[#cfc7b7] text-stone-800 shadow-sm font-semibold">
            CLUES LOGGED: <strong className="text-blue-900 font-bold">{collectedEvidence.length} / 8</strong>
          </span>
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
            {CCTV_FEEDS.map((cam) => {
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

        {/* Right Column: Audio Intercepts & Hotspot Inspector (Span 1) */}
        <div className="space-y-6">
          
          {/* Acoustic & Audio Logs Panel */}
          <div className="p-5 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#cfc7b7] pb-3">
              <div className="flex items-center space-x-2 text-blue-950 font-mono text-xs font-bold">
                <Radio className="w-4 h-4 text-blue-800" />
                <span>AUDIO INTERCEPT REELS</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e6dfd2] border border-[#cfc7b7] text-stone-800 font-bold">
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
                        ? 'bg-amber-100 border-2 border-amber-500 shadow-sm'
                        : 'bg-[#e6dfd2] border-[#cfc7b7] hover:border-[#b8b09f]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                      <span className="text-amber-950 font-bold">{log.code}</span>
                      <span className="text-stone-600 font-semibold">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-bold text-[#1c1917] mb-1">
                      {log.title}
                    </p>
                    <div className="text-xs text-stone-900 font-sans mb-3 leading-relaxed bg-[#fbf9f5] p-3 rounded-xl border border-[#cfc7b7] space-y-2">
                      <p className="font-medium text-stone-900 leading-relaxed">{log.transcript}</p>
                      {log.clueMeaning && (
                        <div className="pt-2 border-t border-[#e2dbce] flex items-start space-x-1.5 text-[11px]">
                          <span className="text-amber-900 font-bold shrink-0">💡 What it means:</span>
                          <span className="text-stone-700 font-semibold">{log.clueMeaning}</span>
                        </div>
                      )}
                    </div>

                    {/* Interactive Playable Button */}
                    <button
                      onClick={() => handlePlayAudio(log)}
                      className={`w-full py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center space-x-2 transition ${
                        isPlayingThis
                          ? 'bg-amber-500 text-stone-950 shadow-md animate-pulse'
                          : 'bg-blue-800 hover:bg-blue-900 text-white shadow-sm'
                      }`}
                    >
                      {isPlayingThis ? (
                        <>
                          <Activity className="w-3.5 h-3.5 animate-spin text-stone-950" />
                          <span>TRANSMITTING... (STOP)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-white" />
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
            <div className="p-5 rounded-2xl bg-[#f5f0e6] border-2 border-blue-800 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-blue-950 font-mono text-xs border-b border-[#cfc7b7] pb-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>INSPECTED DETAIL</span>
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-stone-500 hover:text-stone-900 p-1"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold font-mono text-[#1c1917]">
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
            <div className="p-5 rounded-2xl bg-[#f5f0e6] border border-[#cfc7b7] text-center py-6 text-xs text-stone-600 font-mono space-y-2 shadow-sm">
              <Eye className="w-6 h-6 mx-auto text-stone-500" />
              <p>Click any pulsing amber marker on the footage to inspect suspicious objects.</p>
            </div>
          )}

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#cfc7b7] bg-[#f5f0e6] p-6 rounded-2xl shadow-sm">
        <p className="text-xs font-mono text-stone-700 font-medium">
          Make sure to review all 5 cameras and listen to the audio logs before questioning the suspects.
        </p>
        <button
          onClick={() => {
            soundFX.stopAudioPlayback();
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <span>PROCEED TO STAGE 03: EXAMINE SUSPECTS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
