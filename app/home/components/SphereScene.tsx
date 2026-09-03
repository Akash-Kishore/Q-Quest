'use client';

import { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Interpolation helpers
// ---------------------------------------------------------------------------
function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function rangeProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

// Custom easings for cinematic rhythm
function easeInOutQuart(t: number): number {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

// ---------------------------------------------------------------------------
// Camera choreography — multi-axis with per-segment easing
// ---------------------------------------------------------------------------
interface CameraState {
  z: number;
  y: number;
  x: number;
  fov: number;
}

function getCameraState(progress: number): CameraState {
  // Camera approach: 0.00 → 0.68 (then holds near-still)
  const approachProgress = clamp01(progress / 0.68);
  const eased = easeInOutQuart(approachProgress);

  // Z: 12 → ~3.3 with dramatic deceleration
  const z = lerp(12.0, 3.3, eased);

  // Y: +0.3 → slight dip to -0.2 → settle at -0.15
  let y: number;
  if (approachProgress < 0.5) {
    y = lerp(0.3, -0.2, easeOutQuad(approachProgress * 2));
  } else {
    y = lerp(-0.2, -0.15, (approachProgress - 0.5) * 2);
  }

  // X: 0 → -0.15 → +0.1 → 0 (subtle lateral drift)
  let x: number;
  if (approachProgress < 0.33) {
    x = lerp(0, -0.15, approachProgress / 0.33);
  } else if (approachProgress < 0.66) {
    x = lerp(-0.15, 0.1, (approachProgress - 0.33) / 0.33);
  } else {
    x = lerp(0.1, 0, (approachProgress - 0.66) / 0.34);
  }

  // FOV: 45 → 37 (subtle perspective compression)
  const fov = lerp(45, 37, eased);

  return { z, y, x, fov };
}

// ---------------------------------------------------------------------------
// Orbital element configuration
// ---------------------------------------------------------------------------
interface OrbitState {
  radius: number;
  speed: number;
  tiltDelta: number;
  opacity: number;
}

function getOrbitState(progress: number): OrbitState {
  if (progress > 0.72) return { radius: 10, speed: 0, tiltDelta: 0.45, opacity: 0 };

  const t = clamp01(progress / 0.72);
  return {
    radius: lerp(3.5, 9.0, easeOutQuad(t)),
    speed: lerp(0.012, 0.001, t),
    tiltDelta: lerp(0, 0.45, t),     // radians additional tilt outward
    opacity: lerp(0.7, 0, easeOutQuad(t)),
  };
}

// ---------------------------------------------------------------------------
// Sphere fracture shader
// ---------------------------------------------------------------------------
const NUCLEUS_VERTEX = `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
    vViewPosition = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

const NUCLEUS_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uTime;
  uniform float uGlowIntensity;
  uniform float uFresnelPower;
  uniform float uOpacity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewPosition), 0.0), uFresnelPower);
    float breathe = 0.8 + 0.2 * sin(uTime * 2.0);
    vec3 glow = uGlowColor * fresnel * breathe * uGlowIntensity;
    float alpha = 0.7 * uOpacity;
    gl_FragColor = vec4(uColor + glow, alpha);
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function SphereScene() {
  const { subscribe, reducedMotion } = useHomeScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const sceneStateRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    core: THREE.Mesh;
    coreMaterial: THREE.ShaderMaterial;
    mainGroup: THREE.Group;
    electrons: {
      mesh: THREE.Mesh;
      group: THREE.Group;
      orbitLine: THREE.Line;
      data: { angle: number; baseInclination: number };
    }[];
    animationId: number;
    isActive: boolean;
    targetRotationX: number;
    targetRotationY: number;
    currentRotationX: number;
    currentRotationY: number;
  } | null>(null);

  // Get sphere screen-space data for particle field
  const getSphereScreenData = useCallback(() => {
    const state = sceneStateRef.current;
    if (!state) return null;

    const { camera, core } = state;
    const worldPos = new THREE.Vector3();
    core.getWorldPosition(worldPos);

    // Project sphere center to screen
    const projected = worldPos.clone().project(camera);
    const w = window.innerWidth;
    const h = window.innerHeight;
    const screenX = (projected.x * 0.5 + 0.5) * w;
    const screenY = (-projected.y * 0.5 + 0.5) * h;

    // Estimate screen radius from camera distance
    const dist = camera.position.distanceTo(worldPos);
    const fovRad = (camera.fov * Math.PI) / 180;
    const screenRadius = (2.0 / (2 * dist * Math.tan(fovRad / 2))) * h;

    return { screenX, screenY, screenRadius };
  }, []);

  // Expose sphere data to particle field via a custom event
  useEffect(() => {
    const handler = () => {
      const data = getSphereScreenData();
      if (data) {
        window.dispatchEvent(
          new CustomEvent('sphere-screen-data', { detail: data })
        );
      }
    };
    window.addEventListener('request-sphere-data', handler);
    return () => window.removeEventListener('request-sphere-data', handler);
  }, [getSphereScreenData]);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    // --- Scene setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0.3, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // --- Core sphere ---
    const coreGeometry = new THREE.SphereGeometry(2.0, 64, 64);
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(0x050005) },
        uGlowColor: { value: new THREE.Color(0xa020f0) },
        uTime: { value: 0 },
        uGlowIntensity: { value: 1.0 },
        uFresnelPower: { value: 3.0 },
        uOpacity: { value: 1.0 },
      },
      vertexShader: NUCLEUS_VERTEX,
      fragmentShader: NUCLEUS_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    mainGroup.add(core);

    // --- Orbital electrons ---
    const numElectrons = 3;
    const baseInclinations = [Math.PI / 4, -Math.PI / 6, Math.PI / 2.5];
    const electrons: typeof sceneStateRef.current extends null
      ? never
      : NonNullable<typeof sceneStateRef.current>['electrons'] = [];

    for (let i = 0; i < numElectrons; i++) {
      const orbitGroup = new THREE.Group();

      // Orbit line
      const curve = new THREE.EllipseCurve(0, 0, 3.5, 3.5, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0xff1493,
        transparent: true,
        opacity: 0.15,
      });
      const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      orbitLine.rotation.x = Math.PI / 2;

      // Electron
      const electronGeom = new THREE.SphereGeometry(0.18, 32, 32);
      const electronMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.7,
      });
      const electron = new THREE.Mesh(electronGeom, electronMat);

      orbitGroup.rotation.z = baseInclinations[i];
      orbitGroup.add(orbitLine);
      orbitGroup.add(electron);
      mainGroup.add(orbitGroup);

      electrons.push({
        mesh: electron,
        group: orbitGroup,
        orbitLine,
        data: {
          angle: (i * Math.PI * 2) / 3,
          baseInclination: baseInclinations[i],
        },
      });
    }

    // --- State ---
    const state: NonNullable<typeof sceneStateRef.current> = {
      scene,
      camera,
      renderer,
      core,
      coreMaterial,
      mainGroup,
      electrons,
      animationId: 0,
      isActive: true,
      targetRotationX: 0,
      targetRotationY: 0,
      currentRotationX: 0,
      currentRotationY: 0,
    };
    sceneStateRef.current = state;

    // --- Mouse interaction ---
    let resetTimer: ReturnType<typeof setTimeout>;
    const onMouseMove = (e: MouseEvent) => {
      clearTimeout(resetTimer);
      state.targetRotationY = ((e.clientX / window.innerWidth) - 0.5) * Math.PI * 0.5;
      state.targetRotationX = ((e.clientY / window.innerHeight) - 0.5) * Math.PI * 0.3;
      resetTimer = setTimeout(() => {
        state.targetRotationX = 0;
        state.targetRotationY = 0;
      }, 2500);
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // --- Resize ---
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // --- Scroll subscription ---
    const unsub = subscribe((p: number) => {
      progressRef.current = p;

      // Reactivate rendering on reverse scroll
      if (p < 0.72 && !state.isActive) {
        state.isActive = true;
        animate();
      }
    });

    // --- Animation loop ---
    function animate() {
      if (!state.isActive) return;
      state.animationId = requestAnimationFrame(animate);

      const progress = progressRef.current;
      const time = Date.now() * 0.001;

      // --- Camera choreography ---
      const cam = getCameraState(progress);
      camera.position.set(cam.x, cam.y, cam.z);
      if (Math.abs(camera.fov - cam.fov) > 0.1) {
        camera.fov = cam.fov;
        camera.updateProjectionMatrix();
      }
      camera.lookAt(0, 0, 0);

      // --- Mouse-driven subtle rotation ---
      state.currentRotationX += (state.targetRotationX - state.currentRotationX) * 0.008;
      state.currentRotationY += (state.targetRotationY - state.currentRotationY) * 0.008;
      mainGroup.rotation.x = state.currentRotationX;
      mainGroup.rotation.y = state.currentRotationY;

      // --- Core rotation and shader ---
      core.rotation.y += 0.008;
      coreMaterial.uniforms.uTime.value = time;

      // Glow intensification during hold (0.55–0.68), then dim
      let glowIntensity: number;
      let fresnelPower: number;
      if (progress < 0.55) {
        glowIntensity = 1.0;
        fresnelPower = 3.0;
      } else if (progress < 0.68) {
        const holdT = rangeProgress(progress, 0.55, 0.68);
        glowIntensity = lerp(1.0, 1.8, holdT);
        fresnelPower = lerp(3.0, 2.2, holdT); // lower power = wider glow
      } else {
        glowIntensity = lerp(1.8, 0.5, rangeProgress(progress, 0.68, 0.74));
        fresnelPower = 2.2;
      }
      coreMaterial.uniforms.uGlowIntensity.value = glowIntensity;
      coreMaterial.uniforms.uFresnelPower.value = fresnelPower;

      // --- Sphere opacity fade: coordinate with pixel transition ---
      // Pixels start appearing at ~0.64, sphere fades 0.66→0.72
      const sphereFade = 1 - rangeProgress(progress, 0.66, 0.72);
      coreMaterial.uniforms.uOpacity.value = sphereFade;

      // --- Orbital elements ---
      const orbit = getOrbitState(progress);

      electrons.forEach((e) => {
        // Update angle
        e.data.angle += orbit.speed;

        // Position electron at current orbit radius
        e.mesh.position.set(
          Math.cos(e.data.angle) * orbit.radius,
          0,
          Math.sin(e.data.angle) * orbit.radius
        );

        // Tilt orbital plane outward
        e.group.rotation.z = e.data.baseInclination + orbit.tiltDelta;

        // Opacity
        (e.mesh.material as THREE.MeshBasicMaterial).opacity = orbit.opacity;

        // Orbit line: update radius and opacity
        const orbitLineMat = e.orbitLine.material as THREE.LineBasicMaterial;
        orbitLineMat.opacity = orbit.opacity * 0.2;

        // Regenerate orbit line geometry at new radius
        if (Math.abs(orbit.radius - 3.5) > 0.1) {
          const curve = new THREE.EllipseCurve(
            0, 0, orbit.radius, orbit.radius, 0, 2 * Math.PI, false, 0
          );
          const points = curve.getPoints(120);
          e.orbitLine.geometry.dispose();
          e.orbitLine.geometry = new THREE.BufferGeometry().setFromPoints(points);
        }
      });

      // --- Render to screen ---
      renderer.render(scene, camera);

      // --- Pause when sphere is fully faded (performance) ---
      if (progress > 0.74) {
        state.isActive = false;
      }
    }

    animate();

    // --- Cleanup (component unmount only — NOT during scroll) ---
    return () => {
      state.isActive = false;
      cancelAnimationFrame(state.animationId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      clearTimeout(resetTimer);
      unsub();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      electrons.forEach((e) => {
        e.mesh.geometry.dispose();
        (e.mesh.material as THREE.Material).dispose();
        e.orbitLine.geometry.dispose();
        (e.orbitLine.material as THREE.Material).dispose();
      });
    };
  }, [subscribe, reducedMotion, getSphereScreenData]);

  return <div ref={containerRef} className={styles.threeCanvas} />;
}
