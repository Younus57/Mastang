import React from 'react';
import { 
  TrimSpec, 
  CameraViewPreset, 
  CarConfiguration, 
  TrimId 
} from '../types';
import { TRIM_SPECS } from '../data/configOptions';
import { 
  Volume2, 
  VolumeX, 
  Camera, 
  Share2, 
  RotateCw, 
  Eye, 
  Sparkles,
  Gauge,
  Layers,
  Flame
} from 'lucide-react';

interface HeaderProps {
  config: CarConfiguration;
  onConfigChange: (updater: (prev: CarConfiguration) => CarConfiguration) => void;
  cameraPreset: CameraViewPreset;
  onCameraChange: (preset: CameraViewPreset) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isEngineRunning: boolean;
  onTakeScreenshot: () => void;
  onOpenShareModal: () => void;
  onResetConfig: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onConfigChange,
  cameraPreset,
  onCameraChange,
  soundEnabled,
  onToggleSound,
  isEngineRunning,
  onTakeScreenshot,
  onOpenShareModal,
  onResetConfig,
}) => {
  const currentTrim = TRIM_SPECS[config.trim];

  // Calculate Total Estimated MSRP
  const totalMSRP = 
    currentTrim.basePrice +
    config.paint.price +
    config.stripe.price +
    config.wheel.price +
    config.caliper.price +
    config.interior.price +
    (config.carbonPackage ? 2850 : 0);

  const cameraPills: { id: CameraViewPreset; label: string; icon?: React.ReactNode }[] = [
    { id: 'cinematic', label: 'Cinematic Orbit' },
    { id: 'orbit', label: '360° Free Orbit' },
    { id: 'front-quarter', label: 'Front 3/4' },
    { id: 'side', label: 'Side Profile' },
    { id: 'rear-quarter', label: 'Rear Quad' },
    { id: 'interior', label: 'Cockpit POV' },
    { id: 'engine-bay', label: 'V8 Engine' },
    { id: 'wheel-closeup', label: 'Brembo Wheels' },
  ];

  return (
    <header className="absolute top-0 left-0 right-0 z-30 pointer-events-none p-3 sm:p-5 flex flex-col gap-2.5">
      {/* Top Main Navigation Bar */}
      <div className="w-full flex items-center justify-between gap-3">
        
        {/* Brand & Trim Title in Bold Typography Style */}
        <div className="pointer-events-auto flex items-center gap-4 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
          {/* Mustang Iconic Emblem */}
          <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-sm font-black text-rose-500 font-mono">🐎</span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold tracking-[0.25em] text-rose-500 uppercase">
                FORD MUSTANG 3D STUDIO
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-white/10 text-zinc-300 border border-white/10">
                GEN-7 S650
              </span>
            </div>
            
            {/* Trim Switcher Select with Bold Italic Typography */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base sm:text-lg font-black tracking-[0.15em] italic text-white uppercase underline underline-offset-4 decoration-rose-600">
                {currentTrim.badge}
              </span>
              <span className="text-zinc-600 text-xs">/</span>
              <select
                id="trim-selector-dropdown"
                value={config.trim}
                onChange={(e) => {
                  const newTrimId = e.target.value as TrimId;
                  onConfigChange((prev) => ({
                    ...prev,
                    trim: newTrimId,
                  }));
                }}
                className="bg-transparent text-xs sm:text-sm font-bold text-zinc-300 cursor-pointer focus:outline-none hover:text-white uppercase tracking-wider transition-colors"
              >
                {Object.values(TRIM_SPECS).map((trim) => (
                  <option key={trim.id} value={trim.id} className="bg-[#0a0a0a] text-white">
                    {trim.name} • {trim.hp} HP
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Live Estimated MSRP & Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2 sm:gap-3">
          
          {/* Price Tag Pill */}
          <div className="hidden md:flex flex-col items-end bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 shadow-2xl">
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-400">
              ESTIMATED MSRP
            </span>
            <span className="text-lg sm:text-xl font-black text-white tracking-tight font-mono">
              ${totalMSRP.toLocaleString()}
            </span>
          </div>

          {/* Engine Sound Toggle Button */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute V8 Engine Audio' : 'Enable V8 Engine Audio'}
            className={`px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl border flex items-center gap-2 text-xs font-bold uppercase tracking-wider backdrop-blur-xl transition-all ${
              soundEnabled
                ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30 animate-pulse'
                : 'bg-[#0a0a0a]/90 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isEngineRunning ? 'V8 ACTIVE' : 'AUDIO ON'}
            </span>
          </button>

          {/* Photo Snapshot Button */}
          <button
            id="photo-snapshot-btn"
            onClick={onTakeScreenshot}
            title="Take High-Resolution Studio Photo"
            className="p-2 sm:px-3.5 sm:py-2.5 rounded-xl border border-white/10 bg-[#0a0a0a]/90 hover:bg-white/10 text-zinc-300 hover:text-white backdrop-blur-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wider shadow-lg"
          >
            <Camera className="w-4 h-4 text-rose-500" />
            <span className="hidden sm:inline">Photo</span>
          </button>

          {/* Share / Save Build Button (High Contrast White CTA) */}
          <button
            id="share-build-btn"
            onClick={onOpenShareModal}
            title="Share or Save Build"
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl bg-white hover:bg-zinc-200 text-black font-black uppercase text-xs tracking-widest transition-all flex items-center gap-2 shadow-xl shadow-white/5"
          >
            <Share2 className="w-3.5 h-3.5 text-black" />
            <span>Share</span>
          </button>

          {/* Reset Config Button */}
          <button
            id="reset-build-btn"
            onClick={onResetConfig}
            title="Reset to Factory Defaults"
            className="p-2.5 rounded-xl border border-white/10 bg-[#0a0a0a]/90 hover:bg-white/10 text-zinc-400 hover:text-white backdrop-blur-xl transition-all"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera View Angle Selector Pills Bar */}
      <div className="pointer-events-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 w-full max-w-4xl mx-auto justify-start sm:justify-center">
        <span className="hidden md:inline text-[10px] font-bold tracking-widest text-zinc-500 uppercase mr-1">
          CAMERA:
        </span>
        {cameraPills.map((pill) => {
          const isActive = cameraPreset === pill.id;
          return (
            <button
              key={pill.id}
              id={`camera-preset-${pill.id}`}
              onClick={() => onCameraChange(pill.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 backdrop-blur-md border ${
                isActive
                  ? 'bg-white text-black font-black border-white shadow-lg shadow-white/10 scale-105'
                  : 'bg-[#0a0a0a]/80 text-zinc-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {pill.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
