'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    // Cleanup any existing child nodes first
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    const mainRotationGroup = new THREE.Group();
    scene.add(mainRotationGroup);

    const nucleusShader = {
      uniforms: {
        "uColor": { value: new THREE.Color(0x050005) },
        "uGlowColor": { value: new THREE.Color(0xA020F0) },
        "uTime": { value: 0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vViewPosition = normalize(cameraPosition - worldPosition.xyz);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        uniform vec3 uGlowColor;
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPosition;
        void main() {
            float fresnel = pow(1.0 - max(dot(vNormal, vViewPosition), 0.0), 3.0);
            vec3 glow = uGlowColor * fresnel * (0.8 + 0.2 * sin(uTime * 2.0));
            gl_FragColor = vec4(uColor + glow, 0.7);
        }
      `
    };

    const coreRadius = 2.0;
    const coreGeometry = new THREE.SphereGeometry(coreRadius, 64, 64);
    const coreMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(nucleusShader.uniforms),
      vertexShader: nucleusShader.vertexShader,
      fragmentShader: nucleusShader.fragmentShader,
      transparent: true,
      depthWrite: false
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    mainRotationGroup.add(core);

    interface OrbitData {
      angle: number;
      radiusX: number;
      radiusZ: number;
      speed: number;
    }

    const electrons: Array<{ mesh: THREE.Mesh; data: OrbitData }> = [];
    const numElectrons = 3; 
    const uniformRadius = 3.5;
    const inclinations = [Math.PI / 4, -Math.PI / 6, Math.PI / 2.5];

    for(let i = 0; i < numElectrons; i++) {
      const orbitGroup = new THREE.Group();
      const curve = new THREE.EllipseCurve(0, 0, uniformRadius, uniformRadius, 0, 2 * Math.PI, false, 0);
      const points = curve.getPoints(120);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({ color: 0xFF1493, transparent: true, opacity: 0.15 });
      const ellipse = new THREE.Line(geometry, material);
      ellipse.rotation.x = Math.PI / 2;
      
      const electronGeom = new THREE.SphereGeometry(0.18, 32, 32);
      const electronMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 });
      const electron = new THREE.Mesh(electronGeom, electronMat);
      
      const orbitData = { radiusX: uniformRadius, radiusZ: uniformRadius, speed: 0.012, angle: (i * (Math.PI * 2 / 3)) };
      orbitGroup.rotation.z = inclinations[i];
      orbitGroup.add(ellipse);
      orbitGroup.add(electron);
      electrons.push({ mesh: electron, data: orbitData });
      mainRotationGroup.add(orbitGroup);
    }

    let targetRotationX = 0;
    let targetRotationY = 0;
    let currentRotationX = 0;
    let currentRotationY = 0;
    let resetTimer: ReturnType<typeof setTimeout> | undefined;

    const handleMouseMove = (e: MouseEvent) => {
      if (resetTimer) clearTimeout(resetTimer);
      targetRotationY = ((e.clientX / window.innerWidth) - 0.5) * Math.PI;
      targetRotationX = ((e.clientY / window.innerHeight) - 0.5) * Math.PI;
      
      resetTimer = setTimeout(() => {
        targetRotationX = 0;
        targetRotationY = 0;
      }, 2000);
    };

    window.addEventListener('mousemove', handleMouseMove);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const time = Date.now() * 0.001;
      
      currentRotationX += (targetRotationX - currentRotationX) * 0.008;
      currentRotationY += (targetRotationY - currentRotationY) * 0.008;
      mainRotationGroup.rotation.x = currentRotationX;
      mainRotationGroup.rotation.y = currentRotationY;
      
      core.rotation.y += 0.01; 
      core.material.uniforms.uTime.value = time;

      electrons.forEach((e) => {
        e.data.angle += e.data.speed;
        e.mesh.position.set(
          Math.cos(e.data.angle) * e.data.radiusX, 
          0, 
          Math.sin(e.data.angle) * e.data.radiusZ
        );
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (resetTimer) clearTimeout(resetTimer);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      mount.innerHTML = '';
    };
  }, []);

  return (
    <div 
      ref={mountRef} 
      style={{ position: 'fixed', inset: 0, zIndex: 10, pointerEvents: 'none' }}
    />
  );
}
