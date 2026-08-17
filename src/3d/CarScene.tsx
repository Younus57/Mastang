import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { 
  CarConfiguration, 
  VehicleAnimationState, 
  EnvironmentPreset, 
  CameraViewPreset 
} from '../types';
import { buildMustangCarModel, CarModelRefs } from './CarModel';

interface CarSceneProps {
  config: CarConfiguration;
  animState: VehicleAnimationState;
  environment: EnvironmentPreset;
  cameraPreset: CameraViewPreset;
  onCameraPresetChange?: (preset: CameraViewPreset) => void;
  onSceneReady?: (api: { captureScreenshot: () => string }) => void;
}

export const CarScene: React.FC<CarSceneProps> = ({
  config,
  animState,
  environment,
  cameraPreset,
  onCameraPresetChange,
  onSceneReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modelRefs = useRef<CarModelRefs | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Studio lights refs
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const rimLightRef = useRef<THREE.DirectionalLight | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);
  const groundMeshRef = useRef<THREE.Mesh | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const lightRodsGroupRef = useRef<THREE.Group | null>(null);

  // Camera animation target coordinates
  const cameraTargetPos = useRef<THREE.Vector3>(new THREE.Vector3(3.8, 1.8, 4.2));
  const cameraLookTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.6, 0));
  const currentLookAt = useRef<THREE.Vector3>(new THREE.Vector3(0, 0.6, 0));

  // Orbit drag state
  const isDragging = useRef<boolean>(false);
  const previousMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const orbitRadius = useRef<number>(5.8);
  const orbitTheta = useRef<number>(Math.PI * 0.28); // Azimuth
  const orbitPhi = useRef<number>(Math.PI * 0.38); // Elevation
  const isUserInteracting = useRef<boolean>(false);
  const userInteractionTimeout = useRef<number | null>(null);

  // Tire smoke & burn particles
  const smokeParticlesRef = useRef<THREE.Points | null>(null);

  // Setup camera presets map
  const getPresetCoords = (preset: CameraViewPreset): { pos: THREE.Vector3; look: THREE.Vector3 } => {
    switch (preset) {
      case 'front-quarter':
        return { pos: new THREE.Vector3(3.2, 1.3, 3.8), look: new THREE.Vector3(0, 0.5, 0.4) };
      case 'side':
        return { pos: new THREE.Vector3(5.2, 1.2, 0.1), look: new THREE.Vector3(0, 0.55, 0) };
      case 'rear-quarter':
        return { pos: new THREE.Vector3(-3.2, 1.4, -3.8), look: new THREE.Vector3(0, 0.5, -0.4) };
      case 'interior':
        return { pos: new THREE.Vector3(-0.38, 0.82, 0.15), look: new THREE.Vector3(-0.35, 0.62, 1.2) };
      case 'engine-bay':
        return { pos: new THREE.Vector3(0, 2.2, 2.6), look: new THREE.Vector3(0, 0.4, 1.2) };
      case 'wheel-closeup':
        return { pos: new THREE.Vector3(1.9, 0.55, 1.5), look: new THREE.Vector3(0.9, 0.38, 1.35) };
      case 'top-down':
        return { pos: new THREE.Vector3(0.01, 7.5, 0.01), look: new THREE.Vector3(0, 0, 0) };
      case 'cinematic':
      case 'orbit':
      default:
        return { pos: new THREE.Vector3(3.8, 1.8, 4.2), look: new THREE.Vector3(0, 0.6, 0) };
    }
  };

  // Update target camera based on preset
  useEffect(() => {
    if (cameraPreset !== 'orbit') {
      const { pos, look } = getPresetCoords(cameraPreset);
      cameraTargetPos.current.copy(pos);
      cameraLookTarget.current.copy(look);

      // Recalculate spherical angles from preset pos
      const offset = pos.clone().sub(look);
      orbitRadius.current = offset.length();
      orbitPhi.current = Math.acos(Math.max(-1, Math.min(1, offset.y / orbitRadius.current)));
      orbitTheta.current = Math.atan2(offset.x, offset.z);
    }
  }, [cameraPreset]);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(environment.bgColor);
    scene.fog = new THREE.FogExp2(environment.fogColor, environment.fogDensity);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(3.8, 1.8, 4.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Studio Ground Plane & Grid
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    groundGeo.rotateX(-Math.PI / 2);
    const groundMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(environment.groundColor),
      roughness: environment.groundRoughness,
      metalness: environment.groundMetalness,
      envMapIntensity: environment.groundReflectivity,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    groundMesh.position.y = 0;
    scene.add(groundMesh);
    groundMeshRef.current = groundMesh;

    // Grid Floor
    const gridHelper = new THREE.GridHelper(30, 30, 0x00d2ff, 0x1f293d);
    gridHelper.position.y = 0.002;
    gridHelper.visible = environment.showFloorGrid;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    // 5. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, environment.ambientIntensity);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const hemiLight = new THREE.HemisphereLight(
      environment.skyLightColor,
      environment.groundColor,
      0.8
    );
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    // Key Light (Main Shadow Caster)
    const keyLight = new THREE.DirectionalLight(environment.directionalColor, environment.directionalIntensity);
    keyLight.position.set(6, 9, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0002;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Fill Light
    const fillLight = new THREE.DirectionalLight(0xaad4ff, 1.2);
    fillLight.position.set(-7, 5, -4);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Rim / Backlight (Dramatic edge silhouette)
    const rimLight = new THREE.DirectionalLight(environment.accentLightColor, environment.accentLightIntensity);
    rimLight.position.set(-5, 4, 8);
    scene.add(rimLight);
    rimLightRef.current = rimLight;

    // Studio Overhead Light Rods
    const lightRodsGroup = new THREE.Group();
    scene.add(lightRodsGroup);
    lightRodsGroupRef.current = lightRodsGroup;

    for (let r = -4; r <= 4; r += 4) {
      const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 8, 8);
      rodGeo.rotateZ(Math.PI / 2);
      const rodMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const rod = new THREE.Mesh(rodGeo, rodMat);
      rod.position.set(0, 5.2, r);
      lightRodsGroup.add(rod);
    }
    lightRodsGroup.visible = environment.hasLightTubes;

    // 6. Build Procedural Mustang Car
    const carModel = buildMustangCarModel(scene, config);
    modelRefs.current = carModel;

    // 7. Tire Smoke Particles for Launch Control / Wheel Spin
    const smokeCount = 80;
    const smokeGeo = new THREE.BufferGeometry();
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount * 3; i += 3) {
      smokePositions[i] = (Math.random() - 0.5) * 2.2;
      smokePositions[i + 1] = Math.random() * 0.4;
      smokePositions[i + 2] = -1.2 + (Math.random() - 0.5) * 1.5;
    }
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xcccccc,
      size: 0.35,
      transparent: true,
      opacity: 0.0,
    });
    const smokePoints = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokePoints);
    smokeParticlesRef.current = smokePoints;

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsed = clock.getElapsedTime();

      // Cinematic Auto-Orbit if requested or idle
      if (cameraPreset === 'cinematic' && !isUserInteracting.current) {
        orbitTheta.current += delta * 0.25;
        const targetX = Math.sin(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;
        const targetY = Math.cos(orbitPhi.current) * orbitRadius.current;
        const targetZ = Math.cos(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;
        cameraTargetPos.current.set(targetX, targetY, targetZ);
        cameraLookTarget.current.set(0, 0.55, 0);
      }

      // Smooth Camera Position Interpolation
      camera.position.lerp(cameraTargetPos.current, Math.min(1, delta * 6));
      currentLookAt.current.lerp(cameraLookTarget.current, Math.min(1, delta * 6));
      camera.lookAt(currentLookAt.current);

      // Update Car Model (Hood, Doors, Spoiler, Wheels, Lights, Suspension)
      carModel.update(delta, animState, config);

      // Animate Smoke Particles
      if (smokePoints && animState.wheelSpinning) {
        const mat = smokePoints.material as THREE.PointsMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.45, delta * 4);
        const pArray = smokeGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          pArray[i * 3 + 1] += delta * 0.6; // rise up
          pArray[i * 3 + 2] -= delta * 0.8; // blow backward
          if (pArray[i * 3 + 1] > 1.2) {
            pArray[i * 3 + 1] = 0.05;
            pArray[i * 3] = (Math.random() - 0.5) * 2.0;
            pArray[i * 3 + 2] = -1.2 + (Math.random() - 0.5) * 0.8;
          }
        }
        smokeGeo.attributes.position.needsUpdate = true;
      } else if (smokePoints) {
        const mat = smokePoints.material as THREE.PointsMaterial;
        mat.opacity = THREE.MathUtils.lerp(mat.opacity, 0.0, delta * 5);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Pass screenshot capture API
    if (onSceneReady) {
      onSceneReady({
        captureScreenshot: () => {
          renderer.render(scene, camera);
          return renderer.domElement.toDataURL('image/png');
        },
      });
    }

    // Resize Handler
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      carModel.dispose();
      renderer.dispose();
    };
  }, []);

  // Update Environment Lighting when environment prop changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    scene.background = new THREE.Color(environment.bgColor);
    scene.fog = new THREE.FogExp2(environment.fogColor, environment.fogDensity);

    if (ambientLightRef.current) {
      ambientLightRef.current.intensity = environment.ambientIntensity;
    }
    if (hemiLightRef.current) {
      hemiLightRef.current.color = new THREE.Color(environment.skyLightColor);
      hemiLightRef.current.groundColor = new THREE.Color(environment.groundColor);
    }
    if (keyLightRef.current) {
      keyLightRef.current.color = new THREE.Color(environment.directionalColor);
      keyLightRef.current.intensity = environment.directionalIntensity;
    }
    if (rimLightRef.current) {
      rimLightRef.current.color = new THREE.Color(environment.accentLightColor);
      rimLightRef.current.intensity = environment.accentLightIntensity;
    }
    if (groundMeshRef.current) {
      const mat = groundMeshRef.current.material as THREE.MeshStandardMaterial;
      mat.color = new THREE.Color(environment.groundColor);
      mat.roughness = environment.groundRoughness;
      mat.metalness = environment.groundMetalness;
      mat.envMapIntensity = environment.groundReflectivity;
    }
    if (gridHelperRef.current) {
      gridHelperRef.current.visible = environment.showFloorGrid;
    }
    if (lightRodsGroupRef.current) {
      lightRodsGroupRef.current.visible = environment.hasLightTubes;
    }
  }, [environment]);

  // Update Car Materials (Paint, Wheels, Calipers, Interior, Stripes, Tint, Carbon)
  useEffect(() => {
    if (!modelRefs.current) return;
    const mats = modelRefs.current.materials;

    // Paint
    mats.carPaint.color = new THREE.Color(config.paint.hex);
    mats.carPaint.metalness = config.paint.metalness;
    mats.carPaint.roughness = config.paint.roughness;
    mats.carPaint.clearcoat = config.paint.clearcoat ?? 1.0;

    // Wheels
    mats.wheelMaterial.color = new THREE.Color(config.wheel.hex);

    // Calipers
    mats.caliperMaterial.color = new THREE.Color(config.caliper.hex);

    // Interior Leathers
    mats.interiorLeather.color = new THREE.Color(config.interior.seatColor);
    mats.interiorSecondaryLeather.color = new THREE.Color(config.interior.seatSecondaryColor);
    mats.interiorStitch.color = new THREE.Color(config.interior.stitchColor);

    // Interior Ambient
    mats.interiorAmbient.color = new THREE.Color(config.ambientLightColor);

    // Window Tint
    mats.glass.opacity = 0.45 + (config.windowTintPercent / 100) * 0.45;

    // Stripe
    mats.stripeMaterial.color = new THREE.Color(config.stripe.color);
  }, [config]);

  // Mouse & Touch Orbit Controls handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };
    isUserInteracting.current = true;
    if (userInteractionTimeout.current) {
      window.clearTimeout(userInteractionTimeout.current);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;
    previousMousePosition.current = { x: e.clientX, y: e.clientY };

    // Azimuth (Theta) & Elevation (Phi) rotation
    orbitTheta.current -= deltaX * 0.007;
    orbitPhi.current = Math.max(0.15, Math.min(Math.PI * 0.48, orbitPhi.current - deltaY * 0.007));

    // Calculate new camera position
    const targetX = Math.sin(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;
    const targetY = Math.cos(orbitPhi.current) * orbitRadius.current;
    const targetZ = Math.cos(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;

    cameraTargetPos.current.set(targetX, targetY, targetZ);
    cameraLookTarget.current.set(0, 0.55, 0);

    if (cameraPreset !== 'orbit' && onCameraPresetChange) {
      onCameraPresetChange('orbit');
    }
  };

  const handlePointerUp = () => {
    isDragging.current = false;
    userInteractionTimeout.current = window.setTimeout(() => {
      isUserInteracting.current = false;
    }, 4000);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    isUserInteracting.current = true;
    // Zoom in/out clamp
    orbitRadius.current = Math.max(2.8, Math.min(12.0, orbitRadius.current + e.deltaY * 0.005));

    const targetX = Math.sin(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;
    const targetY = Math.cos(orbitPhi.current) * orbitRadius.current;
    const targetZ = Math.cos(orbitTheta.current) * Math.sin(orbitPhi.current) * orbitRadius.current;

    cameraTargetPos.current.set(targetX, targetY, targetZ);

    if (cameraPreset !== 'orbit' && onCameraPresetChange) {
      onCameraPresetChange('orbit');
    }

    if (userInteractionTimeout.current) {
      window.clearTimeout(userInteractionTimeout.current);
    }
    userInteractionTimeout.current = window.setTimeout(() => {
      isUserInteracting.current = false;
    }, 4000);
  };

  return (
    <div
      ref={containerRef}
      id="mustang-3d-viewport"
      className="relative w-full h-full cursor-grab active:cursor-grabbing select-none overflow-hidden touch-none"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onWheel={handleWheel}
    />
  );
};
