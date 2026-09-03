'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Math helpers
// ---------------------------------------------------------------------------
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
function clamp01(t: number): number { return clamp(t, 0, 1); }
function rangeProgress(p: number, s: number, e: number): number {
  return clamp01((p - s) / (e - s));
}
function lerp(a: number, b: number, t: number): number { return a + (b - a) * t; }


// Deterministic hash
function hash(n: number): number {
  const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453123;
  return s - Math.floor(s);
}

// Fibonacci sphere point
function fibSpherePoint(i: number, total: number): [number, number, number] {
  const phi = Math.acos(1 - 2 * (i + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * i;
  return [
    Math.sin(phi) * Math.cos(theta),
    Math.cos(phi),
    Math.sin(phi) * Math.sin(theta),
  ];
}

// Precomputed bounce trajectory: damped sinusoidal
function bounceY(t: number, amplitude: number, decay: number, freq: number): number {
  return amplitude * Math.sin(freq * t * Math.PI) * Math.exp(-decay * t);
}

// ---------------------------------------------------------------------------
// Shaders
// ---------------------------------------------------------------------------
const VERT = /* glsl */ `
  precision highp float;

  // Per-instance attributes
  attribute vec3 aInitialPos;
  attribute vec3 aTargetPos;
  attribute float aSeed;
  attribute float aDelay;
  attribute float aSphereIdx;

  // Uniforms
  uniform float uProgress;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform float uPixelSize;
  uniform float uAspect;
  uniform vec3 uSphere0Center;
  uniform vec3 uSphere1Center;
  uniform vec3 uSphere2Center;

  varying float vOpacity;
  varying float vDepth;
  varying vec3 vColor;

  // Deterministic noise
  float h(float n) {
    return fract(sin(n * 12.9898 + 78.233) * 43758.5453);
  }

  vec3 noiseDisplace(float seed, float t) {
    float x = sin(seed * 3.7 + t * 2.1) * cos(seed * 1.3 + t * 1.7);
    float y = cos(seed * 5.3 + t * 1.4) * sin(seed * 2.1 + t * 2.3);
    float z = sin(seed * 7.1 + t * 0.9) * cos(seed * 4.7 + t * 1.1);
    return vec3(x, y, z);
  }

  void main() {
    float p = uProgress;
    float seed = aSeed;
    float delay = aDelay;

    // --- Phase progress (with per-particle delay) ---
    float pixelSphereT  = smoothstep(0.0, 0.12, p);
    float disintegrateT = smoothstep(0.12 + delay * 0.08, 0.30, p);
    float fieldT        = smoothstep(0.30, 0.46, p);
    float formT         = smoothstep(0.46 + delay * 0.06, 0.65, p);
    float lockT         = smoothstep(0.65, 0.72, p);
    float postLockT     = clamp((p - 0.72) / 0.28, 0.0, 1.0); // 0.72→1.0

    // --- Sphere center selection ---
    vec3 sphereCenter;
    if (aSphereIdx < 0.5) sphereCenter = uSphere0Center;
    else if (aSphereIdx < 1.5) sphereCenter = uSphere1Center;
    else sphereCenter = uSphere2Center;

    // --- Position computation ---

    // Stage 1: Large sphere position
    vec3 pos = aInitialPos;

    // Stage 2: Disintegration — radial outward + noise
    vec3 radialDir = normalize(aInitialPos);
    float expandDist = disintegrateT * (1.2 + h(seed * 7.0) * 0.8);
    vec3 noiseOff = noiseDisplace(seed, p * 3.0) * disintegrateT * 0.5;
    pos = mix(pos, pos + radialDir * expandDist + noiseOff, disintegrateT);

    // Stage 3: Field drift — additional noise displacement
    vec3 fieldNoise = noiseDisplace(seed + 100.0, p * 2.0) * 0.4;
    pos += fieldNoise * fieldT * (1.0 - formT);

    // Stage 4: Formation — spring toward target sphere position
    vec3 localTarget = aTargetPos; // local offset within sphere
    vec3 worldTarget = sphereCenter + localTarget;
    pos = mix(pos, worldTarget, formT * formT); // quadratic easing

    // Stage 5: Lock — snap to sphere surface
    pos = mix(pos, worldTarget, lockT);

    // Stage 6: Post-lock — particles follow sphere center
    // The sphere center already includes drop/bounce/hover from CPU
    // So worldTarget is already correct when lockT = 1

    // --- Mouse interaction ---
    vec2 mouseWorld = uMouse * vec2(uAspect, 1.0);
    vec2 toMouse = pos.xy - mouseWorld;
    float mouseDist = length(toMouse);
    float mouseInfluence = smoothstep(0.4, 0.0, mouseDist) * 0.08;
    pos.xy += normalize(toMouse + vec2(0.001)) * mouseInfluence;

    // --- Appearance opacity ---
    float appearT = smoothstep(0.0, 0.05, p);

    // Fade during reveal (progress > 0.88, non-sphere particles fade)
    float revealFade = 1.0 - smoothstep(0.88, 1.0, p) * (1.0 - lockT * 0.3);

    vOpacity = appearT * revealFade;

    // Depth for visual variation
    vDepth = pos.z;

    // Color: dark purple base with variation
    float f = h(seed * 3.0);
    vColor = vec3(
      0.3 + f * 0.15,
      0.1 + f * 0.08,
      0.45 + f * 0.2
    );

    // Brighten during formation
    vColor += vec3(0.1, 0.05, 0.15) * formT;

    // --- Final position ---
    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = uPixelSize * (1.0 + 0.15 * h(seed * 11.0));
  }
`;

const FRAG = /* glsl */ `
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

    // Depth-based opacity variation
    float depthFade = smoothstep(-1.5, 0.5, vDepth);

    // Subtle inner luminance
    float centerDist = length(uv - 0.5) * 2.0;
    float lum = 1.0 + 0.12 * (1.0 - centerDist);

    float alpha = vOpacity * depthFade * 0.85;
    if (alpha < 0.01) discard;

    gl_FragColor = vec4(vColor * lum, alpha);
  }
`;

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
    let w = window.innerWidth;
    let h = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let aspect = w / h;

    // --- Particle count (responsive) ---
    const area = w * h;
    const PARTICLE_COUNT = clamp(Math.floor(area / 180), 1500, 7000);

    // --- Pixel size (responsive) ---
    function getPixelSize(): number {
      const base = Math.min(w, h);
      if (base >= 1400) return 3.5;
      if (base >= 1000) return 4.0;
      if (base >= 700) return 5.0;
      return 6.0;
    }

    // --- Sphere target centers (viewport-responsive) ---
    function getSphereCenter(idx: number): THREE.Vector3 {
      const scale = Math.min(aspect, 1.8); // prevent extreme ultrawide
      switch (idx) {
        case 0: return new THREE.Vector3(-0.35 * scale, -0.25, 0);
        case 1: return new THREE.Vector3(0.3 * scale, 0.05, 0);
        case 2: return new THREE.Vector3(0.05 * scale, -0.45, 0);
        default: return new THREE.Vector3(0, 0, 0);
      }
    }

    // Large sphere radius (in world units)
    const LARGE_R = 0.8;
    // Small sphere radius
    const SMALL_R = 0.22;

    // --- Three.js Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Orthographic camera scaled to normalized coords
    const frustumSize = 2;
    const camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2, frustumSize * aspect / 2,
      frustumSize / 2, -frustumSize / 2,
      0.1, 10
    );
    camera.position.z = 5;

    const scene = new THREE.Scene();

    // --- Generate particle data ---
    const initialPositions = new Float32Array(PARTICLE_COUNT * 3);
    const targetPositions = new Float32Array(PARTICLE_COUNT * 3);
    const seeds = new Float32Array(PARTICLE_COUNT);
    const delays = new Float32Array(PARTICLE_COUNT);
    const sphereIndices = new Float32Array(PARTICLE_COUNT);

    // Particles per target sphere
    const perSphere = Math.floor(PARTICLE_COUNT / 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Initial position: Fibonacci sphere (large)
      const [fx, fy, fz] = fibSpherePoint(i, PARTICLE_COUNT);
      initialPositions[i * 3] = fx * LARGE_R;
      initialPositions[i * 3 + 1] = fy * LARGE_R;
      initialPositions[i * 3 + 2] = fz * LARGE_R;

      // Assign to one of 3 spheres
      const si = i < perSphere ? 0 : i < perSphere * 2 ? 1 : 2;
      sphereIndices[i] = si;

      // Target position: Fibonacci point on small sphere (local offset)
      const localIdx = i - si * perSphere;
      const localTotal = si < 2 ? perSphere : PARTICLE_COUNT - perSphere * 2;
      const [tx, ty, tz] = fibSpherePoint(localIdx, localTotal);
      targetPositions[i * 3] = tx * SMALL_R;
      targetPositions[i * 3 + 1] = ty * SMALL_R;
      targetPositions[i * 3 + 2] = tz * SMALL_R;

      // Seed
      seeds[i] = hash(i * 1.0 + 0.5);

      // Delay: based on distance from sphere center (center first, edges later)
      const dist = Math.sqrt(fx * fx + fy * fy + fz * fz);
      delays[i] = dist * 0.3 + hash(i * 7.0) * 0.2;
    }

    // --- InstancedBufferGeometry using Points ---
    const geometry = new THREE.BufferGeometry();
    // Dummy position (overridden by shader)
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(
      new Float32Array(PARTICLE_COUNT * 3), 3
    ));
    geometry.setAttribute('aInitialPos', new THREE.Float32BufferAttribute(initialPositions, 3));
    geometry.setAttribute('aTargetPos', new THREE.Float32BufferAttribute(targetPositions, 3));
    geometry.setAttribute('aSeed', new THREE.Float32BufferAttribute(seeds, 1));
    geometry.setAttribute('aDelay', new THREE.Float32BufferAttribute(delays, 1));
    geometry.setAttribute('aSphereIdx', new THREE.Float32BufferAttribute(sphereIndices, 1));

    // Sphere center uniforms (will be updated with physics)
    const sphere0Center = new THREE.Vector3();
    const sphere1Center = new THREE.Vector3();
    const sphere2Center = new THREE.Vector3();

    function updateSphereCenters(progress: number, time: number) {
      for (let si = 0; si < 3; si++) {
        const base = getSphereCenter(si);
        let cx = base.x;
        let cy = base.y;
        let cz = base.z;

        // Gravity drop: progress 0.72→0.84
        const dropT = rangeProgress(progress, 0.72, 0.84);
        const dropDist = dropT * dropT * 1.2; // quadratic fall
        cy -= dropDist;

        // Bounce: progress 0.84→0.92
        const bouncePhase = rangeProgress(progress, 0.84, 0.96);
        if (bouncePhase > 0 && bouncePhase < 1) {
          const bAmp = 0.6 * (1 - dropT * 0.3); // less bounce for spheres that fell further
          cy += bounceY(bouncePhase, bAmp, 4.0, 3.0 + si * 0.5);
        }

        // Settle: handled by bounce decay

        // Hover: progress 0.96→1.0
        const hoverT = rangeProgress(progress, 0.96, 1.0);
        if (hoverT > 0) {
          const phase = si * 2.094; // 120° apart
          cy += Math.sin(time * 0.8 + phase) * 0.03 * hoverT;
          cx += Math.sin(time * 0.5 + phase + 1.0) * 0.015 * hoverT;
        }

        if (si === 0) sphere0Center.set(cx, cy, cz);
        else if (si === 1) sphere1Center.set(cx, cy, cz);
        else sphere2Center.set(cx, cy, cz);
      }
    }

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uProgress: { value: 0 },
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(w * dpr, h * dpr) },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uPixelSize: { value: getPixelSize() * dpr },
        uAspect: { value: aspect },
        uSphere0Center: { value: sphere0Center },
        uSphere1Center: { value: sphere1Center },
        uSphere2Center: { value: sphere2Center },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // --- Scroll subscription ---
    const unsub = subscribe((p: number) => {
      progressRef.current = p;
    });

    // --- Mouse tracking ---
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };
    const onMouseMove = (e: MouseEvent) => {
      mouseTarget.x = (e.clientX / w) * 2 - 1;
      mouseTarget.y = -(e.clientY / h) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // --- Resize ---
    const onResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      aspect = w / h;

      renderer.setSize(w, h);
      camera.left = -frustumSize * aspect / 2;
      camera.right = frustumSize * aspect / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();

      material.uniforms.uResolution.value.set(w * dpr, h * dpr);
      material.uniforms.uAspect.value = aspect;
      material.uniforms.uPixelSize.value = getPixelSize() * dpr;
    };
    window.addEventListener('resize', onResize);

    // --- Animation loop ---
    let isActive = true;
    let animId = 0;

    function animate() {
      if (!isActive) return;
      animId = requestAnimationFrame(animate);

      const scrollProgress = progressRef.current;
      const time = performance.now() * 0.001;

      // Map scroll progress to internal progress
      // Pixel transition runs from scroll 0.66 → 1.00
      const internalProgress = rangeProgress(scrollProgress, 0.66, 1.0);

      // Don't render when not in range
      if (scrollProgress < 0.63 || scrollProgress > 1.01) {
        renderer.clear();
        return;
      }

      // Smooth mouse
      mouseCurrent.x += (mouseTarget.x - mouseCurrent.x) * 0.08;
      mouseCurrent.y += (mouseTarget.y - mouseCurrent.y) * 0.08;

      // Update sphere centers with physics
      updateSphereCenters(internalProgress, time);

      // Update uniforms
      material.uniforms.uProgress.value = internalProgress;
      material.uniforms.uTime.value = time;
      material.uniforms.uMouse.value.set(mouseCurrent.x * aspect * 0.5, mouseCurrent.y * 0.5);
      material.uniforms.uSphere0Center.value.copy(sphere0Center);
      material.uniforms.uSphere1Center.value.copy(sphere1Center);
      material.uniforms.uSphere2Center.value.copy(sphere2Center);

      renderer.render(scene, camera);
    }

    animate();

    // --- Cleanup ---
    return () => {
      isActive = false;
      cancelAnimationFrame(animId);
      unsub();
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [subscribe, reducedMotion]);

  return (
    <div
      ref={containerRef}
      className={styles.pixelTransitionCanvas}
    />
  );
}
