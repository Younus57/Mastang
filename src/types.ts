export type TrimId = 'dark-horse' | 'shelby-gt500' | 'gt-performance' | 'mach-1';

export type PaintFinishType = 'gloss' | 'metallic' | 'matte' | 'satin' | 'pearlescent';

export interface PaintOption {
  id: string;
  name: string;
  hex: string;
  finish: PaintFinishType;
  metalness: number;
  roughness: number;
  clearcoat?: number;
  price: number;
  category: 'Classic' | 'Signature' | 'Heritage' | 'Custom';
}

export interface StripeOption {
  id: string;
  name: string;
  type: 'none' | 'dual-center' | 'wide-center' | 'side-rocker';
  color: string;
  price: number;
}

export interface WheelOption {
  id: string;
  name: string;
  style: 'dark-horse-star' | 'shelby-mesh' | 'aero-turbine' | 'classic-magnum';
  finish: string;
  hex: string;
  sizeInch: number;
  price: number;
}

export interface CaliperOption {
  id: string;
  name: string;
  hex: string;
  brand: 'Brembo' | 'Performance';
  price: number;
}

export interface InteriorTrimOption {
  id: string;
  name: string;
  seatColor: string;
  seatSecondaryColor: string;
  stitchColor: string;
  material: 'Nappa Leather' | 'Alcantara Suede' | 'Sport Cloth' | 'Recaro Leather';
  dashInlay: 'Carbon Fiber' | 'Brushed Aluminum' | 'Forged Carbon' | 'Piano Black';
  price: number;
}

export interface EnvironmentPreset {
  id: string;
  name: string;
  subtitle: string;
  bgColor: string;
  groundColor: string;
  groundRoughness: number;
  groundMetalness: number;
  groundReflectivity: number;
  showFloorGrid: boolean;
  ambientIntensity: number;
  directionalIntensity: number;
  directionalColor: string;
  skyLightColor: string;
  accentLightColor: string;
  accentLightIntensity: number;
  fogColor: string;
  fogDensity: number;
  hasLightTubes: boolean;
  theme: 'dark' | 'light' | 'sunset' | 'cyberpunk' | 'track';
}

export type DriveMode = 'normal' | 'sport' | 'track' | 'drag';

export type CameraViewPreset = 
  | 'orbit' 
  | 'front-quarter' 
  | 'side' 
  | 'rear-quarter' 
  | 'interior' 
  | 'engine-bay' 
  | 'wheel-closeup' 
  | 'top-down'
  | 'cinematic';

export interface VehicleAnimationState {
  doorsOpen: boolean;
  hoodOpen: boolean;
  spoilerDeployed: boolean;
  spoilerAngle: number; // 0 to 1
  headlightsOn: boolean;
  highBeamsOn: boolean;
  hazardLightsOn: boolean;
  underglowOn: boolean;
  underglowColor: string;
  suspensionHeight: number; // -1 (slammed) to 1 (lifted)
  wheelAngle: number; // steering angle in radians
  wheelSpinning: boolean;
  wheelSpinSpeed: number;
  engineRunning: boolean;
  engineRpm: number;
  isRevving: boolean;
  exhaustFlames: boolean;
  launchControlActive: boolean;
}

export interface TrimSpec {
  id: TrimId;
  name: string;
  subtitle: string;
  badge: string;
  basePrice: number;
  hp: number;
  torque: number; // lb-ft
  zeroToSixty: string; // e.g. "3.7s"
  topSpeed: string; // e.g. "186 mph"
  engine: string;
  transmission: string;
  defaultPaint: string;
  defaultWheel: string;
  defaultCaliper: string;
  defaultInterior: string;
  hasSupercharger: boolean;
  hasActiveSpoiler: boolean;
}

export interface CarConfiguration {
  trim: TrimId;
  paint: PaintOption;
  stripe: StripeOption;
  wheel: WheelOption;
  caliper: CaliperOption;
  carbonPackage: boolean;
  windowTintPercent: number; // 0 = clear, 70 = medium, 95 = limo
  interior: InteriorTrimOption;
  ambientLightColor: string;
  ambientLightBrightness: number;
  driveMode: DriveMode;
  exhaustSoundValve: 'quiet' | 'normal' | 'sport' | 'track';
}
