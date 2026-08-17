import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CarConfiguration, 
  VehicleAnimationState, 
  EnvironmentPreset, 
  CameraViewPreset, 
  DriveMode 
} from './types';
import { 
  DEFAULT_CONFIG, 
  ENVIRONMENT_PRESETS, 
  TRIM_SPECS 
} from './data/configOptions';
import { audioEngine } from './utils/audioEngine';
import { CarScene } from './3d/CarScene';
import { Header } from './components/Header';
import { SpecsOverlay } from './components/SpecsOverlay';
import { AnimationControls } from './components/AnimationControls';
import { ConfiguratorPanel } from './components/ConfiguratorPanel';
import { PhotoModal } from './components/PhotoModal';
import { ShareModal } from './components/ShareModal';

export default function App() {
  // Config state
  const [config, setConfig] = useState<CarConfiguration>(DEFAULT_CONFIG);
  const [environment, setEnvironment] = useState<EnvironmentPreset>(ENVIRONMENT_PRESETS[0]);
  const [cameraPreset, setCameraPreset] = useState<CameraViewPreset>('cinematic');

  // Animation and interaction state
  const [animState, setAnimState] = useState<VehicleAnimationState>({
    doorsOpen: false,
    hoodOpen: false,
    spoilerDeployed: true,
    spoilerAngle: 0.15,
    headlightsOn: true,
    highBeamsOn: false,
    hazardLightsOn: false,
    underglowOn: true,
    underglowColor: '#00e5ff',
    suspensionHeight: -0.4, // aggressive track stance
    wheelAngle: 0,
    wheelSpinning: false,
    wheelSpinSpeed: 0,
    engineRunning: false,
    engineRpm: 850,
    isRevving: false,
    exhaustFlames: false,
    launchControlActive: false,
  });

  // Sound and Audio state
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentRpm, setCurrentRpm] = useState(850);
  const revIntervalRef = useRef<number | null>(null);
  const launchIntervalRef = useRef<number | null>(null);

  // Modals state
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  // Scene API ref for screenshots
  const sceneApiRef = useRef<{ captureScreenshot: () => string } | null>(null);

  // Setup Audio Engine callbacks
  useEffect(() => {
    audioEngine.setOnRpmChange((rpm) => {
      setCurrentRpm(rpm);
      setAnimState((prev) => ({ ...prev, engineRpm: rpm }));
    });

    audioEngine.setOnBackfire(() => {
      setAnimState((prev) => ({ ...prev, exhaustFlames: true }));
      window.setTimeout(() => {
        setAnimState((prev) => ({ ...prev, exhaustFlames: false }));
      }, 140);
    });

    audioEngine.setExhaustMode(config.exhaustSoundValve);
    audioEngine.setHasSupercharger(TRIM_SPECS[config.trim].hasSupercharger);
  }, [config.exhaustSoundValve, config.trim]);

  // Handle Audio Toggle
  const handleToggleSound = () => {
    if (soundEnabled) {
      audioEngine.stop();
      setSoundEnabled(false);
      setAnimState((prev) => ({ ...prev, engineRunning: false }));
    } else {
      audioEngine.start();
      setSoundEnabled(true);
      setAnimState((prev) => ({ ...prev, engineRunning: true }));
    }
  };

  // Start Revving V8 Engine
  const handleRevStart = useCallback(() => {
    if (!soundEnabled) {
      audioEngine.start();
      setSoundEnabled(true);
    }
    setAnimState((prev) => ({
      ...prev,
      isRevving: true,
      engineRunning: true,
      wheelSpinning: true,
      wheelSpinSpeed: 0.6,
    }));

    audioEngine.revTo(6800 + Math.random() * 500);

    // Continuous throttle fluctuation
    if (revIntervalRef.current) clearInterval(revIntervalRef.current);
    revIntervalRef.current = window.setInterval(() => {
      audioEngine.revTo(6500 + Math.random() * 800);
    }, 120);
  }, [soundEnabled]);

  // End Revving V8 Engine
  const handleRevEnd = useCallback(() => {
    if (revIntervalRef.current) {
      clearInterval(revIntervalRef.current);
      revIntervalRef.current = null;
    }
    setAnimState((prev) => ({
      ...prev,
      isRevving: false,
      wheelSpinning: false,
      wheelSpinSpeed: 0,
    }));
    audioEngine.revTo(850);
  }, []);

  // Launch Control 2-Step Burnout Mode
  const handleToggleLaunchControl = () => {
    if (animState.launchControlActive) {
      // Deactivate
      if (launchIntervalRef.current) {
        clearInterval(launchIntervalRef.current);
        launchIntervalRef.current = null;
      }
      setAnimState((prev) => ({
        ...prev,
        launchControlActive: false,
        wheelSpinning: false,
        wheelSpinSpeed: 0,
        exhaustFlames: false,
      }));
      audioEngine.revTo(850);
    } else {
      // Activate
      if (!soundEnabled) {
        audioEngine.start();
        setSoundEnabled(true);
      }
      setAnimState((prev) => ({
        ...prev,
        launchControlActive: true,
        wheelSpinning: true,
        wheelSpinSpeed: 1.2,
      }));

      if (launchIntervalRef.current) clearInterval(launchIntervalRef.current);
      launchIntervalRef.current = window.setInterval(() => {
        audioEngine.launchStutter();
        setAnimState((prev) => ({ ...prev, exhaustFlames: Math.random() > 0.4 }));
      }, 100);
    }
  };

  // Keyboard Shortcuts (Spacebar to Rev)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        handleRevStart();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target instanceof HTMLInputElement)) {
        e.preventDefault();
        handleRevEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleRevStart, handleRevEnd]);

  // Drive Mode Selection
  const handleDriveModeChange = (mode: DriveMode) => {
    setConfig((prev) => ({
      ...prev,
      driveMode: mode,
      exhaustSoundValve: mode === 'track' ? 'track' : mode === 'sport' ? 'sport' : 'normal',
    }));

    // Adjust suspension stance and spoiler for track mode
    if (mode === 'track') {
      setAnimState((prev) => ({
        ...prev,
        suspensionHeight: -0.6,
        spoilerDeployed: true,
      }));
    } else if (mode === 'drag') {
      setAnimState((prev) => ({
        ...prev,
        suspensionHeight: -0.2,
        spoilerDeployed: true,
      }));
    } else {
      setAnimState((prev) => ({
        ...prev,
        suspensionHeight: 0,
      }));
    }
  };

  // Screenshot capture
  const handleTakeScreenshot = () => {
    if (sceneApiRef.current) {
      const dataUrl = sceneApiRef.current.captureScreenshot();
      setPhotoDataUrl(dataUrl);
      setPhotoModalOpen(true);
    }
  };

  // Reset Config
  const handleResetConfig = () => {
    setConfig(DEFAULT_CONFIG);
    setEnvironment(ENVIRONMENT_PRESETS[0]);
    setCameraPreset('front-quarter');
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0a] text-white font-sans select-none flex flex-col justify-between">
      
      {/* Background Bold Typography Watermarks */}
      <div className="absolute top-[-30px] sm:top-[-40px] left-[-10px] sm:left-[-20px] text-[120px] sm:text-[220px] md:text-[280px] font-black opacity-[0.035] select-none leading-none tracking-tighter uppercase pointer-events-none z-0">
        Mustang
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-[0.025] pointer-events-none z-0">
        <span className="text-[180px] sm:text-[340px] md:text-[420px] font-black italic tracking-tighter uppercase">
          {config.trim === 'gt500' ? 'GT500' : config.trim === 'dark-horse' ? 'DARK' : 'V8 5.0L'}
        </span>
      </div>

      {/* 3D WebGL Canvas Layer */}
      <CarScene
        config={config}
        animState={animState}
        environment={environment}
        cameraPreset={cameraPreset}
        onCameraPresetChange={setCameraPreset}
        onSceneReady={(api) => {
          sceneApiRef.current = api;
        }}
      />

      {/* Top Header & Navigation */}
      <Header
        config={config}
        onConfigChange={setConfig}
        cameraPreset={cameraPreset}
        onCameraChange={setCameraPreset}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        isEngineRunning={animState.engineRunning}
        onTakeScreenshot={handleTakeScreenshot}
        onOpenShareModal={() => setShareModalOpen(true)}
        onResetConfig={handleResetConfig}
      />

      {/* Performance Spec & Live Telemetry HUD */}
      <SpecsOverlay
        config={config}
        onDriveModeChange={handleDriveModeChange}
        currentRpm={currentRpm}
        isRevving={animState.isRevving}
        isLaunchControl={animState.launchControlActive}
      />

      {/* Interactive Vehicle Animation Controls Dock */}
      <AnimationControls
        animState={animState}
        onUpdateAnimState={setAnimState}
        onRevStart={handleRevStart}
        onRevEnd={handleRevEnd}
        onToggleLaunchControl={handleToggleLaunchControl}
      />

      {/* Right Drawer Customizer Studio */}
      <ConfiguratorPanel
        config={config}
        onConfigChange={setConfig}
        environment={environment}
        onEnvironmentChange={setEnvironment}
      />

      {/* Bold Performance Suite Ticker Footer Strip */}
      <footer className="absolute bottom-0 left-0 right-0 h-6 sm:h-7 bg-rose-600 z-10 flex items-center px-4 overflow-hidden border-t border-rose-500 shadow-lg">
        <div className="animate-ticker flex gap-12 whitespace-nowrap text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-white">
          <span>DARK HORSE PERFORMANCE SUITE</span>
          <span>•</span>
          <span>5.0L COYOTE V8 DUAL THROTTLE BODY</span>
          <span>•</span>
          <span>MAGNERIDE® ACTIVE DAMPING SYSTEM</span>
          <span>•</span>
          <span>BREMBO® SIX-PISTON FORGED BRAKES</span>
          <span>•</span>
          <span>ACTIVE VALVE QUAD EXHAUST SYSTEM</span>
          <span>•</span>
          <span>TREMEC® 6-SPEED / 10-SPEED SELECTSHIFT®</span>
          <span>•</span>
          <span>DARK HORSE PERFORMANCE SUITE</span>
          <span>•</span>
          <span>5.0L COYOTE V8 DUAL THROTTLE BODY</span>
          <span>•</span>
          <span>MAGNERIDE® ACTIVE DAMPING SYSTEM</span>
          <span>•</span>
          <span>BREMBO® SIX-PISTON FORGED BRAKES</span>
          <span>•</span>
          <span>ACTIVE VALVE QUAD EXHAUST SYSTEM</span>
        </div>
      </footer>

      {/* Photo Mode Snapshot Modal */}
      {photoModalOpen && (
        <PhotoModal
          imageDataUrl={photoDataUrl}
          config={config}
          onClose={() => setPhotoModalOpen(false)}
        />
      )}

      {/* Share / Save Build Modal */}
      {shareModalOpen && (
        <ShareModal
          config={config}
          onClose={() => setShareModalOpen(false)}
        />
      )}

    </div>
  );
}
