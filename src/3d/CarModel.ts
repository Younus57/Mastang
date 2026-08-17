import * as THREE from 'three';
import { CarConfiguration, VehicleAnimationState, TrimSpec } from '../types';
import { TRIM_SPECS } from '../data/configOptions';

export interface CarModelRefs {
  rootGroup: THREE.Group;
  carBodyGroup: THREE.Group;
  hoodGroup: THREE.Group;
  leftDoorGroup: THREE.Group;
  rightDoorGroup: THREE.Group;
  spoilerGroup: THREE.Group;
  frontLeftSteerGroup: THREE.Group;
  frontRightSteerGroup: THREE.Group;
  wheelMeshes: THREE.Group[];
  caliperMeshes: THREE.Mesh[];
  rotorMeshes: THREE.Mesh[];
  materials: {
    carPaint: THREE.MeshPhysicalMaterial;
    carbonFiber: THREE.MeshStandardMaterial;
    glossBlack: THREE.MeshStandardMaterial;
    chrome: THREE.MeshStandardMaterial;
    glass: THREE.MeshPhysicalMaterial;
    headlights: THREE.MeshStandardMaterial;
    taillights: THREE.MeshStandardMaterial;
    underglow: THREE.MeshBasicMaterial;
    interiorLeather: THREE.MeshStandardMaterial;
    interiorSecondaryLeather: THREE.MeshStandardMaterial;
    interiorStitch: THREE.MeshStandardMaterial;
    interiorDashInlay: THREE.MeshStandardMaterial;
    interiorAmbient: THREE.MeshBasicMaterial;
    caliperMaterial: THREE.MeshStandardMaterial;
    wheelMaterial: THREE.MeshStandardMaterial;
    tireMaterial: THREE.MeshStandardMaterial;
    engineBlock: THREE.MeshStandardMaterial;
    stripeMaterial: THREE.MeshStandardMaterial;
  };
  lights: {
    headlightLeft: THREE.SpotLight;
    headlightRight: THREE.SpotLight;
    underglowLeft: THREE.PointLight;
    underglowRight: THREE.PointLight;
    exhaustBackfireLight: THREE.PointLight;
  };
  exhaustFlames: THREE.Mesh[];
  update: (delta: number, animState: VehicleAnimationState, config: CarConfiguration) => void;
  dispose: () => void;
}

// Procedural textures
function createCarbonFiberTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#18191c';
  ctx.fillRect(0, 0, 64, 64);

  ctx.fillStyle = '#282b30';
  for (let y = 0; y < 64; y += 8) {
    for (let x = 0; x < 64; x += 8) {
      if ((x + y) % 16 === 0) {
        ctx.fillRect(x, y, 8, 4);
        ctx.fillRect(x + 4, y + 4, 4, 4);
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(12, 12);
  return tex;
}

function createTireTreadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = '#1e2023';
  ctx.fillRect(0, 0, 128, 256);

  ctx.fillStyle = '#111214';
  // Longitudinal grooves
  ctx.fillRect(20, 0, 8, 256);
  ctx.fillRect(60, 0, 8, 256);
  ctx.fillRect(100, 0, 8, 256);

  // Diagonal tread sipes
  ctx.strokeStyle = '#141517';
  ctx.lineWidth = 4;
  for (let y = 0; y < 256; y += 16) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(20, y + 10);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(28, y + 6);
    ctx.lineTo(60, y + 16);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(68, y + 16);
    ctx.lineTo(100, y + 6);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(108, y + 10);
    ctx.lineTo(128, y);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 4);
  return tex;
}

export function buildMustangCarModel(
  scene: THREE.Scene,
  initialConfig: CarConfiguration
): CarModelRefs {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'MustangRoot';
  scene.add(rootGroup);

  const carBodyGroup = new THREE.Group();
  carBodyGroup.name = 'CarBodyGroup';
  rootGroup.add(carBodyGroup);

  // Textures
  const carbonTexture = createCarbonFiberTexture();
  const tireTexture = createTireTreadTexture();

  // Materials
  const carPaint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(initialConfig.paint.hex),
    metalness: initialConfig.paint.metalness,
    roughness: initialConfig.paint.roughness,
    clearcoat: initialConfig.paint.clearcoat ?? 1.0,
    clearcoatRoughness: 0.05,
    reflectivity: 0.9,
  });

  const carbonFiber = new THREE.MeshStandardMaterial({
    color: 0x18191c,
    roughness: 0.4,
    metalness: 0.6,
    map: carbonTexture,
  });

  const glossBlack = new THREE.MeshStandardMaterial({
    color: 0x0a0a0c,
    roughness: 0.12,
    metalness: 0.5,
  });

  const chrome = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.08,
    metalness: 0.98,
  });

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x050508,
    transparent: true,
    opacity: 0.45 + (initialConfig.windowTintPercent / 100) * 0.45,
    roughness: 0.05,
    metalness: 0.1,
    transmission: 0.85,
    ior: 1.52,
  });

  const headlights = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0xffffff,
    emissiveIntensity: 3.5,
    roughness: 0.1,
    metalness: 0.9,
  });

  const taillights = new THREE.MeshStandardMaterial({
    color: 0xff0020,
    emissive: 0xff0022,
    emissiveIntensity: 2.8,
    roughness: 0.15,
  });

  const underglow = new THREE.MeshBasicMaterial({
    color: new THREE.Color(0x00e5ff),
    transparent: true,
    opacity: 0.85,
  });

  const interiorLeather = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.interior.seatColor),
    roughness: 0.75,
    metalness: 0.05,
  });

  const interiorSecondaryLeather = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.interior.seatSecondaryColor),
    roughness: 0.7,
    metalness: 0.05,
  });

  const interiorStitch = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.interior.stitchColor),
    roughness: 0.5,
  });

  const interiorDashInlay = new THREE.MeshStandardMaterial({
    color: 0x1a1a1e,
    roughness: 0.3,
    metalness: 0.5,
  });

  const interiorAmbient = new THREE.MeshBasicMaterial({
    color: new THREE.Color(initialConfig.ambientLightColor),
  });

  const caliperMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.caliper.hex),
    roughness: 0.25,
    metalness: 0.7,
  });

  const wheelMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.wheel.hex),
    roughness: 0.2,
    metalness: 0.85,
  });

  const tireMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1b1e,
    roughness: 0.85,
    metalness: 0.1,
    map: tireTexture,
  });

  const engineBlock = new THREE.MeshStandardMaterial({
    color: 0x2e333d,
    roughness: 0.35,
    metalness: 0.8,
  });

  const stripeMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(initialConfig.stripe.color),
    roughness: 0.3,
    metalness: 0.2,
  });

  // -------------------------------------------------------------
  // 1. CHASSIS / LOWER BODY STRUCTURE
  // -------------------------------------------------------------
  // Center main body floor & cabin structure
  const mainBodyGeo = new THREE.BoxGeometry(1.85, 0.45, 3.7, 4, 2, 8);
  // Sculpt body curve
  const pos = mainBodyGeo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const z = pos.getZ(i);
    const y = pos.getY(i);
    const x = pos.getX(i);
    // Taper front and rear slightly
    if (z > 1.0) {
      pos.setX(i, x * (1 - (z - 1.0) * 0.08));
    }
    // Muscular rear haunches
    if (z < -0.4 && z > -1.5) {
      pos.setX(i, x * 1.05);
    }
    // Curve bottom rocker
    if (y < 0) {
      pos.setY(i, y + Math.abs(x) * 0.04);
    }
  }
  mainBodyGeo.computeVertexNormals();
  const mainBodyMesh = new THREE.Mesh(mainBodyGeo, carPaint);
  mainBodyMesh.position.set(0, 0.45, 0);
  mainBodyMesh.castShadow = true;
  mainBodyMesh.receiveShadow = true;
  carBodyGroup.add(mainBodyMesh);

  // Front Fenders & Shark Nose Grille Area
  const frontFenderGeo = new THREE.BoxGeometry(1.82, 0.38, 1.1);
  const frontFenderMesh = new THREE.Mesh(frontFenderGeo, carPaint);
  frontFenderMesh.position.set(0, 0.48, 1.65);
  frontFenderMesh.castShadow = true;
  carBodyGroup.add(frontFenderMesh);

  // Front Upper Grille
  const grilleGeo = new THREE.BoxGeometry(1.2, 0.22, 0.15);
  const grilleMesh = new THREE.Mesh(grilleGeo, glossBlack);
  grilleMesh.position.set(0, 0.46, 2.21);
  carBodyGroup.add(grilleMesh);

  // Grille Honeycomb texture mesh / Mustang Pony Emblem
  const ponyEmblemGeo = new THREE.BoxGeometry(0.18, 0.08, 0.04);
  const ponyEmblemMesh = new THREE.Mesh(ponyEmblemGeo, chrome);
  ponyEmblemMesh.position.set(0, 0.46, 2.29);
  carBodyGroup.add(ponyEmblemMesh);

  // Lower Front Splitter (Carbon fiber / Gloss Black)
  const splitterGeo = new THREE.BoxGeometry(1.88, 0.06, 0.4);
  const splitterMesh = new THREE.Mesh(splitterGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
  splitterMesh.position.set(0, 0.22, 2.12);
  splitterMesh.castShadow = true;
  carBodyGroup.add(splitterMesh);

  // Side Rocker Splitters (Carbon/Aero)
  const leftRockerGeo = new THREE.BoxGeometry(0.08, 0.04, 2.3);
  const leftRocker = new THREE.Mesh(leftRockerGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
  leftRocker.position.set(-0.95, 0.22, 0.05);
  carBodyGroup.add(leftRocker);

  const rightRocker = leftRocker.clone();
  rightRocker.position.set(0.95, 0.22, 0.05);
  carBodyGroup.add(rightRocker);

  // Rear Diffuser with Quad Exhaust Cutouts
  const diffuserGeo = new THREE.BoxGeometry(1.78, 0.26, 0.35);
  const diffuserMesh = new THREE.Mesh(diffuserGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
  diffuserMesh.position.set(0, 0.35, -1.98);
  diffuserMesh.castShadow = true;
  carBodyGroup.add(diffuserMesh);

  // Rear Aerodynamic Diffuser Fins
  for (let f = -0.45; f <= 0.45; f += 0.3) {
    const finGeo = new THREE.BoxGeometry(0.03, 0.16, 0.28);
    const finMesh = new THREE.Mesh(finGeo, glossBlack);
    finMesh.position.set(f, 0.3, -2.02);
    carBodyGroup.add(finMesh);
  }

  // Quad Exhaust Tips (2 left, 2 right)
  const exhaustFlames: THREE.Mesh[] = [];
  const exhaustPositions = [
    [-0.62, 0.32, -2.05],
    [-0.48, 0.32, -2.05],
    [0.48, 0.32, -2.05],
    [0.62, 0.32, -2.05]
  ];

  exhaustPositions.forEach(([ex, ey, ez]) => {
    const tipGeo = new THREE.CylinderGeometry(0.058, 0.058, 0.25, 16);
    tipGeo.rotateX(Math.PI / 2);
    const tipMesh = new THREE.Mesh(tipGeo, chrome);
    tipMesh.position.set(ex, ey, ez);
    carBodyGroup.add(tipMesh);

    // Inner dark exhaust hole
    const innerGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 16);
    innerGeo.rotateX(Math.PI / 2);
    const innerMesh = new THREE.Mesh(innerGeo, glossBlack);
    innerMesh.position.set(ex, ey, ez - 0.12);
    carBodyGroup.add(innerMesh);

    // Exhaust Flame / Spark Cone (hidden by default)
    const flameGeo = new THREE.ConeGeometry(0.065, 0.45, 12);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMat = new THREE.MeshBasicMaterial({
      color: 0x00bfff,
      transparent: true,
      opacity: 0.9,
    });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(ex, ey, ez - 0.32);
    flameMesh.visible = false;
    carBodyGroup.add(flameMesh);
    exhaustFlames.push(flameMesh);
  });

  // Fastback Greenhouse / Roof & Pillars
  const roofGeo = new THREE.BoxGeometry(1.4, 0.38, 1.85, 2, 2, 4);
  const rPos = roofGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const rz = rPos.getZ(i);
    const ry = rPos.getY(i);
    const rx = rPos.getX(i);
    // Fastback sloped rear window curve
    if (rz < -0.2 && ry > 0) {
      rPos.setY(i, ry - Math.pow(Math.abs(rz + 0.2), 1.5) * 0.45);
    }
    // Windshield slope front
    if (rz > 0.4 && ry > 0) {
      rPos.setY(i, ry - (rz - 0.4) * 0.32);
    }
    // Taper roof width at top
    if (ry > 0) {
      rPos.setX(i, rx * 0.88);
    }
  }
  roofGeo.computeVertexNormals();
  const roofMesh = new THREE.Mesh(roofGeo, initialConfig.carbonPackage ? carbonFiber : carPaint);
  roofMesh.position.set(0, 0.82, -0.05);
  roofMesh.castShadow = true;
  carBodyGroup.add(roofMesh);

  // Windows Glass (Windshield, Rear glass, Side windows)
  const windshieldGeo = new THREE.PlaneGeometry(1.3, 0.75);
  windshieldGeo.rotateX(-Math.PI / 4.2);
  const windshield = new THREE.Mesh(windshieldGeo, glass);
  windshield.position.set(0, 0.84, 0.65);
  carBodyGroup.add(windshield);

  const rearGlassGeo = new THREE.PlaneGeometry(1.22, 1.05);
  rearGlassGeo.rotateX(Math.PI / 3.4);
  const rearGlass = new THREE.Mesh(rearGlassGeo, glass);
  rearGlass.position.set(0, 0.84, -0.85);
  carBodyGroup.add(rearGlass);

  const sideGlassLeftGeo = new THREE.PlaneGeometry(1.65, 0.38);
  sideGlassLeftGeo.rotateY(Math.PI / 2);
  const sideGlassLeft = new THREE.Mesh(sideGlassLeftGeo, glass);
  sideGlassLeft.position.set(-0.73, 0.82, -0.05);
  carBodyGroup.add(sideGlassLeft);

  const sideGlassRightGeo = new THREE.PlaneGeometry(1.65, 0.38);
  sideGlassRightGeo.rotateY(-Math.PI / 2);
  const sideGlassRight = new THREE.Mesh(sideGlassRightGeo, glass);
  sideGlassRight.position.set(0.73, 0.82, -0.05);
  carBodyGroup.add(sideGlassRight);

  // Side Mirrors (Left & Right)
  const mirrorLeftGeo = new THREE.BoxGeometry(0.24, 0.12, 0.16);
  const mirrorLeft = new THREE.Mesh(mirrorLeftGeo, initialConfig.carbonPackage ? carbonFiber : carPaint);
  mirrorLeft.position.set(-0.96, 0.75, 0.45);
  carBodyGroup.add(mirrorLeft);

  const mirrorRight = mirrorLeft.clone();
  mirrorRight.position.set(0.96, 0.75, 0.45);
  carBodyGroup.add(mirrorRight);

  // Headlights (Signature Mustang Tri-Bar DRLs)
  const hlBoxGeo = new THREE.BoxGeometry(0.38, 0.14, 0.15);
  const leftHeadlight = new THREE.Mesh(hlBoxGeo, headlights);
  leftHeadlight.position.set(-0.68, 0.58, 2.05);
  leftHeadlight.rotation.y = -0.15;
  carBodyGroup.add(leftHeadlight);

  const rightHeadlight = new THREE.Mesh(hlBoxGeo, headlights);
  rightHeadlight.position.set(0.68, 0.58, 2.05);
  rightHeadlight.rotation.y = 0.15;
  carBodyGroup.add(rightHeadlight);

  // Individual Tri-Bar LED slats
  for (let s = -1; s <= 1; s++) {
    const barGeo = new THREE.BoxGeometry(0.02, 0.09, 0.02);
    const leftBar = new THREE.Mesh(barGeo, chrome);
    leftBar.position.set(-0.68 + s * 0.06, 0.58, 2.12);
    carBodyGroup.add(leftBar);

    const rightBar = leftBar.clone();
    rightBar.position.set(0.68 + s * 0.06, 0.58, 2.12);
    carBodyGroup.add(rightBar);
  }

  // Taillights (Signature Mustang 3-Vertical Bar Clusters)
  for (let side = -1; side <= 1; side += 2) {
    for (let bar = 0; bar < 3; bar++) {
      const tailBarGeo = new THREE.BoxGeometry(0.045, 0.18, 0.04);
      const tailBarMesh = new THREE.Mesh(tailBarGeo, taillights);
      tailBarMesh.position.set(side * (0.52 + bar * 0.09), 0.62, -2.01);
      carBodyGroup.add(tailBarMesh);
    }
  }

  // Rear Gloss Black Decklid Panel between taillights
  const decklidGeo = new THREE.BoxGeometry(1.68, 0.24, 0.05);
  const decklidMesh = new THREE.Mesh(decklidGeo, glossBlack);
  decklidMesh.position.set(0, 0.62, -1.99);
  carBodyGroup.add(decklidMesh);

  // Rear Badge (GT 5.0 / Dark Horse / Shelby Cobra)
  const rearBadgeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.02, 16);
  rearBadgeGeo.rotateX(Math.PI / 2);
  const rearBadge = new THREE.Mesh(rearBadgeGeo, chrome);
  rearBadge.position.set(0, 0.62, -2.02);
  carBodyGroup.add(rearBadge);

  // -------------------------------------------------------------
  // 2. HOOD & V8 ENGINE BAY (Articulated / Opening)
  // -------------------------------------------------------------
  const hoodGroup = new THREE.Group();
  hoodGroup.name = 'HoodGroup';
  // Pivot placed near windshield cowl
  hoodGroup.position.set(0, 0.68, 0.85);
  carBodyGroup.add(hoodGroup);

  // Hood Mesh with Power Bulge
  const hoodGeo = new THREE.BoxGeometry(1.62, 0.08, 1.35, 4, 1, 6);
  const hPos = hoodGeo.attributes.position;
  for (let i = 0; i < hPos.count; i++) {
    const hx = hPos.getX(i);
    const hz = hPos.getZ(i);
    const hy = hPos.getY(i);
    // Center power bulge / cowl induction
    if (Math.abs(hx) < 0.45 && hz > -0.4 && hz < 0.5) {
      hPos.setY(i, hy + (0.45 - Math.abs(hx)) * 0.12);
    }
    // Front slope
    if (hz > 0.2) {
      hPos.setY(i, hy - (hz - 0.2) * 0.15);
    }
  }
  hoodGeo.computeVertexNormals();
  const hoodMesh = new THREE.Mesh(hoodGeo, carPaint);
  hoodMesh.position.set(0, 0, 0.62);
  hoodMesh.castShadow = true;
  hoodGroup.add(hoodMesh);

  // Hood Heat Extractor Vents (Gloss Black / Carbon)
  const ventLeftGeo = new THREE.BoxGeometry(0.24, 0.03, 0.45);
  const ventLeft = new THREE.Mesh(ventLeftGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
  ventLeft.position.set(-0.42, 0.04, 0.58);
  hoodGroup.add(ventLeft);

  const ventRight = ventLeft.clone();
  ventRight.position.set(0.42, 0.04, 0.58);
  hoodGroup.add(ventRight);

  // Engine Bay Compartment (under hood)
  const engineBayGroup = new THREE.Group();
  engineBayGroup.position.set(0, 0.42, 1.4);
  carBodyGroup.add(engineBayGroup);

  // Engine Block V8
  const engineBlockGeo = new THREE.BoxGeometry(0.72, 0.32, 0.65);
  const engineBlockMesh = new THREE.Mesh(engineBlockGeo, engineBlock);
  engineBayGroup.add(engineBlockMesh);

  // V8 Cylinder Heads (Ford Blue / Gunmetal)
  const headGeo = new THREE.BoxGeometry(0.22, 0.18, 0.62);
  const headMat = new THREE.MeshStandardMaterial({ color: 0x004da8, roughness: 0.3, metalness: 0.8 });
  const leftHead = new THREE.Mesh(headGeo, headMat);
  leftHead.position.set(-0.28, 0.15, 0);
  leftHead.rotation.z = -0.3;
  engineBayGroup.add(leftHead);

  const rightHead = new THREE.Mesh(headGeo, headMat);
  rightHead.position.set(0.28, 0.15, 0);
  rightHead.rotation.z = 0.3;
  engineBayGroup.add(rightHead);

  // Intake Manifold / Supercharger Blower
  const intakeGeo = new THREE.BoxGeometry(0.38, 0.16, 0.52);
  const intakeMesh = new THREE.Mesh(intakeGeo, chrome);
  intakeMesh.position.set(0, 0.22, 0);
  engineBayGroup.add(intakeMesh);

  // Dual Throttle Bodies & Cold Air Intake Cones
  for (let tb = -1; tb <= 1; tb += 2) {
    const tubeGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 16);
    tubeGeo.rotateZ(tb * Math.PI / 4);
    const tubeMesh = new THREE.Mesh(tubeGeo, glossBlack);
    tubeMesh.position.set(tb * 0.32, 0.18, 0.28);
    engineBayGroup.add(tubeMesh);

    // Conical Performance Air Filter (Blue/Red cotton)
    const filterGeo = new THREE.ConeGeometry(0.09, 0.22, 16);
    filterGeo.rotateX(-Math.PI / 2);
    const filterMat = new THREE.MeshStandardMaterial({ color: 0x0070f3, roughness: 0.8 });
    const filterMesh = new THREE.Mesh(filterGeo, filterMat);
    filterMesh.position.set(tb * 0.45, 0.18, 0.42);
    engineBayGroup.add(filterMesh);
  }

  // Strut Tower Cross Brace (Silver tubular brace with Mustang / Ford Performance badge)
  const braceGeo = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 12);
  braceGeo.rotateZ(Math.PI / 2);
  const braceMesh = new THREE.Mesh(braceGeo, chrome);
  braceMesh.position.set(0, 0.29, 0.08);
  engineBayGroup.add(braceMesh);

  // -------------------------------------------------------------
  // 3. DOORS (Articulated Driver & Passenger)
  // -------------------------------------------------------------
  const leftDoorGroup = new THREE.Group();
  leftDoorGroup.name = 'LeftDoorGroup';
  leftDoorGroup.position.set(-0.93, 0.55, 0.65); // A-pillar hinge
  carBodyGroup.add(leftDoorGroup);

  const doorPanelGeo = new THREE.BoxGeometry(0.08, 0.42, 1.25);
  const leftDoorPanel = new THREE.Mesh(doorPanelGeo, carPaint);
  leftDoorPanel.position.set(0, 0, -0.62);
  leftDoorPanel.castShadow = true;
  leftDoorGroup.add(leftDoorPanel);

  // Door Handle
  const handleGeo = new THREE.BoxGeometry(0.04, 0.03, 0.14);
  const leftHandle = new THREE.Mesh(handleGeo, glossBlack);
  leftHandle.position.set(-0.05, 0.08, -0.92);
  leftDoorGroup.add(leftHandle);

  // Door Interior Trim
  const innerDoorGeo = new THREE.BoxGeometry(0.04, 0.36, 1.15);
  const leftInnerDoor = new THREE.Mesh(innerDoorGeo, interiorLeather);
  leftInnerDoor.position.set(0.04, 0, -0.62);
  leftDoorGroup.add(leftInnerDoor);

  // Right Door
  const rightDoorGroup = new THREE.Group();
  rightDoorGroup.name = 'RightDoorGroup';
  rightDoorGroup.position.set(0.93, 0.55, 0.65);
  carBodyGroup.add(rightDoorGroup);

  const rightDoorPanel = new THREE.Mesh(doorPanelGeo, carPaint);
  rightDoorPanel.position.set(0, 0, -0.62);
  rightDoorPanel.castShadow = true;
  rightDoorGroup.add(rightDoorPanel);

  const rightHandle = leftHandle.clone();
  rightHandle.position.set(0.05, 0.08, -0.92);
  rightDoorGroup.add(rightHandle);

  const rightInnerDoor = new THREE.Mesh(innerDoorGeo, interiorLeather);
  rightInnerDoor.position.set(-0.04, 0, -0.62);
  rightDoorGroup.add(rightInnerDoor);

  // -------------------------------------------------------------
  // 4. INTERIOR COCKPIT (Seats, Steering Wheel, Displays, Ambient)
  // -------------------------------------------------------------
  const cockpitGroup = new THREE.Group();
  cockpitGroup.position.set(0, 0.45, 0);
  carBodyGroup.add(cockpitGroup);

  // Floor Carpet
  const carpetGeo = new THREE.BoxGeometry(1.4, 0.08, 1.8);
  const carpetMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.95 });
  const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
  carpetMesh.position.set(0, 0, -0.05);
  cockpitGroup.add(carpetMesh);

  // Recaro Sport Bucket Seats (Driver & Passenger)
  function createRecaroSeat(): THREE.Group {
    const seatGroup = new THREE.Group();
    // Seat base
    const baseGeo = new THREE.BoxGeometry(0.48, 0.16, 0.52);
    const baseMesh = new THREE.Mesh(baseGeo, interiorLeather);
    baseMesh.position.set(0, 0.1, 0);
    seatGroup.add(baseMesh);

    // Center seat insert cushion (Secondary color)
    const insertGeo = new THREE.BoxGeometry(0.32, 0.08, 0.44);
    const insertMesh = new THREE.Mesh(insertGeo, interiorSecondaryLeather);
    insertMesh.position.set(0, 0.15, 0);
    seatGroup.add(insertMesh);

    // Seat backrest
    const backGeo = new THREE.BoxGeometry(0.46, 0.65, 0.14);
    const backMesh = new THREE.Mesh(backGeo, interiorLeather);
    backMesh.position.set(0, 0.42, -0.22);
    backMesh.rotation.x = -0.15;
    seatGroup.add(backMesh);

    // Backrest center bolster
    const backInsertGeo = new THREE.BoxGeometry(0.28, 0.45, 0.08);
    const backInsertMesh = new THREE.Mesh(backInsertGeo, interiorSecondaryLeather);
    backInsertMesh.position.set(0, 0.42, -0.16);
    backInsertMesh.rotation.x = -0.15;
    seatGroup.add(backInsertMesh);

    // Headrest
    const headrestGeo = new THREE.BoxGeometry(0.24, 0.16, 0.1);
    const headrestMesh = new THREE.Mesh(headrestGeo, interiorLeather);
    headrestMesh.position.set(0, 0.8, -0.28);
    seatGroup.add(headrestMesh);

    return seatGroup;
  }

  const driverSeat = createRecaroSeat();
  driverSeat.position.set(-0.38, 0, -0.15);
  cockpitGroup.add(driverSeat);

  const passengerSeat = createRecaroSeat();
  passengerSeat.position.set(0.38, 0, -0.15);
  cockpitGroup.add(passengerSeat);

  // Rear Bench Seats
  const rearBenchGeo = new THREE.BoxGeometry(1.2, 0.35, 0.45);
  const rearBench = new THREE.Mesh(rearBenchGeo, interiorLeather);
  rearBench.position.set(0, 0.22, -0.85);
  cockpitGroup.add(rearBench);

  // Dashboard & Center Console
  const dashGeo = new THREE.BoxGeometry(1.42, 0.28, 0.55);
  const dashMesh = new THREE.Mesh(dashGeo, interiorLeather);
  dashMesh.position.set(0, 0.52, 0.48);
  cockpitGroup.add(dashMesh);

  // Dashboard Decorative Inlay (Carbon / Aluminum)
  const dashInlayGeo = new THREE.BoxGeometry(1.35, 0.08, 0.02);
  const dashInlayMesh = new THREE.Mesh(dashInlayGeo, interiorDashInlay);
  dashInlayMesh.position.set(0, 0.48, 0.74);
  cockpitGroup.add(dashInlayMesh);

  // Dual Curved Digital Display (Digital Instrument Cluster + Central Screen)
  const clusterScreenGeo = new THREE.PlaneGeometry(0.85, 0.22);
  const clusterCanvas = document.createElement('canvas');
  clusterCanvas.width = 512;
  clusterCanvas.height = 128;
  const cctx = clusterCanvas.getContext('2d')!;
  cctx.fillStyle = '#0a0d14';
  cctx.fillRect(0, 0, 512, 128);
  // Tachometer ring
  cctx.strokeStyle = '#00e5ff';
  cctx.lineWidth = 6;
  cctx.beginPath();
  cctx.arc(140, 64, 45, Math.PI * 0.75, Math.PI * 2.25);
  cctx.stroke();
  cctx.fillStyle = '#ffffff';
  cctx.font = 'bold 22px sans-serif';
  cctx.fillText('0 MPH', 105, 72);
  // Center track mode logo & boost
  cctx.fillStyle = '#ff0055';
  cctx.fillText('TRACK MODE', 280, 50);
  cctx.fillStyle = '#00e5ff';
  cctx.font = '16px sans-serif';
  cctx.fillText('BOOST: 12.5 PSI  •  OIL: 215°F', 260, 85);

  const clusterTex = new THREE.CanvasTexture(clusterCanvas);
  const clusterMat = new THREE.MeshBasicMaterial({ map: clusterTex });
  const clusterMesh = new THREE.Mesh(clusterScreenGeo, clusterMat);
  clusterMesh.position.set(-0.15, 0.62, 0.68);
  clusterMesh.rotation.x = -0.2;
  cockpitGroup.add(clusterMesh);

  // Flat-Bottom Mustang Racing Steering Wheel
  const steeringWheelGroup = new THREE.Group();
  steeringWheelGroup.position.set(-0.38, 0.58, 0.35);
  steeringWheelGroup.rotation.x = -0.45;
  cockpitGroup.add(steeringWheelGroup);

  const rimGeo = new THREE.TorusGeometry(0.16, 0.022, 12, 32);
  const rimMesh = new THREE.Mesh(rimGeo, interiorLeather);
  steeringWheelGroup.add(rimMesh);

  // 12 o'clock center stripe on steering wheel
  const topStripeGeo = new THREE.CylinderGeometry(0.024, 0.024, 0.04, 12);
  const topStripeMesh = new THREE.Mesh(topStripeGeo, interiorStitch);
  topStripeMesh.position.set(0, 0.16, 0);
  topStripeMesh.rotation.z = Math.PI / 2;
  steeringWheelGroup.add(topStripeMesh);

  // Wheel center hub & pony badge
  const hubGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.04, 16);
  hubGeo.rotateX(Math.PI / 2);
  const hubMesh = new THREE.Mesh(hubGeo, glossBlack);
  steeringWheelGroup.add(hubMesh);

  // Center Console & Shifter
  const consoleGeo = new THREE.BoxGeometry(0.32, 0.22, 0.85);
  const consoleMesh = new THREE.Mesh(consoleGeo, interiorLeather);
  consoleMesh.position.set(0, 0.28, 0.05);
  cockpitGroup.add(consoleMesh);

  // Short Throw Shifter with Titanium / Anodized Blue ball
  const shifterStemGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.14, 12);
  const shifterStem = new THREE.Mesh(shifterStemGeo, chrome);
  shifterStem.position.set(0, 0.44, 0.18);
  cockpitGroup.add(shifterStem);

  const knobGeo = new THREE.SphereGeometry(0.032, 16, 16);
  const knobMesh = new THREE.Mesh(knobGeo, chrome);
  knobMesh.position.set(0, 0.51, 0.18);
  cockpitGroup.add(knobMesh);

  // Interior Ambient Lighting Strips (Glowing edge lines)
  const ambientStripGeo = new THREE.BoxGeometry(1.36, 0.012, 0.012);
  const ambientStrip = new THREE.Mesh(ambientStripGeo, interiorAmbient);
  ambientStrip.position.set(0, 0.44, 0.74);
  cockpitGroup.add(ambientStrip);

  // -------------------------------------------------------------
  // 5. ACTIVE AERO REAR SPOILER (Wing / Spoiler)
  // -------------------------------------------------------------
  const spoilerGroup = new THREE.Group();
  spoilerGroup.name = 'SpoilerGroup';
  spoilerGroup.position.set(0, 0.82, -1.82);
  carBodyGroup.add(spoilerGroup);

  // Dual mounting stanchions / uprights
  for (let st = -0.45; st <= 0.45; st += 0.9) {
    const stanGeo = new THREE.BoxGeometry(0.03, 0.22, 0.14);
    const stanMesh = new THREE.Mesh(stanGeo, glossBlack);
    stanMesh.position.set(st, 0.1, 0);
    spoilerGroup.add(stanMesh);
  }

  // Carbon Fiber High-Downforce Main Wing Blade
  const wingGeo = new THREE.BoxGeometry(1.72, 0.045, 0.28);
  const wingMesh = new THREE.Mesh(wingGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
  wingMesh.position.set(0, 0.21, 0);
  wingMesh.castShadow = true;
  spoilerGroup.add(wingMesh);

  // Wing Endplates (Left & Right)
  for (let side = -1; side <= 1; side += 2) {
    const endGeo = new THREE.BoxGeometry(0.02, 0.18, 0.32);
    const endMesh = new THREE.Mesh(endGeo, initialConfig.carbonPackage ? carbonFiber : glossBlack);
    endMesh.position.set(side * 0.86, 0.21, 0);
    spoilerGroup.add(endMesh);
  }

  // -------------------------------------------------------------
  // 6. WHEELS, BRAKES & STEERING RIGGING
  // -------------------------------------------------------------
  const wheelMeshes: THREE.Group[] = [];
  const caliperMeshes: THREE.Mesh[] = [];
  const rotorMeshes: THREE.Mesh[] = [];

  function createWheelAssembly(isFront: boolean, isLeft: boolean): {
    wheelGroup: THREE.Group;
    caliper: THREE.Mesh;
    rotor: THREE.Mesh;
  } {
    const wheelAssembly = new THREE.Group();

    // Tire (Pirelli P-Zero / Michelin Track rubber)
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 32);
    tireGeo.rotateZ(Math.PI / 2);
    const tireMesh = new THREE.Mesh(tireGeo, tireMaterial);
    tireMesh.castShadow = true;
    wheelAssembly.add(tireMesh);

    // Rim Alloy Mesh (Star / Mesh 5-Spoke)
    const rimGroup = new THREE.Group();
    wheelAssembly.add(rimGroup);

    // Outer Rim barrel
    const rimBarrelGeo = new THREE.CylinderGeometry(0.31, 0.31, 0.26, 32, 1, true);
    rimBarrelGeo.rotateZ(Math.PI / 2);
    const rimBarrel = new THREE.Mesh(rimBarrelGeo, wheelMaterial);
    rimGroup.add(rimBarrel);

    // Spokes
    const numSpokes = initialConfig.wheel.style === 'shelby-mesh' ? 10 : 5;
    for (let s = 0; s < numSpokes; s++) {
      const angle = (s / numSpokes) * Math.PI * 2;
      const spokeGeo = new THREE.BoxGeometry(0.045, 0.28, 0.05);
      const spoke = new THREE.Mesh(spokeGeo, wheelMaterial);
      spoke.position.set(isLeft ? -0.09 : 0.09, Math.sin(angle) * 0.14, Math.cos(angle) * 0.14);
      spoke.rotation.x = angle;
      rimGroup.add(spoke);
    }

    // Center Wheel Cap & Lug Nuts
    const centerCapGeo = new THREE.CylinderGeometry(0.065, 0.065, 0.04, 16);
    centerCapGeo.rotateZ(Math.PI / 2);
    const centerCap = new THREE.Mesh(centerCapGeo, glossBlack);
    centerCap.position.set(isLeft ? -0.12 : 0.12, 0, 0);
    rimGroup.add(centerCap);

    // Brake Disc Rotor (Cross-Drilled Carbon Ceramic)
    const rotorGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.02, 32);
    rotorGeo.rotateZ(Math.PI / 2);
    const rotorMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.2,
      metalness: 0.95,
    });
    const rotor = new THREE.Mesh(rotorGeo, rotorMat);
    rotor.position.set(0, 0, 0);
    wheelAssembly.add(rotor);

    // Brembo 6-Piston Brake Caliper (Stays static / doesn't spin with wheel)
    const caliperGeo = new THREE.BoxGeometry(0.08, 0.18, 0.12);
    const caliper = new THREE.Mesh(caliperGeo, caliperMaterial);
    // Caliper mounted on top front quadrant of brake disc
    caliper.position.set(isLeft ? -0.04 : 0.04, 0.14, 0.1);
    caliper.rotation.x = 0.5;

    return { wheelGroup: wheelAssembly, caliper, rotor };
  }

  // Wheel Positions: Wheelbase ~ 2.7m, Track Width ~ 1.65m
  const wheelOffsetZ = 1.35;
  const rearOffsetZ = -1.25;
  const trackX = 0.92;
  const wheelY = 0.38;

  // Front Left Wheel (with steering pivot group)
  const frontLeftSteerGroup = new THREE.Group();
  frontLeftSteerGroup.position.set(-trackX, wheelY, wheelOffsetZ);
  carBodyGroup.add(frontLeftSteerGroup);
  const fl = createWheelAssembly(true, true);
  frontLeftSteerGroup.add(fl.wheelGroup);
  frontLeftSteerGroup.add(fl.caliper);
  wheelMeshes.push(fl.wheelGroup);
  caliperMeshes.push(fl.caliper);
  rotorMeshes.push(fl.rotor);

  // Front Right Wheel (with steering pivot group)
  const frontRightSteerGroup = new THREE.Group();
  frontRightSteerGroup.position.set(trackX, wheelY, wheelOffsetZ);
  carBodyGroup.add(frontRightSteerGroup);
  const fr = createWheelAssembly(true, false);
  frontRightSteerGroup.add(fr.wheelGroup);
  frontRightSteerGroup.add(fr.caliper);
  wheelMeshes.push(fr.wheelGroup);
  caliperMeshes.push(fr.caliper);
  rotorMeshes.push(fr.rotor);

  // Rear Left Wheel
  const rearLeftGroup = new THREE.Group();
  rearLeftGroup.position.set(-trackX, wheelY, rearOffsetZ);
  carBodyGroup.add(rearLeftGroup);
  const rl = createWheelAssembly(false, true);
  rearLeftGroup.add(rl.wheelGroup);
  rearLeftGroup.add(rl.caliper);
  wheelMeshes.push(rl.wheelGroup);
  caliperMeshes.push(rl.caliper);
  rotorMeshes.push(rl.rotor);

  // Rear Right Wheel
  const rearRightGroup = new THREE.Group();
  rearRightGroup.position.set(trackX, wheelY, rearOffsetZ);
  carBodyGroup.add(rearRightGroup);
  const rr = createWheelAssembly(false, false);
  rearRightGroup.add(rr.wheelGroup);
  rearRightGroup.add(rr.caliper);
  wheelMeshes.push(rr.wheelGroup);
  caliperMeshes.push(rr.caliper);
  rotorMeshes.push(rr.rotor);

  // -------------------------------------------------------------
  // 7. REAL-TIME VEHICLE LIGHTS (Headlight Beams, Underglow, Backfire)
  // -------------------------------------------------------------
  // Headlight Spotlights
  const headlightLeft = new THREE.SpotLight(0xffffff, 4.0, 25, Math.PI / 6, 0.4, 1.2);
  headlightLeft.position.set(-0.68, 0.58, 2.1);
  const targetL = new THREE.Object3D();
  targetL.position.set(-0.68, 0, 15);
  scene.add(targetL);
  headlightLeft.target = targetL;
  carBodyGroup.add(headlightLeft);

  const headlightRight = new THREE.SpotLight(0xffffff, 4.0, 25, Math.PI / 6, 0.4, 1.2);
  headlightRight.position.set(0.68, 0.58, 2.1);
  const targetR = new THREE.Object3D();
  targetR.position.set(0.68, 0, 15);
  scene.add(targetR);
  headlightRight.target = targetR;
  carBodyGroup.add(headlightRight);

  // Underglow Neon Ground Lights
  const underglowLeft = new THREE.PointLight(0x00e5ff, 2.5, 3.5, 1.2);
  underglowLeft.position.set(-0.75, 0.12, 0);
  carBodyGroup.add(underglowLeft);

  const underglowRight = new THREE.PointLight(0x00e5ff, 2.5, 3.5, 1.2);
  underglowRight.position.set(0.75, 0.12, 0);
  carBodyGroup.add(underglowRight);

  // Underglow LED tubes visible under chassis
  const underTubeGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.4, 8);
  underTubeGeo.rotateX(Math.PI / 2);
  const underTubeL = new THREE.Mesh(underTubeGeo, underglow);
  underTubeL.position.set(-0.75, 0.14, 0);
  carBodyGroup.add(underTubeL);

  const underTubeR = underTubeL.clone();
  underTubeR.position.set(0.75, 0.14, 0);
  carBodyGroup.add(underTubeR);

  // Exhaust Backfire Flash Light
  const exhaustBackfireLight = new THREE.PointLight(0x00bfff, 0, 4.0, 1.5);
  exhaustBackfireLight.position.set(0, 0.35, -2.4);
  carBodyGroup.add(exhaustBackfireLight);

  // -------------------------------------------------------------
  // 8. UPDATE / ANIMATION LOOP
  // -------------------------------------------------------------
  let currentDoorAngle = 0;
  let currentHoodAngle = 0;
  let currentSpoilerDeploy = 0;
  let currentWheelSpin = 0;
  let hazardTimer = 0;

  const update = (delta: number, animState: VehicleAnimationState, config: CarConfiguration) => {
    // 1. Suspension height adjustment (Slammed / Track / Stock / Lift)
    const targetSuspensionY = animState.suspensionHeight * 0.07;
    carBodyGroup.position.y += (targetSuspensionY - carBodyGroup.position.y) * 0.1;

    // 2. Door Animation (Smooth Open/Close)
    const targetDoorAngle = animState.doorsOpen ? 1.05 : 0; // ~60 degrees
    currentDoorAngle += (targetDoorAngle - currentDoorAngle) * Math.min(1, delta * 6);
    leftDoorGroup.rotation.y = -currentDoorAngle;
    rightDoorGroup.rotation.y = currentDoorAngle;

    // 3. Hood Animation (Smooth Open/Close)
    const targetHoodAngle = animState.hoodOpen ? 0.95 : 0; // ~55 degrees
    currentHoodAngle += (targetHoodAngle - currentHoodAngle) * Math.min(1, delta * 5);
    hoodGroup.rotation.x = -currentHoodAngle;

    // 4. Active Rear Spoiler (Deployment & Angle of Attack)
    const trimInfo = TRIM_SPECS[config.trim];
    const isSpoilerActive = animState.spoilerDeployed || config.driveMode === 'track';
    const targetSpoilerVal = isSpoilerActive ? 1.0 : 0.0;
    currentSpoilerDeploy += (targetSpoilerVal - currentSpoilerDeploy) * Math.min(1, delta * 4);
    spoilerGroup.position.y = 0.82 + currentSpoilerDeploy * 0.14;
    spoilerGroup.rotation.x = currentSpoilerDeploy * 0.18; // angle of downforce attack

    // 5. Steering Angle
    frontLeftSteerGroup.rotation.y = animState.wheelAngle;
    frontRightSteerGroup.rotation.y = animState.wheelAngle;

    // 6. Wheel Spin Animation
    if (animState.wheelSpinning) {
      currentWheelSpin += animState.wheelSpinSpeed * delta * 25;
      wheelMeshes.forEach((wm) => {
        wm.rotation.x = currentWheelSpin;
      });
    }

    // 7. Lights State
    const hlIntensity = animState.headlightsOn ? (animState.highBeamsOn ? 8.0 : 4.5) : 0;
    headlightLeft.intensity = hlIntensity;
    headlightRight.intensity = hlIntensity;
    headlights.emissiveIntensity = animState.headlightsOn ? 3.5 : 0.1;

    // Hazard / Sequential Turn Signals
    if (animState.hazardLightsOn) {
      hazardTimer += delta * 4;
      const isBlinking = Math.sin(hazardTimer * Math.PI * 2) > 0;
      taillights.emissiveIntensity = isBlinking ? 4.5 : 0.5;
    } else {
      taillights.emissiveIntensity = 2.4;
    }

    // Underglow Neon
    if (animState.underglowOn) {
      const uColor = new THREE.Color(animState.underglowColor);
      underglowLeft.intensity = 2.5;
      underglowRight.intensity = 2.5;
      underglowLeft.color = uColor;
      underglowRight.color = uColor;
      underglow.color = uColor;
      underglow.opacity = 0.9;
    } else {
      underglowLeft.intensity = 0;
      underglowRight.intensity = 0;
      underglow.opacity = 0.05;
    }

    // 8. Exhaust Flames & Backfire Visuals
    if (animState.exhaustFlames) {
      exhaustFlames.forEach((flame) => {
        flame.visible = true;
        flame.scale.set(
          0.8 + Math.random() * 0.6,
          0.8 + Math.random() * 0.7,
          0.8 + Math.random() * 0.6
        );
      });
      exhaustBackfireLight.intensity = 6.0;
      exhaustBackfireLight.color = new THREE.Color(Math.random() > 0.5 ? 0x00d2ff : 0xff5500);
    } else {
      exhaustFlames.forEach((flame) => {
        flame.visible = false;
      });
      exhaustBackfireLight.intensity = 0;
    }
  };

  const dispose = () => {
    scene.remove(rootGroup);
    // dispose geometries & materials
    mainBodyGeo.dispose();
    carbonTexture.dispose();
    tireTexture.dispose();
  };

  return {
    rootGroup,
    carBodyGroup,
    hoodGroup,
    leftDoorGroup,
    rightDoorGroup,
    spoilerGroup,
    frontLeftSteerGroup,
    frontRightSteerGroup,
    wheelMeshes,
    caliperMeshes,
    rotorMeshes,
    materials: {
      carPaint,
      carbonFiber,
      glossBlack,
      chrome,
      glass,
      headlights,
      taillights,
      underglow,
      interiorLeather,
      interiorSecondaryLeather,
      interiorStitch,
      interiorDashInlay,
      interiorAmbient,
      caliperMaterial,
      wheelMaterial,
      tireMaterial,
      engineBlock,
      stripeMaterial,
    },
    lights: {
      headlightLeft,
      headlightRight,
      underglowLeft,
      underglowRight,
      exhaustBackfireLight,
    },
    exhaustFlames,
    update,
    dispose,
  };
}
