import React from 'react';
import { TrimSpec, DriveMode, CarConfiguration } from '../types';
import { TRIM_SPECS } from '../data/configOptions';
import { Gauge, Zap, Flame, Shield, Compass } from 'lucide-react';

interface SpecsOverlayProps {
  config: CarConfiguration;
  onDriveModeChange: (mode: DriveMode) => void;
  currentRpm: number;
  isRevving: boolean;
  isLaunchControl: boolean;
}

export const SpecsOverlay: React.FC<SpecsOverlayProps> = ({
  config,
  onDriveModeChange,
  currentRpm,
  isRevving,
  isLaunchControl,
}) => {
  const currentTrim = TRIM_SPECS[config.trim];
  const maxRpm = 7500;
  const rpmPercent = Math.min(100, (currentRpm / maxRpm) * 100);
  const boostPsi = Math.max(0, ((currentRpm - 2500) / (maxRpm - 2500)) * (currentTrim.hasSupercharger ? 14.5 : 4.0));

  const driveModes: { id: DriveMode; label: string; icon: React.ReactNode }[] = [
    { id: 'normal', label: 'Normal', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'sport', label: 'Sport+', icon: <Zap className="w-3.5 h-3.5" /> },
    { id: 'track', label: 'Track', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'drag', label: 'Drag', icon: <Shield className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="absolute left-3 sm:left-6 top-24 sm:top-28 z-20 pointer-events-none flex flex-col gap-3 max-w-[280px] sm:max-w-xs">
      
      {/* Bold Editorial Headline Tag */}
      <div className="pointer-events-auto hidden md:block select-none">
        <h1 className="text-3xl lg:text-4xl font-black uppercase leading-[0.85] tracking-tighter text-white font-display drop-shadow-md">
          SCULPTED <br />
          <span className="text-rose-600">POWER.</span>
        </h1>
        <p className="mt-2 text-[11px] text-zinc-400 font-medium leading-tight">
          {currentTrim.engine} • Real-time 3D PBR customizer
        </p>
      </div>

      {/* Performance Spec Card in Bold Typography theme */}
      <div className="pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-300 font-mono">
              {currentTrim.badge} METRICS
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-rose-500 font-mono">
            {currentTrim.hp} HP
          </span>
        </div>

        {/* 4-Stat High-Contrast Performance Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">HORSEPOWER</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter font-display leading-none">
                {currentTrim.hp}
              </span>
              <span className="text-[10px] font-bold text-rose-500">HP</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">0 - 60 MPH</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tighter font-display leading-none">
                {currentTrim.zeroToSixty}
              </span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">TORQUE</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tighter font-display leading-none">
                {currentTrim.torque}
              </span>
              <span className="text-[9px] font-bold text-zinc-400">LB-FT</span>
            </div>
          </div>

          <div className="bg-white/5 border border-white/5 rounded-xl p-2.5 flex flex-col">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">TOP SPEED</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-xl sm:text-2xl font-black text-white tracking-tighter font-display leading-none">
                {currentTrim.topSpeed}
              </span>
            </div>
          </div>
        </div>

        {/* Live Digital Tachometer Cluster */}
        <div className="mt-2.5 bg-black/90 border border-white/10 rounded-xl p-2.5 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping" />
              <span className="text-zinc-400 font-bold tracking-widest uppercase">TELEMETRY</span>
            </div>
            <div className="flex items-center gap-2">
              {currentTrim.hasSupercharger && (
                <span className="text-[9px] text-rose-400 font-bold">
                  +{boostPsi.toFixed(1)} PSI
                </span>
              )}
              <span className="text-white font-black font-mono tracking-tight">
                {Math.round(currentRpm)} <span className="text-[9px] text-zinc-500 font-bold">RPM</span>
              </span>
            </div>
          </div>

          {/* RPM Progress Bar */}
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
            <div
              className={`h-full rounded-full transition-all duration-75 ${
                rpmPercent > 85
                  ? 'bg-rose-600 animate-pulse'
                  : 'bg-gradient-to-r from-zinc-400 via-rose-500 to-rose-600'
              }`}
              style={{ width: `${rpmPercent}%` }}
            />
          </div>

          <div className="flex justify-between text-[8px] font-mono text-zinc-600 font-bold">
            <span>IDLE 850</span>
            <span>4000</span>
            <span className="text-rose-600 font-black">7500 REDLINE</span>
          </div>
        </div>

        {/* Drive Modes Bar */}
        <div className="mt-2.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-1.5 block">
            DRIVE MODE CALIBRATION
          </span>
          <div className="grid grid-cols-4 gap-1">
            {driveModes.map((mode) => {
              const isActive = config.driveMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`drive-mode-${mode.id}`}
                  onClick={() => onDriveModeChange(mode.id)}
                  className={`px-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all flex flex-col items-center gap-0.5 ${
                    isActive
                      ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                      : 'bg-white/5 text-zinc-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode.icon}
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Keyboard Shortcut Hint Card in Bold Style */}
      <div className="hidden lg:flex pointer-events-auto bg-[#0a0a0a]/90 backdrop-blur-md border border-white/10 rounded-xl p-2.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex-col gap-1.5 shadow-xl">
        <div className="flex items-center gap-1.5 text-zinc-200">
          <span className="text-rose-500">⚡</span>
          <span className="tracking-[0.15em] text-[9px] font-black">KEYBOARD SHORTCUTS</span>
        </div>
        <div className="flex items-center justify-between text-zinc-300">
          <span className="text-[9px] font-semibold">Throttle V8 Rev</span>
          <kbd className="px-2 py-0.5 rounded bg-white text-black text-[9px] font-black font-mono shadow">
            SPACEBAR
          </kbd>
        </div>
      </div>

    </div>
  );
};
