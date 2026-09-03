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
// PIXEL FIELD SHADERS
// The sphere surface fractures into square fragments that disperse through
// depth and dissolve. The pixels NEVER reform into spheres — this field is
// transition material only and leaves the composition by ~0.92.
// ---------------------------------------------------------------------------
const PIXEL_VERT = /* glsl */ `
  precision highp float;

  attribute vec3 aSpherePos;      // home position on the sphere shell
  attribute vec3 aDrift;          // per-particle dispersal direction (varied depth)
  attribute float aSeed;
  attribute float aFractureOrder; // 0..1 — drives the fracture wave across the surface
  attribute float aScaleVar;      // controlled size variation

  uniform float uProgress;        // global scroll progress 0..1
  uniform float uTime;
  uniform float uAspect;
  uniform vec2 uMouse;            // damped, normalized -1..1
  uniform float uPixelSize;

  varying float vOpacity;
  varying float vDepth;
  varying vec3 vColor;

  float h(float n) { return fract(sin(n * 12.9898 + 78.233) * 43758.5453); }

  vec3 noiseDisplace(float seed, float t) {
    float x = sin(seed * 3.7 + t * 2.1) * cos(seed * 1.3 + t * 1.7);
    float y = cos(seed * 5.3 + t * 1.4) * sin(seed * 2.1 + t * 2.3);
    float z = sin(seed * 7.1 + t * 0.9) * cos(seed * 4.7 + t * 1.1);
    return vec3(x, y, z);
  }

  void main() {
    float g = uProgress;

    // Shell fades in and crossfades with the fading SphereScene nucleus (0.66->0.72)
    float cohere = smoothstep(0.58, 0.66, g);

    // Fracture wave: fragments detach in a front that sweeps across the surface,
    // beginning locally (aFractureOrder small) and propagating outward.
    float fStart = mix(0.66, 0.77, aFractureOrder);
    float detach = smoothstep(fStart, fStart + 0.09, g);

    vec3 pos = aSpherePos;

    // Pre-fracture surface shimmer (tension) while cohered and not yet detached
    float shimmer = (1.0 - detach) * cohere;
    pos += aDrift * 0.015 * sin(uTime * 1.6 + aSeed * 6.2831) * shimmer;

    // Dispersal: outward from the sphere centre + per-particle drift + flow noise.
    // Fragments keep a relationship to their origin as they spread (no target shape).
    vec3 radial = normalize(aSpherePos + 1e-5);
    float travel = detach * (0.9 + aScaleVar * 0.9);
    pos += radial * travel * 0.55;
    pos += aDrift * travel;
    pos += noiseDisplace(aSeed, g * 1.8) * 0.35 * detach;

    float depth = pos.z;

    // Subtle depth-weighted mouse parallax
    vec2 m = uMouse * vec2(uAspect, 1.0);
    pos.xy += m * (0.018 + 0.045 * aScaleVar);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Fake-perspective size cue from depth (camera is orthographic)
    float depthScale = clamp(1.0 + depth * 0.35, 0.55, 1.7);
    gl_PointSize = uPixelSize * (0.7 + aScaleVar * 0.7) * depthScale;

    // Appear with the shell, then dissolve away — never reforms
    float leave = 1.0 - smoothstep(0.82, 0.92, g);
    float thin = 1.0 - detach * 0.15;
    vOpacity = cohere * leave * thin;

    vDepth = depth;

    // Restrained deep-plum -> magenta variation
    float f = h(aSeed * 3.0);
    vColor = mix(vec3(0.18, 0.05, 0.28), vec3(0.55, 0.12, 0.5), f);
    vColor += vec3(0.06, 0.02, 0.08) * detach;
  }
`;

const PIXEL_FRAG = /* glsl */ `
  precision highp float;

  varying float vOpacity;
  varying float vDepth;
  varying vec3 vColor;

  void main() {
    // Hard-edged square pixel
    vec2 uv = gl_PointCoord;
    float margin = 0.06;
    float edge = step(margin, uv.x) * step(uv.x, 1.0 - margin)
               * step(margin, uv.y) * step(uv.y, 1.0 - margin);
    if (edge < 0.5) discard;

    float depthFade = smoothstep(-1.6, 0.5, vDepth);
    float centerDist = length(uv - 0.5) * 2.0;
    float lum = 1.0 + 0.12 * (1.0 - centerDist);

    float alpha = vOpacity * depthFade * 0.9;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor * lum, alpha);
  }
`;

// ---------------------------------------------------------------------------
// NEW SPHERE SHADERS
// Independent quantum objects (NOT built from the pixels). Translucent, smoky
// internal variation, Fresnel edge, restrained glow.
// ---------------------------------------------------------------------------
const SPHERE_VERT = /* glsl */ `
  precision highp float;
  varying vec3 vNormal;
  varying vec3 vView;
  varying vec3 vLocal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vView = normalize(cameraPosition - wp.xyz);
    vLocal = position; // unit-sphere local space -> stable noise under scaling
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
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
  varying vec3 vView;
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
    float fres = pow(1.0 - max(dot(vNormal, vView), 0.0), uFresnelPower);
    float smoke = fbm(vLocal * 2.5 + vec3(0.0, uTime * 0.06, 0.0));
    smoke = smoke * 0.5 + 0.5;
    vec3 body = mix(uColorA, uColorB, smoke);
    vec3 col = body + uGlow * fres * 1.1;
    float alpha = uOpacity * ((0.26 + 0.55 * fres) + smoke * 0.06);
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
    nx: -0.58, floor: 0.58, start: 0.99, r: 0.20,
    formStart: 0.80, formEnd: 0.875,
    dropStart: 0.885, settleEnd: 1.0, dropFrac: 0.34,
    bounceFreq: 2.0, bounceDecay: 2.4, bounceAmp: 0.16,
    phase: 0.0, hoverSpeed: 0.85, hoverAmp: 0.022, zHover: 0.18,
    parallax: 0.16, spin: 0.0040,
    colorA: [0.14, 0.04, 0.22], colorB: [0.42, 0.12, 0.52], glow: [0.95, 0.15, 0.55], fresnel: 3.0,
  },
  {
    nx: 0.06, floor: 0.52, start: 0.96, r: 0.235,
    formStart: 0.815, formEnd: 0.885,
    dropStart: 0.895, settleEnd: 1.0, dropFrac: 0.34,
    bounceFreq: 1.8, bounceDecay: 2.7, bounceAmp: 0.19,
    phase: 2.1, hoverSpeed: 0.7, hoverAmp: 0.026, zHover: 0.22,
    parallax: 0.20, spin: -0.0032,
    colorA: [0.12, 0.05, 0.24], colorB: [0.50, 0.16, 0.60], glow: [0.63, 0.13, 0.94], fresnel: 2.7,
  },
  {
    nx: 0.62, floor: 0.60, start: 1.0, r: 0.18,
    formStart: 0.83, formEnd: 0.90,
    dropStart: 0.905, settleEnd: 1.0, dropFrac: 0.34,
    bounceFreq: 2.2, bounceDecay: 2.5, bounceAmp: 0.14,
    phase: 4.2, hoverSpeed: 1.0, hoverAmp: 0.02, zHover: 0.16,
    parallax: 0.13, spin: 0.0036,
    colorA: [0.15, 0.04, 0.20], colorB: [0.46, 0.13, 0.50], glow: [0.98, 0.20, 0.62], fresnel: 3.2,
  },
];

function chooseSphereConfigs(width: number): SphereCfg[] {
  // 2 on narrow viewports, 3 otherwise — restrained, never overcrowded.
  if (width < 640) return [SPHERE_LIBRARY[0], SPHERE_LIBRARY[2]];
  return SPHERE_LIBRARY;
}

// Deterministic vertical trajectory: formation hold -> accelerating fall ->
// floor collision -> decaying bounce (restitution) -> settle. Returns a
// fraction of half-height (up = +). Hover is added separately (time-based,
// blended in only at the very end).
function sphereYFraction(g: number, c: SphereCfg): number {
  const p = clamp01((g - c.dropStart) / (c.settleEnd - c.dropStart));
  if (p <= 0) return c.start;
  if (p < c.dropFrac) {
    const t = p / c.dropFrac;
    return lerp(c.start, c.floor, t * t); // gravity: accelerating fall
  }
  const u = (p - c.dropFrac) / (1 - c.dropFrac);
  const bounce = Math.abs(Math.sin(Math.PI * c.bounceFreq * u)) * Math.exp(-c.bounceDecay * u);
  return c.floor + bounce * c.bounceAmp;
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

    // --- Adaptive particle density ---
    const area = w * h;
    const PARTICLE_COUNT = clamp(Math.floor(area / 180), 1500, 7000);

    function getPixelSize(): number {
      const base = Math.min(w, h);
      if (base >= 1400) return 3.5;
      if (base >= 1000) return 4.0;
      if (base >= 700) return 5.0;
      return 6.0;
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

    // --- Pixel geometry (sphere shell that fractures) ---
    const LARGE_R = 0.85;
    const spherePos = new Float32Array(PARTICLE_COUNT * 3);
    const drift = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const fractureOrder = new Float32Array(PARTICLE_COUNT);
    const scaleVar = new Float32Array(PARTICLE_COUNT);

    // Fracture front sweeps along this direction across the surface
    const waveDir = (() => {
      const v = [0.62, 0.55, -0.30];
      const len = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / len, v[1] / len, v[2] / len];
    })();

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const [ux, uy, uz] = fibSpherePoint(i, PARTICLE_COUNT);
      spherePos[i * 3] = ux * LARGE_R;
      spherePos[i * 3 + 1] = uy * LARGE_R;
      spherePos[i * 3 + 2] = uz * LARGE_R;

      // Fracture order: projection onto the wave direction (propagating front) + jitter
      const proj = ux * waveDir[0] + uy * waveDir[1] + uz * waveDir[2];
      fractureOrder[i] = clamp01((proj * 0.5 + 0.5) * 0.85 + hash(i * 3.1) * 0.15);

      // Drift direction: tangential swirl + slight outward + strong depth spread
      const axis: [number, number, number] = Math.abs(uy) < 0.9 ? [0, 1, 0] : [1, 0, 0];
      let tx = uy * axis[2] - uz * axis[1];
      let ty = uz * axis[0] - ux * axis[2];
      let tz = ux * axis[1] - uy * axis[0];
      const tl = Math.hypot(tx, ty, tz) || 1;
      tx /= tl; ty /= tl; tz /= tl;
      // bitangent = n x t
      const bx = uy * tz - uz * ty;
      const by = uz * tx - ux * tz;
      const bz = ux * ty - uy * tx;
      const a = hash(i * 9.1) * Math.PI * 2;
      const ca = Math.cos(a), sa = Math.sin(a);
      const swirl = 0.4 + 0.5 * hash(i * 2.3);
      const out = 0.15 + 0.2 * hash(i * 6.7);
      drift[i * 3] = (tx * ca + bx * sa) * swirl + ux * out;
      drift[i * 3 + 1] = (ty * ca + by * sa) * swirl + uy * out;
      drift[i * 3 + 2] = (tz * ca + bz * sa) * swirl + uz * out + (hash(i * 4.7) - 0.5) * 1.4;

      seeds[i] = hash(i * 1.1 + 0.3);
      scaleVar[i] = hash(i * 5.7);
    }

    const pixelGeom = new THREE.BufferGeometry();
    pixelGeom.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(PARTICLE_COUNT * 3), 3));
    pixelGeom.setAttribute('aSpherePos', new THREE.Float32BufferAttribute(spherePos, 3));
    pixelGeom.setAttribute('aDrift', new THREE.Float32BufferAttribute(drift, 3));
    pixelGeom.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    pixelGeom.setAttribute('aFractureOrder', new THREE.Float32BufferAttribute(fractureOrder, 1));
    pixelGeom.setAttribute('aScaleVar', new THREE.Float32BufferAttribute(scaleVar, 1));

    const pixelMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uAspect: { value: aspect },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelSize: { value: getPixelSize() * dpr },
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
    let sphereConfigs = chooseSphereConfigs(w);
    const sphereGeom = new THREE.SphereGeometry(1, 32, 32);
    let sphereMeshes: { mesh: THREE.Mesh; mat: THREE.ShaderMaterial; cfg: SphereCfg }[] = [];

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
    }
    buildSpheres();

    // --- Scroll subscription ---
    const unsub = subscribe((p: number) => { progressRef.current = p; });

    // --- Mouse tracking (normalized, damped) ---
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / w) * 2 - 1;
      mouseTarget.y = -(e.clientY / h) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

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

      const nextConfigs = chooseSphereConfigs(w);
      if (nextConfigs.length !== sphereConfigs.length) {
        sphereConfigs = nextConfigs;
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
    function animate() {
      rafId = requestAnimationFrame(animate);

      const g = progressRef.current;
      const time = performance.now() * 0.001;

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
      const hoverBlend = smoothstep(0.965, 1.0, g);
      for (const s of sphereMeshes) {
        const c = s.cfg;
        const emerge = easeOutCubic(smoothstep(c.formStart, c.formEnd, g));
        s.mat.uniforms.uOpacity.value = emerge;
        s.mat.uniforms.uTime.value = time;
        if (emerge <= 0.001) { s.mesh.visible = false; continue; }
        s.mesh.visible = true;

        let yf = sphereYFraction(g, c);
        yf += Math.sin(time * c.hoverSpeed + c.phase) * c.hoverAmp * hoverBlend;
        const xf = c.nx + Math.sin(time * c.hoverSpeed * 0.6 + c.phase + 1.0) * 0.01 * hoverBlend;

        s.mesh.position.set(
          xf * halfW + mouseCurrent.x * c.parallax,
          yf * halfHeightWorld + mouseCurrent.y * c.parallax * 0.6,
          Math.sin(time * 0.5 + c.phase) * c.zHover * hoverBlend
        );
        s.mesh.scale.setScalar(c.r * halfHeightWorld * emerge);
        s.mesh.rotation.y += c.spin;
        s.mesh.rotation.x = mouseCurrent.y * 0.15;
        s.mesh.rotation.z = mouseCurrent.x * 0.10;
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
