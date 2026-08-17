import React from 'react';
import { VehicleAnimationState } from '../types';
import { 
  Sparkles, 
  Layers, 
  Sliders, 
  Lightbulb, 
  Flame, 
  Activity, 
  ArrowUpCircle,
  Zap
} from 'lucide-react';

interface AnimationControlsProps {
  animState: VehicleAnimationState;
  onUpdateAnimState: (updater: (prev: VehicleAnimationState) => VehicleAnimationState) => void;
  onRevStart: () => void;
  onRevEnd: () => void;
  onToggleLaunchControl: () => void;
}

export const AnimationControls: React.FC<AnimationControlsProps> = ({
  animState,
  onUpdateAnimState,
  onRevStart,
  onRevEnd,
  onToggleLaunchControl,
}) => {
  const underglowPalette = ['#e11d48', '#00e5ff', '#39ff14', '#9d00ff', '#ffaa00', '#ffffff'];

  return (
    <div className="absolute bottom-9 sm:bottom-11 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-3xl px-3 flex flex-col items-center gap-2">
      
      {/* Main Vehicle Interaction Dock */}
      <div className="pointer-events-auto w-full bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2.5">
        
        {/* Row 1: Interactive Animation Toggles */}
        <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar pb-1">
          
          {/* Hood Toggle */}
          <button
            id="toggle-hood-btn"
            onClick={() => onUpdateAnimState((prev) => ({ ...prev, hoodOpen: !prev.hoodOpen }))}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shrink-0 ${
              animState.hoodOpen
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{animState.hoodOpen ? 'CLOSE HOOD' : 'OPEN HOOD'}</span>
          </button>

          {/* Doors Toggle */}
          <button
            id="toggle-doors-btn"
            onClick={() => onUpdateAnimState((prev) => ({ ...prev, doorsOpen: !prev.doorsOpen }))}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shrink-0 ${
              animState.doorsOpen
                ? 'bg-rose-600 text-white border-rose-500 shadow-lg shadow-rose-600/30'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{animState.doorsOpen ? 'CLOSE DOORS' : 'OPEN DOORS'}</span>
          </button>

          {/* Active Aero Wing Spoiler */}
          <button
            id="toggle-spoiler-btn"
            onClick={() => onUpdateAnimState((prev) => ({ ...prev, spoilerDeployed: !prev.spoilerDeployed }))}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shrink-0 ${
              animState.spoilerDeployed
                ? 'bg-white text-black border-white shadow-lg shadow-white/10 font-black'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <ArrowUpCircle className="w-3.5 h-3.5" />
            <span>{animState.spoilerDeployed ? 'WING ACTIVE' : 'DEPLOY WING'}</span>
          </button>

          {/* Headlights Toggle */}
          <button
            id="toggle-headlights-btn"
            onClick={() => onUpdateAnimState((prev) => ({ ...prev, headlightsOn: !prev.headlightsOn }))}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shrink-0 ${
              animState.headlightsOn
                ? 'bg-amber-400 text-black border-amber-300 shadow-lg shadow-amber-400/20'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{animState.headlightsOn ? 'LIGHTS ON' : 'LIGHTS OFF'}</span>
          </button>

          {/* Sequential Hazard Lights */}
          <button
            id="toggle-hazards-btn"
            onClick={() => onUpdateAnimState((prev) => ({ ...prev, hazardLightsOn: !prev.hazardLightsOn }))}
            className={`px-3 py-1.5 sm:py-2 rounded-xl text-[11px] font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 shrink-0 ${
              animState.hazardLightsOn
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse shadow-lg shadow-rose-600/30'
                : 'bg-white/5 text-zinc-300 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>SIGNALS</span>
          </button>
        </div>

        {/* Row 2: Suspension Stance, Underglow & Performance Rev Trigger */}
        <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pt-2 border-t border-white/10">
          
          {/* Suspension Height Stance Slider */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 font-mono text-[10px] font-bold uppercase tracking-wider">STANCE:</span>
            <input
              id="suspension-stance-slider"
              type="range"
              min="-1"
              max="1"
              step="0.1"
              value={animState.suspensionHeight}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateAnimState((prev) => ({ ...prev, suspensionHeight: val }));
              }}
              className="w-16 sm:w-20 accent-rose-600 cursor-pointer"
            />
            <span className="text-[10px] font-mono font-bold text-rose-500 w-16 text-right">
              {animState.suspensionHeight < -0.3
                ? 'TRACK SLAM'
                : animState.suspensionHeight > 0.3
                ? 'LIFTED'
                : 'FACTORY'}
            </span>
          </div>

          {/* Underglow Neon RGB Palette */}
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-xl px-2.5 py-1.5">
            <button
              onClick={() => onUpdateAnimState((prev) => ({ ...prev, underglowOn: !prev.underglowOn }))}
              className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                animState.underglowOn ? 'bg-rose-600 text-white' : 'bg-white/10 text-zinc-400'
              }`}
            >
              NEON
            </button>
            <div className="flex items-center gap-1">
              {underglowPalette.map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdateAnimState((prev) => ({ ...prev, underglowOn: true, underglowColor: color }))}
                  className="w-3.5 h-3.5 rounded-full border border-white/20 transition-transform hover:scale-125"
                  style={{ backgroundColor: color }}
                  title={`Set neon color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Launch Control Burnout & Rev Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Launch Control / Dyno Mode */}
            <button
              id="launch-control-btn"
              onClick={onToggleLaunchControl}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center gap-1.5 ${
                animState.launchControlActive
                  ? 'bg-amber-400 text-black border-amber-300 animate-pulse shadow-lg shadow-amber-400/30'
                  : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{animState.launchControlActive ? 'LAUNCHING...' : '2-STEP LAUNCH'}</span>
            </button>

            {/* Interactive V8 Throttle / Rev Button in Bold Style */}
            <button
              id="throttle-rev-btn"
              onPointerDown={onRevStart}
              onPointerUp={onRevEnd}
              onPointerLeave={onRevEnd}
              className={`px-4 sm:px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all flex items-center gap-1.5 shadow-xl select-none active:scale-95 ${
                animState.isRevving
                  ? 'bg-rose-600 text-white border-rose-500 shadow-rose-600/50 scale-105 animate-pulse'
                  : 'bg-white hover:bg-zinc-200 text-black border-white'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-600" />
              <span>{animState.isRevving ? 'REDLINE 🔥' : 'REV ENGINE'}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
