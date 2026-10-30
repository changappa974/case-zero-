import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Maximize2, AlertTriangle, ArrowRight, Eye, Film, Info } from 'lucide-react';
import { soundFX } from '../lib/audioService';

interface Stage1StoryProps {
  onProceed: () => void;
}

export const Stage1Story: React.FC<Stage1StoryProps> = ({ onProceed }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(12);
  const [speed, setSpeed] = useState(1);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [hasWatchedFull, setHasWatchedFull] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.duration && video.currentTime >= video.duration * 0.9) {
        setHasWatchedFull(true);
      }
    };

    const onLoadedMetadata = () => {
      setDuration(video.duration || 12);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setHasWatchedFull(true);
      soundFX.playAlertBeep();
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

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

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const handleReplay = () => {
    soundFX.playCameraSwitch();
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const changeSpeed = () => {
    const speeds = [0.5, 1, 1.5, 2];
    const nextIdx = (speeds.indexOf(speed) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setSpeed(nextSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextSpeed;
    }
    soundFX.playCameraSwitch();
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      } else {
        videoRef.current.requestFullscreen().catch(() => {});
      }
    }
  };

  // Subtitle synchronization based on playback
  const getActiveSubtitle = () => {
    if (currentTime < 3.2) {
      return "20:13:58 — Meridian Innovation Hall. Project AURORA sits locked inside Pedestal Case 01 under normal lighting.";
    } else if (currentTime < 4.2) {
      return "[ELECTRICAL SURGE FLICKER] 20:14:12 — Isolated Sub-Panel B-4 breaker switch trips. Central pedestal zone plunges into total blackout.";
    } else if (currentTime < 8.2) {
      return "20:14:30 – 20:15:20 — 74 seconds of localized darkness. Security IR camera captures faint movement near service corridor.";
    } else {
      return "20:15:26 — Power restored. Pedestal acrylic casing hinge is open. AURORA PROTOTYPE HAS VANISHED.";
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Stage Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-charcoal-800 pb-4">
        <div>
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs tracking-wider">
            <span>STAGE 01 OF 05</span>
            <span>//</span>
            <span>EVIDENCE INTAKE</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-mono text-white mt-1">
            CASE ZERO: THE 74-SECOND VANISHING
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Watch the primary incident video carefully. Observe environmental cues, lighting behaviors, and the prototype’s telemetry LED.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-red-950/60 border border-red-800/60 text-red-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            <span>INCIDENT RECORDING</span>
          </span>
        </div>
      </div>

      {/* Cinematic Video Player Container */}
      <div className="relative rounded-xl overflow-hidden bg-black border border-charcoal-700/80 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        
        {/* Letterbox Video Area */}
        <div className="relative aspect-video w-full bg-charcoal-950 flex items-center justify-center cursor-pointer" onClick={togglePlay}>
          <video
            ref={videoRef}
            src="/video/main-story.mp4"
            poster="/cctv/cam-01.jpg"
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Subtitles Overlay */}
          {showSubtitles && (
            <div className="absolute bottom-14 left-4 right-4 text-center pointer-events-none">
              <span className="inline-block px-4 py-2 rounded bg-black/85 border border-charcoal-800 text-amber-300 font-mono text-xs sm:text-sm tracking-wide shadow-lg">
                {getActiveSubtitle()}
              </span>
            </div>
          )}

          {/* Big Play Button Overlay when paused */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="w-20 h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-charcoal-950 flex items-center justify-center transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] transform hover:scale-105"
              >
                <Play className="w-8 h-8 ml-1 fill-current" />
              </button>
            </div>
          )}
        </div>

        {/* Video Control Bar */}
        <div className="bg-charcoal-900 border-t border-charcoal-800 p-3 sm:p-4 space-y-3">
          
          {/* Progress Slider */}
          <div className="flex items-center space-x-3">
            <span className="text-[11px] font-mono text-amber-500 w-12 text-right">
              {Math.floor(currentTime)}s
            </span>
            <input
              type="range"
              min={0}
              max={duration || 12}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1.5 bg-charcoal-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <span className="text-[11px] font-mono text-gray-400 w-12">
              {Math.floor(duration)}s
            </span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between flex-wrap gap-2 pt-1 text-xs font-mono">
            
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="px-3 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-white flex items-center space-x-1.5 transition"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
              </button>

              <button
                onClick={handleReplay}
                className="p-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-gray-300 hover:text-white transition"
                title="Replay Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={changeSpeed}
                className="px-2.5 py-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-amber-400 transition"
              >
                {speed}x SPEED
              </button>

              <button
                onClick={() => setShowSubtitles(!showSubtitles)}
                className={`px-2.5 py-1.5 rounded border transition ${
                  showSubtitles
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-charcoal-800 text-gray-400 border-charcoal-600'
                }`}
              >
                SUBTITLES
              </button>
            </div>

            <div className="flex items-center space-x-2 text-gray-400">
              <span className="hidden sm:inline text-[11px] text-gray-400">CAM-01 / MASTER REEL</span>
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded bg-charcoal-800 hover:bg-charcoal-700 border border-charcoal-600 text-gray-300 hover:text-white transition"
                title="Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Forensic Briefing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="p-4 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs">
            <Info className="w-4 h-4" />
            <span className="font-semibold">SETTING & ASSET</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Meridian Innovation Hall during the annual tech symposium. The crown prototype <strong className="text-white">AURORA</strong> is housed inside an acrylic security display on Pedestal 01.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-2">
          <div className="flex items-center space-x-2 text-red-500 font-mono text-xs">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-semibold">THE 74-SECOND OUTAGE</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            At exactly <strong className="text-white">20:14:12</strong>, the pedestal circuit went dark. When the lighting restored at <strong className="text-white">20:15:26</strong>, the casing was unlocked and the prototype was gone.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-charcoal-900/80 border border-charcoal-800 space-y-2">
          <div className="flex items-center space-x-2 text-amber-500 font-mono text-xs">
            <Eye className="w-4 h-4" />
            <span className="font-semibold">INVESTIGATION DIRECTIVE</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Proceed to the CCTV multi-cam console to inspect camera angles, timestamp logs, and acoustic sensors to piece together what actually occurred.
          </p>
        </div>

      </div>

      {/* Action to Next Stage */}
      <div className="flex justify-end pt-4 border-t border-charcoal-800">
        <button
          onClick={() => {
            soundFX.playCameraSwitch();
            onProceed();
          }}
          className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-charcoal-950 font-bold font-mono tracking-wider flex items-center justify-center space-x-2 transition shadow-[0_0_15px_rgba(245,158,11,0.3)]"
        >
          <span>PROCEED TO STAGE 2: INVESTIGATE THE SCENE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
};
