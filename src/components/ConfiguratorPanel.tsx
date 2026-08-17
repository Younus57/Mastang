import React, { useState } from 'react';
import { 
  CarConfiguration, 
  EnvironmentPreset, 
  TrimId, 
  PaintOption, 
  WheelOption, 
  CaliperOption, 
  InteriorTrimOption, 
  StripeOption 
} from '../types';
import { 
  TRIM_SPECS, 
  PAINT_OPTIONS, 
  STRIPE_OPTIONS, 
  WHEEL_OPTIONS, 
  CALIPER_OPTIONS, 
  INTERIOR_OPTIONS, 
  ENVIRONMENT_PRESETS 
} from '../data/configOptions';
import { 
  Palette, 
  Disc, 
  SlidersHorizontal, 
  Armchair, 
  SunMedium, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Sparkles,
  Layers,
  Volume2,
  X
} from 'lucide-react';

interface ConfiguratorPanelProps {
  config: CarConfiguration;
  onConfigChange: (updater: (prev: CarConfiguration) => CarConfiguration) => void;
  environment: EnvironmentPreset;
  onEnvironmentChange: (env: EnvironmentPreset) => void;
}

type TabType = 'trim' | 'paint' | 'wheels' | 'interior' | 'studio';

export const ConfiguratorPanel: React.FC<ConfiguratorPanelProps> = ({
  config,
  onConfigChange,
  environment,
  onEnvironmentChange,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('paint');
  const [paintCategoryFilter, setPaintCategoryFilter] = useState<string>('All');
  const [customColorHex, setCustomColorHex] = useState(config.paint.hex);

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'trim', label: 'Trim', icon: <Layers className="w-4 h-4" /> },
    { id: 'paint', label: 'Exterior', icon: <Palette className="w-4 h-4" /> },
    { id: 'wheels', label: 'Wheels & Brakes', icon: <Disc className="w-4 h-4" /> },
    { id: 'interior', label: 'Interior', icon: <Armchair className="w-4 h-4" /> },
    { id: 'studio', label: 'Lighting & Studio', icon: <SunMedium className="w-4 h-4" /> },
  ];

  const paintCategories = ['All', 'Signature', 'Classic', 'Heritage', 'Custom'];

  const filteredPaints = paintCategoryFilter === 'All' 
    ? PAINT_OPTIONS 
    : PAINT_OPTIONS.filter((p) => p.category === paintCategoryFilter);

  return (
    <>
      {/* Toggle Drawer Tab Button (when panel is collapsed) */}
      {!isOpen && (
        <button
          id="open-configurator-drawer-btn"
          onClick={() => setIsOpen(true)}
          className="fixed right-3 sm:right-6 top-24 sm:top-28 z-30 bg-[#0a0a0a]/90 text-white hover:text-rose-500 border border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest transition-all hover:scale-105"
        >
          <SlidersHorizontal className="w-4 h-4 text-rose-600" />
          <span>CONFIGURE</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {/* Main Customizer Drawer in Bold Typography Theme */}
      <aside
        className={`fixed top-20 sm:top-24 right-3 sm:right-6 bottom-10 sm:bottom-12 z-30 w-[calc(100vw-24px)] sm:w-[420px] max-w-[95vw] bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isOpen ? 'translate-x-0 opacity-100' : 'translate-x-[110%] opacity-0 pointer-events-none'
        }`}
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/5">
          <div>
            <div className="text-[9px] uppercase tracking-widest text-rose-500 font-black mb-0.5">
              CONFIGURATION ACTIVE
            </div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white font-display">
              MUSTANG BESPOKE STUDIO
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center justify-between p-2 bg-[#0a0a0a] border-b border-white/10 overflow-x-auto no-scrollbar shrink-0 gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`config-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10 font-black scale-105'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Configuration Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-zinc-200">
          
          {/* TAB 1: TRIM & MODEL */}
          {activeTab === 'trim' && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold mb-1">
                  EDITION SPECIFICATION
                </label>
                <p className="text-xs text-zinc-400">
                  Select powertrain calibrations, aerodynamics, and bespoke badging.
                </p>
              </div>

              <div className="space-y-3">
                {Object.values(TRIM_SPECS).map((trim) => {
                  const isSelected = config.trim === trim.id;
                  return (
                    <div
                      key={trim.id}
                      onClick={() => onConfigChange((prev) => ({ ...prev, trim: trim.id }))}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-white/10 border-rose-600 ring-1 ring-rose-600 shadow-lg'
                          : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-white text-sm uppercase tracking-tight">{trim.name}</span>
                            {trim.hasSupercharger && (
                              <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-600/20 text-rose-400 border border-rose-600/40">
                                SUPERCHARGED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400 mt-1">{trim.subtitle}</p>
                        </div>
                        <span className="text-sm font-mono font-black text-white">
                          ${trim.basePrice.toLocaleString()}
                        </span>
                      </div>

                      {/* Mini Specs */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-white/10 text-[11px] font-mono">
                        <div>
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-widest">OUTPUT</span>
                          <span className="font-black text-rose-500">{trim.hp} HP</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-widest">0-60 MPH</span>
                          <span className="font-black text-white">{trim.zeroToSixty}</span>
                        </div>
                        <div>
                          <span className="text-zinc-500 block text-[8px] font-bold uppercase tracking-widest">TOP SPEED</span>
                          <span className="font-black text-zinc-300">{trim.topSpeed}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EXTERIOR PAINT & STRIPES */}
          {activeTab === 'paint' && (
            <div className="space-y-6">
              
              {/* Paint Categories Filter */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    EXTERIOR FINISH
                  </label>
                  <span className="text-xs font-mono text-rose-500 font-bold">
                    {config.paint.name}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-3">
                  {paintCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setPaintCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        paintCategoryFilter === cat
                          ? 'bg-white text-black font-black'
                          : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Color Swatch Grid with Bold Rings */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {filteredPaints.map((paint) => {
                    const isSelected = config.paint.id === paint.id;
                    return (
                      <button
                        key={paint.id}
                        id={`paint-swatch-${paint.id}`}
                        onClick={() => onConfigChange((prev) => ({ ...prev, paint }))}
                        className={`group relative flex flex-col items-center p-1.5 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-white/10 border-white/20 scale-105'
                            : 'bg-white/5 border-white/5 hover:border-white/20'
                        }`}
                        title={`${paint.name} ($${paint.price})`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full relative flex items-center justify-center transition-all ${
                            isSelected
                              ? 'ring-2 ring-rose-600 ring-offset-4 ring-offset-[#0a0a0a]'
                              : 'border border-white/20 hover:scale-110'
                          }`}
                          style={{ backgroundColor: paint.hex }}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                        </div>
                        <span className="text-[9px] font-bold text-zinc-300 mt-2 truncate w-full text-center uppercase tracking-tight">
                          {paint.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Color Picker & Finish Customizer */}
                <div className="mt-4 p-3 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold uppercase tracking-wider text-white text-[11px]">Bespoke Formula:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.paint.hex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          setCustomColorHex(hex);
                          onConfigChange((prev) => ({
                            ...prev,
                            paint: {
                              ...prev.paint,
                              id: 'custom-paint',
                              name: 'Bespoke Custom Formula',
                              hex,
                            },
                          }));
                        }}
                        className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                      />
                      <span className="font-mono text-rose-500 font-bold uppercase">{config.paint.hex}</span>
                    </div>
                  </div>

                  {/* Clearcoat & Roughness Slider */}
                  <div>
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                      <span>Metallic Flake Density</span>
                      <span className="font-mono text-white">{Math.round(config.paint.metalness * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={config.paint.metalness}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        onConfigChange((prev) => ({
                          ...prev,
                          paint: { ...prev.paint, metalness: val },
                        }));
                      }}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Le Mans Racing Stripes */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    RACING GRAPHICS
                  </label>
                  <span className="text-xs font-mono text-zinc-300 font-bold">
                    {config.stripe.price > 0 ? `+$${config.stripe.price}` : 'INCLUDED'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {STRIPE_OPTIONS.map((stripe) => {
                    const isSelected = config.stripe.id === stripe.id;
                    return (
                      <button
                        key={stripe.id}
                        id={`stripe-option-${stripe.id}`}
                        onClick={() => onConfigChange((prev) => ({ ...prev, stripe }))}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-white/10 border-rose-600 text-white font-bold'
                            : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0"
                            style={{ backgroundColor: stripe.color }}
                          />
                          <span className="text-xs font-bold leading-tight uppercase tracking-tight">{stripe.name}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Carbon Fiber Package & Window Tint */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-white block">Carbon Fiber Track Aero Pack</span>
                    <span className="text-[10px] text-zinc-400">
                      Front splitter, carbon roof & rear diffuser (+$2,850)
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.carbonPackage}
                    onChange={(e) => onConfigChange((prev) => ({ ...prev, carbonPackage: e.target.checked }))}
                    className="w-5 h-5 accent-rose-600 rounded cursor-pointer"
                  />
                </div>

                {/* Window Tint Slider */}
                <div>
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                    <span>Privacy Glass & Window Tint</span>
                    <span className="font-mono text-rose-500 font-bold">{config.windowTintPercent}% Dark</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="95"
                    step="5"
                    value={config.windowTintPercent}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      onConfigChange((prev) => ({ ...prev, windowTintPercent: val }));
                    }}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: WHEELS & BRAKES */}
          {activeTab === 'wheels' && (
            <div className="space-y-6">
              
              {/* Alloy Wheel Styles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    FORGED WHEELS
                  </label>
                  <span className="text-xs font-mono text-zinc-300 font-bold">
                    {config.wheel.price > 0 ? `+$${config.wheel.price}` : 'STANDARD'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {WHEEL_OPTIONS.map((wheel) => {
                    const isSelected = config.wheel.id === wheel.id;
                    return (
                      <div
                        key={wheel.id}
                        id={`wheel-choice-${wheel.id}`}
                        onClick={() => onConfigChange((prev) => ({ ...prev, wheel }))}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-white/10 border-rose-600 shadow-md'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border border-white/20 shrink-0 shadow-inner flex items-center justify-center"
                            style={{ backgroundColor: wheel.hex }}
                          >
                            <Disc className="w-5 h-5 text-white/50" />
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-tight text-white block">{wheel.name}</span>
                            <span className="text-[9px] text-zinc-400 font-mono uppercase">{wheel.finish}</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {wheel.price > 0 ? `+$${wheel.price}` : 'INCLUDED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Brembo Brake Calipers */}
              <div className="pt-3 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    BREMBO® SIX-PISTON CALIPERS
                  </label>
                  <span className="text-xs font-mono text-rose-500 font-bold">
                    {config.caliper.name}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {CALIPER_OPTIONS.map((caliper) => {
                    const isSelected = config.caliper.id === caliper.id;
                    return (
                      <button
                        key={caliper.id}
                        id={`caliper-swatch-${caliper.id}`}
                        onClick={() => onConfigChange((prev) => ({ ...prev, caliper }))}
                        className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                          isSelected
                            ? 'bg-white/10 border-rose-600 scale-105'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <span
                          className="w-7 h-5 rounded-md border border-white/20 shadow-md"
                          style={{ backgroundColor: caliper.hex }}
                        />
                        <span className="text-[9px] font-black uppercase tracking-tight text-zinc-300 text-center leading-tight">
                          {caliper.name.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: INTERIOR & COCKPIT LIGHTING */}
          {activeTab === 'interior' && (
            <div className="space-y-6">
              
              {/* Recaro Leather Seats */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    RECARO® COCKPIT UPHOLSTERY
                  </label>
                  <span className="text-xs font-mono text-zinc-300 font-bold">
                    {config.interior.price > 0 ? `+$${config.interior.price}` : 'STANDARD'}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {INTERIOR_OPTIONS.map((interior) => {
                    const isSelected = config.interior.id === interior.id;
                    return (
                      <div
                        key={interior.id}
                        id={`interior-theme-${interior.id}`}
                        onClick={() => onConfigChange((prev) => ({ ...prev, interior }))}
                        className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                          isSelected
                            ? 'bg-white/10 border-rose-600'
                            : 'bg-white/5 border-white/10 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center -space-x-2">
                            <span
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{ backgroundColor: interior.seatColor }}
                            />
                            <span
                              className="w-6 h-6 rounded-full border border-white/20"
                              style={{ backgroundColor: interior.seatSecondaryColor }}
                            />
                          </div>
                          <div>
                            <span className="text-xs font-black uppercase tracking-tight text-white block">{interior.name}</span>
                            <span className="text-[9px] text-zinc-400 font-mono uppercase">
                              {interior.material} • {interior.dashInlay} Trim
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-white">
                          {interior.price > 0 ? `+$${interior.price}` : 'INCLUDED'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 360 Ambient Cabin LED Strips */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold">
                    AMBIENT CABIN LED
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.ambientLightColor}
                      onChange={(e) => onConfigChange((prev) => ({ ...prev, ambientLightColor: e.target.value }))}
                      className="w-6 h-6 rounded cursor-pointer bg-transparent border-0"
                    />
                    <span className="font-mono text-xs text-rose-500 font-bold uppercase">{config.ambientLightColor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {['#e11d48', '#00e5ff', '#ffaa00', '#39ff14', '#9d00ff', '#ffffff'].map((color) => (
                    <button
                      key={color}
                      onClick={() => onConfigChange((prev) => ({ ...prev, ambientLightColor: color }))}
                      className="flex-1 h-7 rounded-lg border border-white/20 transition-transform hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: STUDIO LIGHTING & ENVIRONMENT */}
          {activeTab === 'studio' && (
            <div className="space-y-6">
              
              <div>
                <label className="text-[10px] uppercase tracking-widest opacity-60 block font-bold mb-2">
                  ENVIRONMENT LIGHTING PRESET
                </label>

                {/* Lighting Presets Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {ENVIRONMENT_PRESETS.map((preset) => {
                    const isSelected = environment.id === preset.id;
                    return (
                      <button
                        key={preset.id}
                        id={`env-preset-${preset.id}`}
                        onClick={() => onEnvironmentChange(preset)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-white bg-white text-black font-black shadow-lg shadow-white/10'
                            : 'border-white/20 uppercase font-bold text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="text-[11px] font-black uppercase tracking-wider">{preset.name}</div>
                        <div className={`text-[8px] uppercase tracking-widest mt-0.5 ${isSelected ? 'text-zinc-700 font-bold' : 'text-zinc-500'}`}>
                          {preset.theme}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time Light Intensity & Floor Sliders */}
              <div className="pt-3 border-t border-white/10 space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Studio Key Light Intensity</span>
                  <span className="font-mono text-white font-bold">{environment.directionalIntensity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="6.0"
                  step="0.2"
                  value={environment.directionalIntensity}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onEnvironmentChange({ ...environment, directionalIntensity: val });
                  }}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                {/* Floor Reflections Roughness */}
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">
                  <span>Floor Mirror Reflection</span>
                  <span className="font-mono text-white font-bold">
                    {Math.round((1 - environment.groundRoughness) * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.8"
                  step="0.05"
                  value={environment.groundRoughness}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onEnvironmentChange({ ...environment, groundRoughness: val });
                  }}
                  className="w-full accent-rose-600 cursor-pointer"
                />

                {/* Floor Grid Toggle */}
                <div className="flex items-center justify-between p-2.5 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-xs font-black uppercase tracking-wider text-white">Show Studio Grid Floor</span>
                  <input
                    type="checkbox"
                    checked={environment.showFloorGrid}
                    onChange={(e) => onEnvironmentChange({ ...environment, showFloorGrid: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Active Exhaust Sound Valve Mode */}
              <div className="pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-rose-500" />
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    EXHAUST VALVE SOUND PROFILE
                  </label>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['quiet', 'normal', 'sport', 'track'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => onConfigChange((prev) => ({ ...prev, exhaustSoundValve: mode }))}
                      className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        config.exhaustSoundValve === mode
                          ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                          : 'bg-white/5 border border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>
      </aside>
    </>
  );
};
