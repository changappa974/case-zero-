import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Play, Pause, RotateCcw, ZoomIn, ZoomOut, Maximize2, 
  Volume2, VolumeX, Eye, Sparkles, Shield, Clock 
} from 'lucide-react';
import { soundFX } from '../lib/audioService';

export interface VideoHotspot {
  x: number; // percentage (0-100)
  y: number;
  title: string;
  description: string;
  clueCode?: string;
}

interface CinematicVideoPlayerProps {
  posterUrl: string;
  title: string;
  camCode: string;
  timestamp: string;
  duration?: number; // duration in seconds (default 10)
  panMode?: 'pan_right' | 'pan_left' | 'zoom_in' | 'slow_pulse';
  subtitles?: { start: number; end: number; text: string }[];
  hotspots?: VideoHotspot[];
  collectedEvidence?: string[];
  onCollectClue?: (code: string) => void;
  onHotspotClick?: (hotspot: VideoHotspot) => void;
  autoPlay?: boolean;
}

export const CinematicVideoPlayer: React.FC<CinematicVideoPlayerProps> = ({
  posterUrl,
  title,
  camCode,
  timestamp,
  duration = 10,
  panMode = 'zoom_in',
  subtitles = [],
  hotspots = [],
  collectedEvidence = [],
  onCollectClue,
  onHotspotClick,
  autoPlay = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(autoPlay);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  
  // Magnification / Zoom Lens state
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(2.0);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Load and cache poster image
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  useEffect(() => {
    setImageLoaded(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = posterUrl;
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
  }, [posterUrl]);

  // Main 60 FPS Canvas Render Loop
  const renderFrame = useCallback((timeSec: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imageRef.current;
    if (!img) return;

    const w = canvas.width;
    const h = canvas.height;
    const imgW = img.naturalWidth || w;
    const imgH = img.naturalHeight || h;

    // Calculate normalized progress t (0 to 1)
    const t = (timeSec % duration) / duration;

    // Pan / Zoom parameters
    let scale = 1.0;
    let cropX = 0;
    let cropY = 0;
    let cropW = imgW;
    let cropH = imgH;

    if (isZoomed) {
      // User zoom lens centered on mousePos
      scale = zoomLevel;
      cropW = imgW / scale;
      cropH = imgH / scale;
      cropX = Math.max(0, Math.min(imgW - cropW, (mousePos.x / 100) * imgW - cropW / 2));
      cropY = Math.max(0, Math.min(imgH - cropH, (mousePos.y / 100) * imgH - cropH / 2));
    } else {
      if (panMode === 'pan_right') {
        scale = 1.1;
        cropW = imgW / scale;
        cropH = imgH / scale;
        cropX = (imgW - cropW) * (0.1 + 0.8 * t);
        cropY = (imgH - cropH) * 0.5;
      } else if (panMode === 'pan_left') {
        scale = 1.1;
        cropW = imgW / scale;
        cropH = imgH / scale;
        cropX = (imgW - cropW) * (0.9 - 0.8 * t);
        cropY = (imgH - cropH) * 0.5;
      } else if (panMode === 'zoom_in') {
        scale = 1.0 + 0.15 * t;
        cropW = imgW / scale;
        cropH = imgH / scale;
        cropX = (imgW - cropW) * 0.5;
        cropY = (imgH - cropH) * 0.5;
      } else {
        // slow_pulse
        scale = 1.02 + 0.05 * Math.sin(t * Math.PI * 2);
        cropW = imgW / scale;
        cropH = imgH / scale;
        cropX = (imgW - cropW) * 0.5;
        cropY = (imgH - cropH) * 0.5;
      }
    }

    // 1. Draw base image
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, w, h);

    // 2. Dynamic Bioluminescent 470nm Cyan/Blue Orchid Glow Pulse
    // Simulates live glowing pollen in ambient darkness
    const pulseIntensity = 0.15 + 0.12 * Math.sin(timeSec * 3);
    const grad = ctx.createRadialGradient(w * 0.45, h * 0.85, 10, w * 0.45, h * 0.85, w * 0.28);
    grad.addColorStop(0, `rgba(6, 182, 212, ${pulseIntensity})`);
    grad.addColorStop(0.5, `rgba(59, 130, 246, ${pulseIntensity * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 3. CRT Scanline Raster Lines
    ctx.fillStyle = 'rgba(0, 0, 0, 0.18)';
    const scanlineOffset = Math.floor(timeSec * 30) % 4;
    for (let y = scanlineOffset; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1.5);
    }

    // 4. Subtle Vignette
    const vigGrad = ctx.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, h * 0.85);
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(10, 10, 12, 0.55)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);

  }, [duration, isZoomed, zoomLevel, mousePos, panMode]);

  // Animation ticker
  useEffect(() => {
    let lastStamp = performance.now();

    const loop = (stamp: number) => {
      const deltaSec = (stamp - lastStamp) / 1000;
      lastStamp = stamp;

      if (isPlaying && imageLoaded) {
        setCurrentTime((prev) => {
          const next = prev + deltaSec * playbackSpeed;
          return next >= duration ? 0 : next;
        });
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, playbackSpeed, duration, imageLoaded]);

  // Re-render canvas whenever currentTime or dependencies update
  useEffect(() => {
    if (imageLoaded) {
      renderFrame(currentTime);
    }
  }, [currentTime, imageLoaded, renderFrame]);

  // Compute dynamic HH:MM:SS timestamp for HUD
  const getDynamicTimestamp = () => {
    try {
      const parts = timestamp.split(':');
      let hh = parseInt(parts[0], 10) || 23;
      let mm = parseInt(parts[1], 10) || 0;
      let ss = (parseInt(parts[2], 10) || 0) + Math.floor(currentTime);
      while (ss >= 60) {
        ss -= 60;
        mm += 1;
      }
      return `${hh.toString().padStart(2, '0')}:${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`;
    } catch (e) {
      return timestamp;
    }
  };

  // Synchronized subtitle lookup
  const getActiveSubtitle = () => {
    if (!subtitles || subtitles.length === 0) return null;
    const match = subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);
    return match ? match.text : null;
  };

  const togglePlay = () => {
    soundFX.playCameraSwitch();
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
  };

  const handleSpeedToggle = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
    setPlaybackSpeed(speeds[nextIdx]);
    soundFX.playCameraSwitch();
  };

  const handleRewind5s = () => {
    soundFX.playCameraSwitch();
    setCurrentTime((prev) => Math.max(0, prev - 5));
  };

  const handleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      containerRef.current.requestFullscreen().catch(() => {});
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setMousePos({ x, y });
  };

  return (
    <div ref={containerRef} className="relative rounded-2xl overflow-hidden bg-black border border-charcoal-700/80 shadow-2xl select-none group">
      
      {/* Top HUD Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 px-4 py-2.5 bg-gradient-to-b from-black/90 via-black/60 to-transparent flex items-center justify-between text-xs font-mono pointer-events-none">
        
        {/* Left: REC indicator + Cam code */}
        <div className="flex items-center space-x-2.5">
          <span className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-black/70 border border-red-600/60 text-red-400 font-bold backdrop-blur-md">
            <span className={`w-2 h-2 rounded-full bg-red-600 ${isPlaying ? 'animate-ping' : ''}`}></span>
            <span>{isPlaying ? 'REC [LIVE]' : 'PAUSED'}</span>
          </span>

          <span className="px-2.5 py-0.5 rounded bg-black/70 border border-amber-500/40 text-amber-400 font-bold backdrop-blur-md">
            {camCode} // {title.toUpperCase()}
          </span>
        </div>

        {/* Right: Dynamic Timestamp */}
        <div className="flex items-center space-x-2">
          <span className="px-3 py-0.5 rounded bg-black/70 border border-charcoal-700 text-gray-300 font-semibold backdrop-blur-md flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>2026-10-30 {getDynamicTimestamp()}</span>
          </span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-black/70 border border-charcoal-800 text-[10px] text-cyan-400 backdrop-blur-md font-bold">
            1080P HD / 60 FPS
          </span>
        </div>
      </div>

      {/* Main Canvas Display Area */}
      <div 
        className="relative aspect-video w-full bg-charcoal-950 flex items-center justify-center cursor-pointer overflow-hidden"
        onClick={togglePlay}
        onMouseMove={handleMouseMove}
      >
        <canvas
          ref={canvasRef}
          width={1024}
          height={576}
          className="w-full h-full object-contain"
        />

        {/* Pause Overlay Big Play Button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition pointer-events-none">
            <div className="w-16 h-16 rounded-full bg-amber-500/90 hover:bg-amber-400 text-charcoal-950 flex items-center justify-center shadow-[0_0_30px_rgba(245,158,11,0.5)] transform scale-100 transition">
              <Play className="w-7 h-7 ml-1 fill-current" />
            </div>
          </div>
        )}

        {/* Hotspots overlay (visible when not zoomed) */}
        {!isZoomed && hotspots.map((hs, idx) => {
          const isCollected = hs.clueCode && collectedEvidence.includes(hs.clueCode);

          return (
            <div
              key={idx}
              style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group/hotspot"
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playCameraSwitch();
                if (onHotspotClick) onHotspotClick(hs);
                if (hs.clueCode && onCollectClue) onCollectClue(hs.clueCode);
              }}
            >
              <span className="relative flex h-8 w-8 items-center justify-center cursor-pointer">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isCollected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-6 w-6 border-2 items-center justify-center shadow-lg transition-transform group-hover/hotspot:scale-125 ${
                  isCollected
                    ? 'bg-emerald-600 border-white text-white'
                    : 'bg-amber-500 border-charcoal-950 text-charcoal-950'
                }`}>
                  <Eye className="w-3.5 h-3.5" />
                </span>
              </span>

              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-9 hidden group-hover/hotspot:flex flex-col items-center pointer-events-none whitespace-nowrap z-30">
                <div className="px-2.5 py-1 rounded bg-charcoal-950/95 border border-amber-500/50 text-[11px] font-mono text-amber-300 shadow-xl">
                  {hs.title}
                </div>
                <div className="w-2 h-2 bg-charcoal-950 border-r border-b border-amber-500/50 rotate-45 -mt-1"></div>
              </div>
            </div>
          );
        })}

        {/* Closed Caption Subtitles */}
        {showSubtitles && getActiveSubtitle() && (
          <div className="absolute bottom-4 left-6 right-6 text-center pointer-events-none z-20 animate-fade-in">
            <span className="inline-block px-4 py-2 rounded-lg bg-black/85 border border-charcoal-700 text-amber-300 font-mono text-xs sm:text-sm tracking-wide shadow-2xl backdrop-blur-md">
              {getActiveSubtitle()}
            </span>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-charcoal-950 border-t border-charcoal-800/80 p-3 sm:p-4 space-y-2.5">
        
        {/* Scrubber Progress Slider */}
        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="text-amber-500 w-10 text-right font-bold">
            {Math.floor(currentTime)}s
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-charcoal-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-gray-400 w-10">
            {duration}s
          </span>
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
          
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlay}
              className="px-3.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-white font-bold flex items-center space-x-1.5 transition"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            <button
              onClick={handleRewind5s}
              className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-gray-300 hover:text-white transition flex items-center space-x-1"
              title="Rewind 5 Seconds"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>-5s</span>
            </button>

            <button
              onClick={handleSpeedToggle}
              className="px-2.5 py-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-700 text-amber-400 font-bold transition"
              title="Toggle Playback Speed"
            >
              {playbackSpeed}x SPEED
            </button>
          </div>

          <div className="flex items-center space-x-2">
            
            {/* Magnify / Zoom Toggle */}
            <button
              onClick={() => {
                setIsZoomed(!isZoomed);
                soundFX.playCameraSwitch();
              }}
              className={`px-3 py-1.5 rounded-lg border transition flex items-center space-x-1.5 ${
                isZoomed
                  ? 'bg-amber-500 text-charcoal-950 font-bold border-amber-400'
                  : 'bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 border-charcoal-700'
              }`}
            >
              {isZoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <ZoomIn className="w-3.5 h-3.5" />}
              <span>{isZoomed ? 'RESET ZOOM' : 'MAGNIFY LENS'}</span>
            </button>

            {isZoomed && (
              <div className="flex items-center space-x-1 bg-charcoal-900 px-2 py-1 rounded border border-charcoal-700 text-[11px] text-gray-400">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(1.5, z - 0.5))}
                  className="px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-white"
                >
                  -
                </button>
                <span className="text-amber-400 font-bold px-1">{zoomLevel.toFixed(1)}x</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(4.0, z + 0.5))}
                  className="px-1.5 py-0.5 rounded bg-charcoal-800 hover:bg-charcoal-700 text-white"
                >
                  +
                </button>
              </div>
            )}

            {/* CC Subtitles Toggle */}
            {subtitles && subtitles.length > 0 && (
              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-2.5 py-1.5 rounded-lg border transition ${
                  showSubtitles
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-charcoal-800 text-gray-400 border-charcoal-700 hover:text-white'
                }`}
                title="Toggle Subtitles"
              >
                CC
              </button>
            )}

            {/* Fullscreen Button */}
            <button
              onClick={handleFullscreen}
              className="p-1.5 rounded-lg bg-charcoal-800 hover:bg-charcoal-700 text-gray-300 hover:text-white border border-charcoal-700 transition"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>

          </div>

        </div>

      </div>

    </div>
  );
};
