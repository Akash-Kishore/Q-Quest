'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Math helpers (deterministic — pure functions of scroll progress)
// ---------------------------------------------------------------------------
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function clamp01(t: number): number { return clamp(t, 0, 1); }
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }
function smoothstep(a: number, b: number, x: number): number {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
}
function easeOutCubic(t: number): number { return 1 - Math.pow(1 - t, 3); }

// Deterministic hash
function hash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return s - Math.floor(s);
}

// Fibonacci sphere point (unit)
function fibSpherePoint(i: number, total: number): [number, number, number] {
  const phi = Math.acos(1 - 2 * (i + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}

// ---------------------------------------------------------------------------
// SCREEN FRACTURE SHADERS
// The source geometry is a viewport-filling dark tile lattice. The screen
// separates into large blocks, those blocks resolve into fine pixels, and the
// exact same particles gather into the smaller sphere shells.
// ---------------------------------------------------------------------------
const PIXEL_VERT = /* glsl */ `
  precision highp float;

  attribute vec2 aScreenUv;       // -1..1 viewport lattice coordinate
  attribute vec3 aDrift;          // block/pixel fracture momentum
  attribute float aSeed;
  attribute float aFractureOrder; // 0..1 — diagonal screen-breaking wave
  attribute float aScaleVar;      // controlled size variation
  attribute vec3 aTargetLocal;    // point on one of the reconstructed sphere shells
  attribute vec2 aTargetCenter;   // target centre in normalized viewport space
  attribute float aTargetRadius;
  attribute float aCluster;

  uniform float uProgress;        // global scroll progress 0..1
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;            // damped, normalized -1..1
  uniform float uPixelSize;
  uniform float uBlockSize;

  varying float vOpacity;
  varying float vDepth;
  varying vec3 vColor;
  varying float vPixelPhase;

  float h(float n) { return fract(sin(n * 12.9898 + 78.233) * 43758.5453); }

  vec3 noiseDisplace(float seed, float t) {
    float x = sin(seed * 3.7 + t * 2.1) * cos(seed * 1.3 + t * 1.7);
    float y = cos(seed * 5.3 + t * 1.4) * sin(seed * 2.1 + t * 2.3);
    float z = sin(seed * 7.1 + t * 0.9) * cos(seed * 4.7 + t * 1.1);
    return vec3(x, y, z);
  }

  void main() {
    float g = uProgress;

    float curtain = smoothstep(0.565, 0.615, g);
    float fractureStart = mix(0.625, 0.715, aFractureOrder);
    float blockDetach = smoothstep(fractureStart, fractureStart + 0.055, g);
    float pixelPhase = smoothstep(0.705, 0.785, g);

    // Begin as a complete screen of large, dark square tiles. A diagonal
    // fracture front gives the blocks staggered momentum and depth before
    // they shrink into individual pixels.
    vec3 pos = vec3(aScreenUv.x * uAspect, aScreenUv.y, 0.0);
    float travel = blockDetach * (0.11 + pixelPhase * (0.30 + aScaleVar * 0.20));
    pos += aDrift * travel;
    pos += noiseDisplace(aSeed, g * 2.1) * 0.13 * pixelPhase;
    pos.z += (aSeed - 0.5) * 0.85 * blockDetach;

    // Reassembly: the scattered fragments are pulled into multiple sphere
    // shells. Cluster staggering makes the reconstruction read as a flowing
    // physical transfer rather than a simultaneous shape swap.
    float gatherStart = 0.775 + aCluster * 0.008;
    float gather = smoothstep(gatherStart, gatherStart + 0.105, g);
    vec3 target = vec3(aTargetCenter.x * uAspect, aTargetCenter.y, 0.0)
                + aTargetLocal * vec3(aTargetRadius, aTargetRadius, aTargetRadius * 0.72);
    target += aTargetLocal * sin(uTime * 1.8 + aSeed * 12.0) * 0.006 * gather;
    pos = mix(pos, target, gather);

    float depth = pos.z;

    // Mouse depth only becomes active after the screen has pixelated; the
    // intact block curtain remains locked to the viewport.
    vec2 m = uMouse * vec2(uAspect, 1.0);
    pos.xy += m * (0.012 + 0.030 * aScaleVar) * pixelPhase;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // The large screen blocks visibly resolve into fine pixels before the
    // sphere reconstruction begins.
    float depthScale = clamp(1.0 + depth * 0.35, 0.55, 1.7);
    float blockSize = uBlockSize * (1.0 - blockDetach * 0.12);
    float fineSize = uPixelSize * (0.72 + aScaleVar * 0.62) * depthScale;
    gl_PointSize = mix(blockSize, fineSize, pixelPhase);

    float leave = 1.0 - smoothstep(0.900, 0.940, g);
    vOpacity = curtain * leave;

    vDepth = depth;
    vPixelPhase = pixelPhase;

    // Near-black screen blocks become luminous plum/magenta pixels.
    float f = h(aSeed * 3.0);
    vec3 blockColor = mix(vec3(0.010, 0.002, 0.018), vec3(0.045, 0.008, 0.065), f);
    vec3 pixelColor = mix(vec3(0.24, 0.045, 0.34), vec3(0.68, 0.12, 0.58), f);
    vColor = mix(blockColor, pixelColor, pixelPhase);
    vColor += vec3(0.08, 0.02, 0.10) * gather;
  }
`;

const PIXEL_FRAG = /* glsl */ `
  precision highp float;

  varying float vOpacity;
  varying float vDepth;
  varying vec3 vColor;
  varying float vPixelPhase;

  void main() {
    // Hard-edged square pixel
    vec2 uv = gl_PointCoord;
    float margin = mix(0.035, 0.09, vPixelPhase);
    float edge = step(margin, uv.x) * step(uv.x, 1.0 - margin)
               * step(margin, uv.y) * step(uv.y, 1.0 - margin);
    if (edge < 0.5) discard;

    float depthFade = smoothstep(-1.6, 0.5, vDepth);
    float centerDist = length(uv - 0.5) * 2.0;
    float lum = 1.0 + 0.12 * (1.0 - centerDist);

    float alpha = vOpacity * mix(0.985, depthFade * 0.92, vPixelPhase);
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor * lum, alpha);
  }
`;

// ---------------------------------------------------------------------------
// PHYSICAL SPHERE SHADERS
// These meshes take over at the exact reconstructed particle-shell positions,
// adding volume, lighting and collision deformation for the gravity phase.
// ---------------------------------------------------------------------------
const SPHERE_VERT = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocal;
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    vLocal = position; // unit-sphere local space -> stable noise under scaling
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const SPHERE_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uOpacity;
  uniform float uFresnelPower;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uGlow;
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec3 vLocal;

  float hash31(vec3 p) {
    p = fract(p * 0.3183099 + 0.1);
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float vnoise(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(mix(hash31(i + vec3(0,0,0)), hash31(i + vec3(1,0,0)), f.x),
          mix(hash31(i + vec3(0,1,0)), hash31(i + vec3(1,1,0)), f.x), f.y),
      mix(mix(hash31(i + vec3(0,0,1)), hash31(i + vec3(1,0,1)), f.x),
          mix(hash31(i + vec3(0,1,1)), hash31(i + vec3(1,1,1)), f.x), f.y),
      f.z);
  }
  float fbm(vec3 p) {
    float a = 0.5, s = 0.0;
    for (int i = 0; i < 3; i++) { s += a * vnoise(p); p *= 2.02; a *= 0.5; }
    return s;
  }

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewDir);
    vec3 lightDir = normalize(vec3(-0.55, 0.72, 0.85));
    vec3 halfDir = normalize(lightDir + viewDir);

    float ndv = max(dot(normal, viewDir), 0.0);
    float diffuse = max(dot(normal, lightDir), 0.0);
    float fres = pow(1.0 - ndv, uFresnelPower);
    float specular = pow(max(dot(normal, halfDir), 0.0), 42.0);
    float smoke = fbm(vLocal * 2.5 + vec3(0.0, uTime * 0.06, 0.0));
    smoke = smoke * 0.5 + 0.5;
    vec3 body = mix(uColorA, uColorB, smoke);
    vec3 litBody = body * (0.44 + diffuse * 0.68);
    vec3 col = litBody + uGlow * fres * 0.78 + vec3(1.0, 0.78, 0.94) * specular * 0.72;
    float alpha = uOpacity * (0.17 + 0.24 * fres + smoke * 0.028);
    alpha = clamp(alpha, 0.0, 1.0);
    if (alpha < 0.01) discard;
    gl_FragColor = vec4(col, alpha);
  }
`;

// ---------------------------------------------------------------------------
// New-sphere layout + deterministic physics config
// Positions are stored as viewport fractions and resolved against the live
// perspective frustum each frame (fully responsive). Physics is a pure
// function of scroll progress so it reconstructs identically on reverse/scrub.
// ---------------------------------------------------------------------------
interface SphereCfg {
  nx: number;          // x anchor as fraction of half-width
  startNx?: number;    // optional assembly x before horizontal fall momentum
  floor: number;       // settle line as fraction of half-height (up = +)
  start: number;       // formation height as fraction of half-height
  r: number;           // radius as fraction of half-height
  formStart: number; formEnd: number;
  dropStart: number; settleEnd: number; dropFrac: number;
  bounceFreq: number; bounceDecay: number; bounceAmp: number; // amp as fraction of half-height
  phase: number; hoverSpeed: number; hoverAmp: number; zHover: number; // hoverAmp fraction of half-height
  parallax: number; spin: number;
  colorA: [number, number, number];
  colorB: [number, number, number];
  glow: [number, number, number];
  fresnel: number;
}

const SPHERE_LIBRARY: SphereCfg[] = [
  {
    nx: -0.70, startNx: -0.30, floor: 0.58, start: 0.68, r: 0.17,
    formStart: 0.864, formEnd: 0.908,
    dropStart: 0.910, settleEnd: 1.0, dropFrac: 0.31,
    bounceFreq: 1.55, bounceDecay: 2.35, bounceAmp: 0.12,
    phase: 0.0, hoverSpeed: 0.85, hoverAmp: 0.022, zHover: 0.18,
    parallax: 0.16, spin: 0.0040,
    colorA: [0.58, 0.30, 0.78], colorB: [0.94, 0.42, 0.73], glow: [1.0, 0.45, 0.86], fresnel: 3.0,
  },
  {
    nx: 0.02, startNx: -0.08, floor: -0.18, start: 0.66, r: 0.205,
    formStart: 0.870, formEnd: 0.912,
    dropStart: 0.914, settleEnd: 1.0, dropFrac: 0.31,
    bounceFreq: 1.45, bounceDecay: 2.45, bounceAmp: 0.15,
    phase: 2.1, hoverSpeed: 0.7, hoverAmp: 0.026, zHover: 0.22,
    parallax: 0.20, spin: -0.0032,
    colorA: [0.48, 0.34, 0.82], colorB: [0.84, 0.44, 0.94], glow: [0.76, 0.50, 1.0], fresnel: 2.7,
  },
  {
    nx: 0.68, startNx: 0.14, floor: 0.60, start: 0.66, r: 0.155,
    formStart: 0.876, formEnd: 0.916,
    dropStart: 0.918, settleEnd: 1.0, dropFrac: 0.31,
    bounceFreq: 1.65, bounceDecay: 2.35, bounceAmp: 0.10,
    phase: 4.2, hoverSpeed: 1.0, hoverAmp: 0.02, zHover: 0.16,
    parallax: 0.13, spin: 0.0036,
    colorA: [0.64, 0.30, 0.74], colorB: [0.96, 0.44, 0.67], glow: [1.0, 0.50, 0.78], fresnel: 3.2,
  },
  {
    nx: 0.84, startNx: 0.34, floor: -0.58, start: 0.65, r: 0.11,
    formStart: 0.882, formEnd: 0.920,
    dropStart: 0.922, settleEnd: 1.0, dropFrac: 0.31,
    bounceFreq: 1.75, bounceDecay: 2.55, bounceAmp: 0.08,
    phase: 5.5, hoverSpeed: 0.9, hoverAmp: 0.016, zHover: 0.12,
    parallax: 0.10, spin: -0.0042,
    colorA: [0.52, 0.28, 0.72], colorB: [0.88, 0.36, 0.82], glow: [1.0, 0.42, 0.82], fresnel: 3.1,
  },
];

const MOBILE_SPHERES: SphereCfg[] = [
  { ...SPHERE_LIBRARY[0], startNx: -0.28, nx: -0.72, floor: 0.72, start: 0.66, r: 0.075, bounceAmp: 0.045 },
  { ...SPHERE_LIBRARY[1], startNx: 0.0, nx: 0.78, floor: -0.35, start: 0.64, r: 0.064, bounceAmp: 0.05 },
  { ...SPHERE_LIBRARY[2], startNx: 0.28, nx: 0.72, floor: 0.70, start: 0.64, r: 0.069, bounceAmp: 0.04 },
];

function chooseSphereConfigs(width: number): SphereCfg[] {
  // Four independent bodies on larger canvases, three on phones.
  if (width < 640) return MOBILE_SPHERES;
  return SPHERE_LIBRARY;
}

// Deterministic vertical trajectory: formation hold -> accelerating fall to
// the true lower viewport boundary -> energetic rebound into the launchpad ->
// settle. Returns a fraction of half-height (up = +). Real-time free-flight
// physics takes over only after this complete entrance choreography.
function sphereYFraction(g: number, c: SphereCfg): number {
  const p = clamp01((g - c.dropStart) / (c.settleEnd - c.dropStart));
  if (p <= 0) return c.start;
  const impactY = -1 + c.r;
  if (p < c.dropFrac) {
    const t = p / c.dropFrac;
    return lerp(c.start, impactY, t * t); // gravity: accelerating fall
  }
  const u = (p - c.dropFrac) / (1 - c.dropFrac);
  const rise = u * u * (3 - 2 * u);
  const settlingWave = Math.sin(Math.PI * u * c.bounceFreq)
    * Math.exp(-c.bounceDecay * u)
    * (1 - u);
  return lerp(impactY, c.floor, rise) + settlingWave * c.bounceAmp;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function PixelTransition() {
  const { subscribe, reducedMotion } = useHomeScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    // --- Viewport ---
    let w = container.clientWidth || window.innerWidth;
    let h = container.clientHeight || window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let aspect = w / h;

    // --- Adaptive screen-block lattice ---
    const area = w * h;
    const targetCount = clamp(Math.floor(area / 210), 1800, 6500);
    const gridCols = Math.max(24, Math.round(Math.sqrt(targetCount * aspect)));
    const gridRows = Math.max(24, Math.round(targetCount / gridCols));
    const PARTICLE_COUNT = gridCols * gridRows;

    function getPixelSize(): number {
      const base = Math.min(w, h);
      if (base >= 1400) return 3.5;
      if (base >= 1000) return 4.0;
      if (base >= 700) return 5.0;
      return 6.0;
    }

    function getBlockSize(): number {
      return Math.max(w / gridCols, h / gridRows) * 1.04;
    }

    // --- Single renderer, two scenes (one WebGL context) ---
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    container.appendChild(renderer.domElement);

    // Pixel field — orthographic (uniform square pixels)
    const FRUSTUM = 2;
    const pixelCamera = new THREE.OrthographicCamera(
      -FRUSTUM * aspect / 2, FRUSTUM * aspect / 2,
      FRUSTUM / 2, -FRUSTUM / 2,
      0.1, 20
    );
    pixelCamera.position.z = 6;
    const pixelScene = new THREE.Scene();

    // New spheres — perspective (natural depth + parallax)
    const SPH_FOV = 45;
    const sphereCamera = new THREE.PerspectiveCamera(SPH_FOV, aspect, 0.1, 100);
    sphereCamera.position.z = 6;
    const sphereScene = new THREE.Scene();
    const halfHeightWorld = Math.tan((SPH_FOV * Math.PI) / 180 / 2) * sphereCamera.position.z;

    // --- Pixel geometry (the complete viewport is the source object) ---
    const screenUv = new Float32Array(PARTICLE_COUNT * 2);
    const drift = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const fractureOrder = new Float32Array(PARTICLE_COUNT);
    const scaleVar = new Float32Array(PARTICLE_COUNT);
    const targetLocal = new Float32Array(PARTICLE_COUNT * 3);
    const targetCenter = new Float32Array(PARTICLE_COUNT * 2);
    const targetRadius = new Float32Array(PARTICLE_COUNT);
    const targetCluster = new Float32Array(PARTICLE_COUNT);
    let sphereConfigs = chooseSphereConfigs(w);

    function assignPixelTargets(configs: SphereCfg[]) {
      const countPerCluster = Math.ceil(PARTICLE_COUNT / configs.length);
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const clusterIndex = i % configs.length;
        const localIndex = Math.floor(i / configs.length);
        const cfg = configs[clusterIndex];
        const [tx, ty, tz] = fibSpherePoint(localIndex, countPerCluster);
        targetLocal[i * 3] = tx;
        targetLocal[i * 3 + 1] = ty;
        targetLocal[i * 3 + 2] = tz;
        targetCenter[i * 2] = cfg.startNx ?? cfg.nx;
        targetCenter[i * 2 + 1] = cfg.start;
        targetRadius[i] = cfg.r;
        targetCluster[i] = clusterIndex;
      }
    }

    assignPixelTargets(sphereConfigs);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const ux = ((col + 0.5) / gridCols) * 2 - 1;
      const uy = 1 - ((row + 0.5) / gridRows) * 2;
      screenUv[i * 2] = ux;
      screenUv[i * 2 + 1] = uy;

      // Diagonal fracture wave with restrained random variation.
      fractureOrder[i] = clamp01((ux * 0.36 - uy * 0.24 + 0.5) * 0.82 + hash(i * 3.1) * 0.18);

      const angle = hash(i * 9.1) * Math.PI * 2;
      const radialLength = Math.hypot(ux, uy) || 1;
      const radialX = ux / radialLength;
      const radialY = uy / radialLength;
      const randomWeight = 0.45 + hash(i * 4.2) * 0.40;
      drift[i * 3] = radialX * 0.32 + Math.cos(angle) * randomWeight;
      drift[i * 3 + 1] = radialY * 0.24 + Math.sin(angle) * randomWeight - 0.08;
      drift[i * 3 + 2] = (hash(i * 4.7) - 0.5) * 1.35;

      seeds[i] = hash(i * 1.1 + 0.3);
      scaleVar[i] = hash(i * 5.7);
    }

    const pixelGeom = new THREE.BufferGeometry();
    pixelGeom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    pixelGeom.setAttribute('aScreenUv', new THREE.Float32BufferAttribute(screenUv, 2));
    pixelGeom.setAttribute('aDrift', new THREE.Float32BufferAttribute(drift, 3));
    pixelGeom.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    pixelGeom.setAttribute('aFractureOrder', new THREE.Float32BufferAttribute(fractureOrder, 1));
    pixelGeom.setAttribute('aScaleVar', new THREE.Float32BufferAttribute(scaleVar, 1));
    pixelGeom.setAttribute('aTargetLocal', new THREE.Float32BufferAttribute(targetLocal, 3));
    pixelGeom.setAttribute('aTargetCenter', new THREE.Float32BufferAttribute(targetCenter, 2));
    pixelGeom.setAttribute('aTargetRadius', new THREE.Float32BufferAttribute(targetRadius, 1));
    pixelGeom.setAttribute('aCluster', new THREE.Float32BufferAttribute(targetCluster, 1));

    const pixelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: aspect },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelSize: { value: getPixelSize() * dpr },
        uBlockSize: { value: getBlockSize() * dpr },
      },
      vertexShader: PIXEL_VERT,
      fragmentShader: PIXEL_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const points = new THREE.Points(pixelGeom, pixelMaterial);
    pixelScene.add(points);

    // --- New spheres (shared unit geometry, per-sphere material) ---
    const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
    let sphereMeshes: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; cfg: SphereCfg }[] = [];
    let physicsBodies: { active: boolean; x: number; y: number; vx: number; vy: number }[] = [];

    function buildSpheres() {
      sphereMeshes.forEach(({ mesh, mat }) => {
        sphereScene.remove(mesh);
        mat.dispose();
      });
      sphereMeshes = sphereConfigs.map((cfg) => {
        const mat = new THREE.ShaderMaterial({
          uniforms: {
            uTime: { value: 0 },
            uOpacity: { value: 0 },
            uFresnelPower: { value: cfg.fresnel },
            uColorA: { value: new THREE.Color(cfg.colorA[0], cfg.colorA[1], cfg.colorA[2]) },
            uColorB: { value: new THREE.Color(cfg.colorB[0], cfg.colorB[1], cfg.colorB[2]) },
            uGlow: { value: new THREE.Color(cfg.glow[0], cfg.glow[1], cfg.glow[2]) },
          },
          vertexShader: SPHERE_VERT,
          fragmentShader: SPHERE_FRAG,
          transparent: true,
          depthWrite: false,
          depthTest: false,
        });
        const mesh = new THREE.Mesh(sphereGeom, mat);
        mesh.visible = false;
        sphereScene.add(mesh);
        return { mesh, mat, cfg };
      });
      physicsBodies = sphereConfigs.map(() => ({ active: false, x: 0, y: 0, vx: 0, vy: 0 }));
    }
    buildSpheres();

    // --- Scroll subscription ---
    const unsub = subscribe((p: number) => { progressRef.current = p; });

    // --- Mouse tracking (normalized, damped) ---
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };
    let mouseActive = false;
    const onMouseMove = (e: MouseEvent) => {
      mouseActive = true;
      mouseTarget.x = (e.clientX / w) * 2 - 1;
      mouseTarget.y = -(e.clientY / h) * 2 + 1;
    };
    const onMouseLeave = () => { mouseActive = false; };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });

    // --- Responsive resize (ResizeObserver: size + DPR + density-independent layout) ---
    function applySize() {
      aspect = w / h;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h);

      pixelCamera.left = -FRUSTUM * aspect / 2;
      pixelCamera.right = FRUSTUM * aspect / 2;
      pixelCamera.top = FRUSTUM / 2;
      pixelCamera.bottom = -FRUSTUM / 2;
      pixelCamera.updateProjectionMatrix();

      sphereCamera.aspect = aspect;
      sphereCamera.updateProjectionMatrix();

      pixelMaterial.uniforms.uAspect.value = aspect;
      pixelMaterial.uniforms.uPixelSize.value = getPixelSize() * dpr;
      pixelMaterial.uniforms.uBlockSize.value = getBlockSize() * dpr;

      const nextConfigs = chooseSphereConfigs(w);
      if (nextConfigs.length !== sphereConfigs.length) {
        sphereConfigs = nextConfigs;
        assignPixelTargets(sphereConfigs);
        pixelGeom.getAttribute('aTargetLocal').needsUpdate = true;
        pixelGeom.getAttribute('aTargetCenter').needsUpdate = true;
        pixelGeom.getAttribute('aTargetRadius').needsUpdate = true;
        pixelGeom.getAttribute('aCluster').needsUpdate = true;
        buildSpheres();
      }
    }
    const ro = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width === 0 || rect.height === 0) return;
      w = Math.round(rect.width);
      h = Math.round(rect.height);
      applySize();
    });
    ro.observe(container);

    // --- Animation loop ---
    let rafId = 0;
    let previousTime = performance.now() * 0.001;
    function animate() {
      rafId = requestAnimationFrame(animate);

      const g = progressRef.current;
      const time = performance.now() * 0.001;
      const deltaTime = Math.min(1 / 30, Math.max(0, time - previousTime));
      previousTime = time;

      // Only draw while the transition is on stage
      if (g < 0.56 || g > 1.02) {
        renderer.clear();
        return;
      }

      // Damped mouse
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.08;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.08;

      // Pixel uniforms
      pixelMaterial.uniforms.uProgress.value = g;
      pixelMaterial.uniforms.uTime.value = time;
      pixelMaterial.uniforms.uMouse.value.set(mouseCurrent.x, mouseCurrent.y);

      // New-sphere deterministic physics + presence
      const halfW = halfHeightWorld * aspect;
      const physicsBlend = smoothstep(0.988, 0.997, g);
      for (let sphereIndex = 0; sphereIndex < sphereMeshes.length; sphereIndex++) {
        const s = sphereMeshes[sphereIndex];
        const c = s.cfg;
        const body = physicsBodies[sphereIndex];
        const emerge = easeOutCubic(smoothstep(c.formStart, c.formEnd, g));
        s.mat.uniforms.uOpacity.value = emerge;
        s.mat.uniforms.uTime.value = time;
        if (emerge <= 0.001) { s.mesh.visible = false; continue; }
        s.mesh.visible = true;

        let yf = sphereYFraction(g, c);
        const dropP = clamp01((g - c.dropStart) / (c.settleEnd - c.dropStart));
        // The cluster falls vertically first, then scatters horizontally on
        // the rebound so its momentum reads as a single physical event.
        const horizontalFlight = easeOutCubic(smoothstep(c.dropFrac, 0.88, dropP));
        const deterministicX = lerp(c.startNx ?? c.nx, c.nx, horizontalFlight) * halfW;
        const deterministicY = yf * halfHeightWorld;
        let worldX = deterministicX + mouseCurrent.x * c.parallax * (1 - physicsBlend);
        let worldY = deterministicY + mouseCurrent.y * c.parallax * 0.6 * (1 - physicsBlend);

        // Once the scroll choreography has settled, hand each sphere to a
        // real-time bounded body. Low-frequency forces create organic gliding;
        // velocity integration, drag and restitution handle every edge impact.
        if (physicsBlend > 0.001) {
          if (!body.active) {
            body.active = true;
            body.x = deterministicX;
            body.y = deterministicY;
            body.vx = Math.sin(c.phase + 0.8) * 0.24;
            body.vy = Math.cos(c.phase + 0.35) * 0.18;
          }

          const radius = c.r * halfHeightWorld;
          // Two incommensurate waves per axis keep every body wandering on a
          // distinct, non-repeating-looking path instead of sharing an orbit.
          const accelerationX =
            Math.sin(time * (0.31 + c.hoverSpeed * 0.13) + c.phase) * 0.052 +
            Math.cos(time * (0.19 + c.hoverSpeed * 0.07) + c.phase * 1.71) * 0.031;
          const accelerationY =
            Math.cos(time * (0.27 + c.hoverSpeed * 0.11) + c.phase * 1.3) * 0.048 +
            Math.sin(time * (0.17 + c.hoverSpeed * 0.08) + c.phase * 2.03) * 0.029;
          body.vx += accelerationX * deltaTime;
          body.vy += accelerationY * deltaTime;

          // Cursor-to-sphere repulsion. The force rises quadratically only
          // inside the sphere's local influence radius, like a soft magnet.
          if (mouseActive) {
            const mouseWorldX = mouseCurrent.x * halfW;
            const mouseWorldY = mouseCurrent.y * halfHeightWorld;
            const repelX = body.x - mouseWorldX;
            const repelY = body.y - mouseWorldY;
            const repelDistance = Math.hypot(repelX, repelY) || 0.0001;
            const repelRadius = radius * 2.15 + 0.32;
            if (repelDistance < repelRadius) {
              const influence = 1 - repelDistance / repelRadius;
              const force = influence * influence * 2.35;
              body.vx += (repelX / repelDistance) * force * deltaTime;
              body.vy += (repelY / repelDistance) * force * deltaTime;
            }
          }

          const drag = Math.pow(0.998, deltaTime * 60);
          body.vx *= drag;
          body.vy *= drag;
          const speed = Math.hypot(body.vx, body.vy);
          const maxSpeed = 0.38;
          if (speed > maxSpeed) {
            body.vx = (body.vx / speed) * maxSpeed;
            body.vy = (body.vy / speed) * maxSpeed;
          }

          body.x += body.vx * deltaTime;
          body.y += body.vy * deltaTime;

          const minX = -halfW + radius;
          const maxX = halfW - radius;
          const minY = -halfHeightWorld + radius;
          const maxY = halfHeightWorld - radius;
          if (body.x < minX) { body.x = minX; body.vx = Math.abs(body.vx) * 0.94; }
          if (body.x > maxX) { body.x = maxX; body.vx = -Math.abs(body.vx) * 0.94; }
          if (body.y < minY) { body.y = minY; body.vy = Math.abs(body.vy) * 0.92; }
          if (body.y > maxY) { body.y = maxY; body.vy = -Math.abs(body.vy) * 0.92; }

          worldX = lerp(deterministicX, body.x, physicsBlend);
          worldY = lerp(deterministicY, body.y, physicsBlend);
        } else {
          body.active = false;
        }

        s.mesh.position.set(
          worldX,
          worldY,
          Math.sin(time * 0.5 + c.phase) * c.zHover * physicsBlend
        );
        const baseScale = c.r * halfHeightWorld * emerge;
        // Uniform scaling keeps the projected silhouette perfectly circular.
        s.mesh.scale.setScalar(baseScale);
        s.mesh.rotation.y += c.spin;
        s.mesh.rotation.x = mouseCurrent.y * 0.15;
        s.mesh.rotation.z = mouseCurrent.x * 0.10;
      }

      // Resolve sphere-to-sphere contacts after every body has integrated.
      // Radius-squared mass gives the larger glass bodies believable weight;
      // positional correction prevents slow overlaps from accumulating.
      for (let aIndex = 0; aIndex < physicsBodies.length; aIndex++) {
        const a = physicsBodies[aIndex];
        if (!a.active) continue;
        for (let bIndex = aIndex + 1; bIndex < physicsBodies.length; bIndex++) {
          const b = physicsBodies[bIndex];
          if (!b.active) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const minDistance = (sphereConfigs[aIndex].r + sphereConfigs[bIndex].r) * halfHeightWorld;
          const distanceSquared = dx * dx + dy * dy;
          if (distanceSquared >= minDistance * minDistance) continue;

          const distance = Math.sqrt(distanceSquared) || 0.0001;
          const nx = dx / distance;
          const ny = dy / distance;
          const overlap = minDistance - distance;
          const massA = sphereConfigs[aIndex].r * sphereConfigs[aIndex].r;
          const massB = sphereConfigs[bIndex].r * sphereConfigs[bIndex].r;
          const totalMass = massA + massB;

          a.x -= nx * overlap * (massB / totalMass);
          a.y -= ny * overlap * (massB / totalMass);
          b.x += nx * overlap * (massA / totalMass);
          b.y += ny * overlap * (massA / totalMass);

          const relativeNormalVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
          if (relativeNormalVelocity < 0) {
            const restitution = 0.88;
            const impulse = -(1 + restitution) * relativeNormalVelocity / (1 / massA + 1 / massB);
            const impulseX = impulse * nx;
            const impulseY = impulse * ny;
            a.vx -= impulseX / massA;
            a.vy -= impulseY / massA;
            b.vx += impulseX / massB;
            b.vy += impulseY / massB;
          }
        }
      }

      // Pair separation can nudge a sphere past a wall, so finish with a
      // second boundary constraint to guarantee every body remains visible.
      for (let bodyIndex = 0; bodyIndex < physicsBodies.length; bodyIndex++) {
        const body = physicsBodies[bodyIndex];
        if (!body.active) continue;
        const radius = sphereConfigs[bodyIndex].r * halfHeightWorld;
        const minX = -halfW + radius;
        const maxX = halfW - radius;
        const minY = -halfHeightWorld + radius;
        const maxY = halfHeightWorld - radius;
        if (body.x < minX) { body.x = minX; body.vx = Math.abs(body.vx) * 0.94; }
        if (body.x > maxX) { body.x = maxX; body.vx = -Math.abs(body.vx) * 0.94; }
        if (body.y < minY) { body.y = minY; body.vy = Math.abs(body.vy) * 0.92; }
        if (body.y > maxY) { body.y = maxY; body.vy = -Math.abs(body.vy) * 0.92; }
      }

      // Apply any pair-collision correction to the rendered bodies. The blend
      // preserves a seamless handoff from scroll choreography to free motion.
      if (physicsBlend > 0.001) {
        sphereMeshes.forEach((sphere, index) => {
          const body = physicsBodies[index];
          if (!body.active || !sphere.mesh.visible) return;
          sphere.mesh.position.x = lerp(sphere.mesh.position.x, body.x, physicsBlend);
          sphere.mesh.position.y = lerp(sphere.mesh.position.y, body.y, physicsBlend);
        });
      }

      // Composite: spheres behind, dissolving pixel field in front
      renderer.clear();
      renderer.render(sphereScene, sphereCamera);
      renderer.render(pixelScene, pixelCamera);
    }
    animate();

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      ro.disconnect();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      pixelGeom.dispose();
      pixelMaterial.dispose();
      sphereGeom.dispose();
      sphereMeshes.forEach(({ mat }) => mat.dispose());
    };
  }, [subscribe, reducedMotion]);

  return <div ref={containerRef} className={styles.pixelTransitionCanvas} />;
}
