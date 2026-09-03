'use client';

import { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { useHomeScroll } from './HomeScrollController';
import styles from '../home.module.css';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function rangeProgress(progress: number, start: number, end: number): number {
  return clamp01((progress - start) / (end - start));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// ---------------------------------------------------------------------------
// 2.5D sphere shader — frosted quantum glass
// ---------------------------------------------------------------------------
const SPHERE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vViewDir = normalize(cameraPosition - worldPos.xyz);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const SPHERE_FRAGMENT = `
  precision highp float;
  uniform float uFormProgress;
  uniform float uTime;
  uniform vec3 uBaseColor;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    // Soft Fresnel for glass-like translucent edge
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.5);

    // Radial shading — center lighter, edge darker
    float radial = 1.0 - length(vUv - 0.5) * 1.4;

    // Internal illumination — subtle breathing
    float internal = 0.3 + 0.08 * sin(uTime * 1.5);

    // Translucent alpha
    float alpha = mix(0.05, 0.30, fresnel) * uFormProgress;
    alpha += max(radial, 0.0) * 0.08;

    // Very faint organic noise
    float n = hash(vUv * 127.3);
    alpha += n * 0.015;

    // Subtle refraction illusion — color shift at edges
    vec3 color = uBaseColor + fresnel * vec3(0.15, 0.1, 0.2);
    color += internal * vec3(0.05, 0.03, 0.08);

    gl_FragColor = vec4(color, alpha * uFormProgress);
  }
`;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function AmbientSphere() {
  const { subscribe, reducedMotion } = useHomeScroll();
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    // --- Setup ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(120, 120);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
    camera.position.z = 2.8;

    // Sphere geometry — lightweight
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uFormProgress: { value: 0 },
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(0.82, 0.75, 0.92) }, // soft lavender
      },
      vertexShader: SPHERE_VERTEX,
      fragmentShader: SPHERE_FRAGMENT,
      transparent: true,
      depthWrite: false,
    });

    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    let isActive = true;
    let animationId = 0;

    const unsub = subscribe((p: number) => {
      progressRef.current = p;
    });

    // --- Animation ---
    function animate() {
      if (!isActive) return;
      animationId = requestAnimationFrame(animate);

      const progress = progressRef.current;
      const time = Date.now() * 0.001;

      // Only visible during sphere formation + final state (0.94→1.00)
      if (progress < 0.93) {
        container!.style.visibility = 'hidden';
        container!.style.opacity = '0';
        return;
      }
      container!.style.visibility = 'visible';

      // --- Formation progress (0.94→0.97) ---
      const formProgress = rangeProgress(progress, 0.94, 0.97);
      material.uniforms.uFormProgress.value = formProgress;
      material.uniforms.uTime.value = time;

      // --- Sphere Y position: drop/bounce/levitation ---
      let sphereY = 0;
      const dropT = rangeProgress(progress, 0.97, 0.98);
      const bounce1T = rangeProgress(progress, 0.98, 0.985);
      const bounce2T = rangeProgress(progress, 0.985, 0.99);
      const levitateT = rangeProgress(progress, 0.995, 1.0);

      if (progress < 0.97) {
        // Pre-drop: at assembly position
        sphereY = 0;
      } else if (progress < 0.98) {
        // Drop: cubic ease-in (accelerating downward)
        const eased = dropT * dropT * dropT;
        sphereY = -eased * 0.4; // downward
      } else if (progress < 0.985) {
        // First bounce: ease-out rebound
        const eased = 1 - Math.pow(1 - bounce1T, 2);
        const bounceUp = Math.sin(eased * Math.PI) * 0.15;
        sphereY = -0.4 + bounceUp;
      } else if (progress < 0.99) {
        // Second bounce: smaller
        const eased = 1 - Math.pow(1 - bounce2T, 2);
        const bounceUp = Math.sin(eased * Math.PI) * 0.04;
        sphereY = -0.4 + bounceUp;
      } else if (progress < 0.995) {
        // Settle
        sphereY = -0.4;
      } else {
        // Levitation
        sphereY = -0.4 + levitateT * 0.05 + Math.sin(time * 0.4 * Math.PI * 2) * 0.02;
      }

      sphere.position.y = sphereY;

      // Very slight squash at drop impact (near-imperceptible)
      if (progress >= 0.98 && progress < 0.982) {
        const squash = rangeProgress(progress, 0.98, 0.982);
        const sq = Math.sin(squash * Math.PI);
        sphere.scale.set(1 + sq * 0.03, 1 - sq * 0.03, 1 + sq * 0.03);
      } else {
        sphere.scale.set(1, 1, 1);
      }

      // Fade in opacity on container
      container!.style.opacity = `${Math.min(formProgress, 1)}`;

      renderer.render(scene, camera);
    }

    animate();

    return () => {
      isActive = false;
      cancelAnimationFrame(animationId);
      unsub();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [subscribe, reducedMotion]);

  // Positioned below title area, centered
  return (
    <div
      ref={containerRef}
      className={styles.ambientSphereCanvas}
      style={{
        visibility: 'hidden',
        opacity: 0,
        width: '120px',
        height: '120px',
        bottom: '15%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    />
  );
}
