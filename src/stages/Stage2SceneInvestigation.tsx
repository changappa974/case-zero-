import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, Play, Pause, RotateCcw, ZoomIn, ZoomOut, Volume2, 
  ArrowRight, CheckCircle2, AlertCircle, Radio, Clock, Eye, ShieldAlert, Sparkles 
} from 'lucide-react';
import { CCTV_FEEDS, AUDIO_LOGS } from '../lib/caseData';
import { CCTVFeed, AudioLog } from '../types';
import { soundFX } from '../lib/audioService';

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
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(2);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [activeHotspot, setActiveHotspot] = useState<any | null>(null);
  
  // Audio logs player
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [selectedCam, playbackSpeed]);

  const handleSelectCam = (cam: CCTVFeed) => {
    soundFX.playCameraSwitch();
    setSelectedCam(cam);
    setIsZoomed(false);
    setActiveHotspot(null);
  };

  const togglePlay = () => {
    soundFX.playCameraSwitch();
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleRewind5s = () => {
    soundFX.playCameraSwitch();
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
    }
  };

  const handleSpeedToggle = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setPlaybackSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
    soundFX.playCameraSwitch();
  };

  const handleVideoMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handlePlayAudio = (log: AudioLog) => {
    if (playingAudioId === log.id) {
      setPlayingAudioId(null);
    } else {
      soundFX.playRadioSquelch(0.4);
      setPlayingAudioId(log.id);
      setTimeout(() => {
        setPlayingAudioId(null);
      }, 5000);
    }
  };

  const handleCollectClue = (code: string) => {
    soundFX.playClueFound();
    onCollectEvidence(code);
    setActiveHotspot(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 02 OF 05</span>
            <span>//</span>
            <span>SCENE RECONSTRUCTION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            INVESTIGATE THE SCENE & CCTV REELS
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Examine 5 synchronized CCTV feeds, scrub playback, zoom into suspicious reflections, and inspect acoustic sensor logs.
          </p>
        </div>

        <div className="flex items-center space-x-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded bg-charcoal-900 border border-charcoal-700 text-gray-300">
            CLUES LOGGED: <strong className="text-amber-400">{collectedEvidence.length} / 8</strong>
          </span>
        </div>
      </div>

      {/* Main Investigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Column: CCTV Monitor & Active Video (Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Main Video Display with Zoom and Hotspots */}
          <div className="relative rounded-xl overflow-hidden bg-black border border-charcoal-700 shadow-2xl">
            
            {/* Top HUD Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center space-x-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded bg-black/80 border border-red-600/60 text-red-400 font-mono text-xs flex items-center space-x-1.5 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span>REC // {selectedCam.camCode}</span>
              </span>
              <span className="px-2.5 py-1 rounded bg-black/80 border border-charcoal-700 text-amber-400 font-mono text-xs backdrop-blur-md">
                {selectedCam.title.toUpperCase()}
              </span>
            </div>

            <div className="absolute top-3 right-3 z-20 flex items-center space-x-2 pointer-events-none">
              <span className="px-2.5 py-1 rounded bg-black/80 border border-charcoal-700 text-gray-300 font-mono text-xs flex items-center space-x-1.5 backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>2026-10-30 {selectedCam.timestamp}</span>
              </span>
            </div>

            {/* Video Canvas with Zoom Support */}
            <div 
              className="relative aspect-video w-full bg-charcoal-950 overflow-hidden cursor-crosshair"
              onMouseMove={handleVideoMouseMove}
            >
              <video
                ref={videoRef}
                src={selectedCam.videoUrl}
                poster={selectedCam.posterUrl}
                loop
                muted
                playsInline
                style={{
                  transform: isZoomed ? `scale(${zoomLevel})` : 'scale(1)',
                  transformOrigin: isZoomed ? `${zoomPos.x}% ${zoomPos.y}%` : 'center center',
                  transition: isZoomed ? 'none' : 'transform 0.3s ease',
                }}
                className="w-full h-full object-contain"
              />

              {/* CRT Scanline Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40"></div>

              {/* Clickable Hotspots when not zoomed */}
              {!isZoomed && selectedCam.hotspots && selectedCam.hotspots.map((hs, idx) => {
                const isCollected = hs.clueCode && collectedEvidence.includes(hs.clueCode);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      soundFX.playCameraSwitch();
                      setActiveHotspot(hs);
                    }}
                    style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
                  >
                    <span className="relative flex h-8 w-8 items-center justify-center">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        isCollected ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-6 w-6 border-2 items-center justify-center shadow-lg transition-transform group-hover:scale-125 ${
                        isCollected ? 'bg-emerald-600 border-white text-white' : 'bg-amber-500 border-charcoal-950 text-charcoal-950'
                      }`}>
                        <Eye className="w-3.5 h-3.5" />
                      </span>
                    </span>

                    {/* Tooltip */}
                    <span className="absolute left-1/2 -translate-x-1/2 bottom-9 hidden group-hover:block whitespace-nowrap px-2.5 py-1 rounded bg-charcoal-950/95 border border-amber-500/50 text-[11px] font-mono text-amber-300 shadow-xl z-20">
                      {hs.title}
                    </span>
                  </button>
                );
              })}

            </div>

            {/* Video Controls Bar */}
            <div className="bg-charcoal-900 border-t border-charcoal-800 p-3 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              <div className="flex items-center space-x-2">
                <button
                  onClick={togglePlay}
                  className="px-3 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-white flex items-center space-x-1.5 transition"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
                </button>

                <button
                  onClick={handleRewind5s}
                  className="px-2.5 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-gray-300 hover:text-white transition flex items-center space-x-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-5s</span>
                </button>

                <button
                  onClick={handleSpeedToggle}
                  className="px-2.5 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-amber-400 transition"
                >
                  {playbackSpeed}x SPEED
                </button>
              </div>

              {/* Zoom Inspection Lens Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setIsZoomed(!isZoomed);
                    soundFX.playCameraSwitch();
                  }}
                  className={`px-3 py-1.5 rounded border transition flex items-center space-x-1.5 ${
                    isZoomed
                      ? 'bg-amber-500 text-charcoal-950 font-bold border-amber-400'
                      : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 border-charcoal-600'
                  }`}
                >
                  {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
                  <span>{isZoomed ? 'RESET ZOOM' : 'MAGNIFY / ZOOM'}</span>
                </button>

                {isZoomed && (
                  <div className="flex items-center space-x-1 text-gray-400 text-[11px]">
                    <button
                      onClick={() => setZoomLevel(Math.max(1.5, zoomLevel - 0.5))}
                      className="px-1.5 py-0.5 rounded bg-charcoal-800 border border-charcoal-700"
                    >
                      -
                    </button>
                    <span className="text-amber-400 font-bold">{zoomLevel}x</span>
                    <button
                      onClick={() => setZoomLevel(Math.min(4, zoomLevel + 0.5))}
                      className="px-1.5 py-0.5 rounded bg-charcoal-800 border border-charcoal-700"
                    >
                      +
                    </button>
                  </div>
                )}
              </div>

            </div>

          </div>

          {/* Camera Selector Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
            {CCTV_FEEDS.map((cam) => {
              const isSelected = selectedCam.id === cam.id;

              return (
                <button
                  key={cam.id}
                  onClick={() => handleSelectCam(cam)}
                  className={`p-2.5 rounded-lg border text-left font-mono transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-charcoal-900 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                      : 'bg-charcoal-950/80 border-charcoal-800 hover:border-charcoal-700 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className={`font-bold ${isSelected ? 'text-amber-400' : 'text-gray-500'}`}>
                      {cam.camCode}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  </div>
                  <p className="text-xs font-semibold text-gray-200 truncate">
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

        {/* Right Column: Audio Intercom & Hotspot Forensic Inspector (Span 1) */}
        <div className="space-y-6">
          
          {/* Acoustic & Audio Logs Panel */}
          <div className="p-4 rounded-xl bg-charcoal-900 border border-charcoal-800 space-y-4">
            <div className="flex items-center justify-between border-b border-charcoal-800 pb-3">
              <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs">
                <Radio className="w-4 h-4" />
                <span className="font-bold">AUDIO INTERCEPT LOGS</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-charcoal-800 text-gray-400">
                3 TAPES
              </span>
            </div>

            <div className="space-y-3">
              {AUDIO_LOGS.map((log) => {
                const isPlayingThis = playingAudioId === log.id;

                return (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg border transition ${
                      isPlayingThis
                        ? 'bg-amber-950/30 border-amber-500/50'
                        : 'bg-charcoal-950/60 border-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1 text-[11px] font-mono">
                      <span className="text-amber-400 font-bold">{log.code}</span>
                      <span className="text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="text-xs font-medium text-gray-200 mb-1.5">
                      {log.title}
                    </p>
                    <p className="text-[11px] text-gray-400 font-mono italic mb-2">
                      {log.transcript}
                    </p>

                    <button
                      onClick={() => handlePlayAudio(log)}
                      className={`w-full py-1.5 rounded font-mono text-[11px] flex items-center justify-center space-x-1.5 transition ${
                        isPlayingThis
                          ? 'bg-amber-500 text-charcoal-950 font-bold'
                          : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-300'
                      }`}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPlayingThis ? 'TRANSMITTING...' : 'PLAY AUDIO REEL'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Hotspot Inspector Box */}
          {activeHotspot ? (
            <div className="p-4 rounded-xl bg-charcoal-900 border border-amber-500/50 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between text-amber-500 font-mono text-xs border-b border-charcoal-800 pb-2">
                <span className="font-bold flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>INSPECTED DETAIL</span>
                </span>
                <button
                  onClick={() => setActiveHotspot(null)}
                  className="text-gray-500 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div>
                <h4 className="text-sm font-bold font-mono text-white">
                  {activeHotspot.title}
                </h4>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {activeHotspot.description}
                </p>
              </div>

              {activeHotspot.clueCode && (
                <div className="pt-2">
                  {collectedEvidence.includes(activeHotspot.clueCode) ? (
                    <div className="flex items-center space-x-1.5 text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-800/40">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>LOGGED IN EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleCollectClue(activeHotspot.clueCode)}
                      className="w-full py-2 rounded bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs flex items-center justify-center space-x-1.5 transition shadow-lg"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>COLLECT CLUE TO EVIDENCE BOARD ({activeHotspot.clueCode})</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-charcoal-900/60 border border-charcoal-800 text-center py-6 text-xs text-gray-500 font-mono space-y-2">
              <Eye className="w-6 h-6 mx-auto text-charcoal-600" />
              <p>Click any pulsing amber marker on the footage to inspect suspicious objects.</p>
            </div>
          )}

        </div>

      </div>

      {/* Navigation footer */}
      <div className="flex items-center justify-between pt-6 border-t border-charcoal-800">
        <p className="text-xs font-mono text-gray-400">
          Make sure to review all 5 cameras and listen to the audio logs before questioning the suspects.
        </p>
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="px-6 py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono text-xs tracking-wider flex items-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <span>PROCEED TO STAGE 3: EXAMINE SUSPECTS</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
