'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';
import { motion } from 'framer-motion';

export default function TitlePage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Generate the modular HUD grid with varying sizes
    const hudContainer = document.getElementById('hud-grid-container');
    if (!hudContainer) return;
    
    const totalSlots = 12 * 8;
    const occupied = new Set();

    function createModule(size = 'small') {
        const mod = document.createElement('div');
        mod.className = 'hud-module';
        if (size === 'large') mod.classList.add('large');
        if (Math.random() > 0.8) mod.classList.add('accent');
        
        const label = document.createElement('div');
        label.className = 'hud-module-inner';
        label.textContent = Math.random() > 0.5 ? 'MOD_' + Math.floor(Math.random()*99) : '0x' + Math.floor(Math.random()*256).toString(16).toUpperCase();
        mod.appendChild(label);
        
        return mod;
    }

    // Attempt a smarter fill for large modules
    for (let i = 0; i < totalSlots; i++) {
        if (occupied.has(i)) continue;
        
        const row = Math.floor(i / 12);
        const col = i % 12;
        
        // Chance for a large module (2x2)
        if (col < 11 && row < 7 && Math.random() > 0.85) {
            hudContainer.appendChild(createModule('large'));
            occupied.add(i);
            occupied.add(i + 1);
            occupied.add(i + 12);
            occupied.add(i + 13);
        } else {
            hudContainer.appendChild(createModule('small'));
            occupied.add(i);
        }
    }

    const cursor = document.getElementById('cursor');
    let resetTimer: NodeJS.Timeout;
    
    let targetRotationX = 0;
    let targetRotationY = 0;
    
    function resetOrientation() {
        targetRotationX = 0;
        targetRotationY = 0;
    }

    const onMouseMove = (e: MouseEvent) => {
        if (cursor) {
            cursor.style.transform = `translate3d(${e.clientX - 10}px, ${e.clientY - 10}px, 0)`;
        }
        
        // Slight parallax on HUD grid
        const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
        const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
        if (hudContainer) {
            hudContainer.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
        }

        // Inactivity reset logic
        clearTimeout(resetTimer);
        targetRotationY = ((e.clientX / window.innerWidth) - 0.5) * Math.PI;
        targetRotationX = ((e.clientY / window.innerHeight) - 0.5) * Math.PI;
        
        resetTimer = setTimeout(resetOrientation, 2000);
    };

    document.addEventListener('mousemove', onMouseMove);

    // THREE.js Scene Setup
    const container = containerRef.current;
    if (!container) return;
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 12;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

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

    const electrons: { mesh: THREE.Mesh; group: THREE.Group; data: any }[] = [];
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
        electrons.push({ mesh: electron, group: orbitGroup, data: orbitData });
        mainRotationGroup.add(orbitGroup);
    }

    let currentRotationX = 0, currentRotationY = 0;
    let animationId: number;

    function animate() {
        animationId = requestAnimationFrame(animate);
        const time = Date.now() * 0.001;
        currentRotationX += (targetRotationX - currentRotationX) * 0.008;
        currentRotationY += (targetRotationY - currentRotationY) * 0.008;
        mainRotationGroup.rotation.x = currentRotationX;
        mainRotationGroup.rotation.y = currentRotationY;
        core.rotation.y += 0.01; 
        coreMaterial.uniforms.uTime.value = time;

        electrons.forEach((e) => {
            e.data.angle += e.data.speed;
            e.mesh.position.set(Math.cos(e.data.angle) * e.data.radiusX, 0, Math.sin(e.data.angle) * e.data.radiusZ);
        });

        renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    // Pulse random modules for "Technical HUD" activity
    const pulseInterval = setInterval(() => {
        const modules = document.querySelectorAll('.hud-module');
        const randomIdx = Math.floor(Math.random() * modules.length);
        if(modules[randomIdx]) {
            const m = modules[randomIdx] as HTMLElement;
            m.style.background = 'rgba(255, 255, 255, 0.05)';
            m.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            setTimeout(() => { 
                if(m) {
                    m.style.background = 'rgba(255, 255, 255, 0.01)';
                    m.style.borderColor = '';
                }
            }, 800);
        }
    }, 400);

    // Wheel listener to advance to selection screen
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY > 50) {
        router.push('/selection');
      }
    };
    document.addEventListener('wheel', handleWheel);

    return () => {
        document.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('wheel', handleWheel);
        cancelAnimationFrame(animationId);
        clearInterval(pulseInterval);
        clearTimeout(resetTimer);
        
        // Clean up threejs
        if (container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
        }
        renderer.dispose();
    };
  }, [router]);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        body {
            background: #050005;
            overflow: hidden;
            margin: 0;
            cursor: none;
            color: #ffffff;
            font-family: 'Space Grotesk', sans-serif;
            width: 100vw;
            height: 100vh;
        }

        /* Space Background Elements */
        .space-void {
            position: fixed; inset: 0;
            background: 
                radial-gradient(circle at 20% 30%, rgba(160, 32, 240, 0.35) 0%, transparent 60%),
                radial-gradient(circle at 80% 70%, rgba(255, 20, 147, 0.35) 0%, transparent 60%),
                #080008;
            z-index: 0;
        }

        .star-field {
            position: absolute; inset: 0;
            background-image: 
                radial-gradient(1px 1px at 25% 35%, #fff 100%, transparent),
                radial-gradient(1px 1px at 50% 10%, #fff 100%, transparent),
                radial-gradient(1px 1px at 10% 80%, #fff 100%, transparent),
                radial-gradient(1.5px 1.5px at 85% 45%, rgba(255, 20, 147, 0.8) 100%, transparent),
                radial-gradient(1.5px 1.5px at 15% 15%, rgba(160, 32, 240, 0.8) 100%, transparent),
                radial-gradient(2px 2px at 70% 90%, #fff 100%, transparent);
            background-size: 400px 400px;
            opacity: 0.4;
            z-index: 1;
        }

        .nebula {
            position: absolute; inset: 0;
            background: 
                radial-gradient(ellipse at 50% 50%, rgba(160, 32, 240, 0.3) 0%, transparent 70%),
                radial-gradient(ellipse at 30% 20%, rgba(255, 20, 147, 0.25) 0%, transparent 50%);
            filter: blur(60px);
            z-index: 2;
        }

        .scene {
            position: relative;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            z-index: 5;
        }

        /* Background Content for Refraction */
        #content-to-refract {
            position: fixed; inset: 0;
            pointer-events: none;
            z-index: 3;
        }

        /* New Modular HUD Grid Style */
        .hud-grid-container {
            position: absolute; inset: 0;
            padding: 40px;
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            grid-template-rows: repeat(8, 1fr);
            gap: 1px;
            opacity: 0.25;
        }

        .hud-module {
            border: 0.5px solid rgba(255, 255, 255, 0.1);
            position: relative;
            background: rgba(255, 255, 255, 0.01);
            transition: all 0.5s ease;
            overflow: hidden;
        }

        .hud-module::before {
            content: "";
            position: absolute;
            inset: 4px;
            border: 0.5px solid rgba(160, 32, 240, 0.05);
            pointer-events: none;
        }

        .hud-module.large {
            grid-column: span 2;
            grid-row: span 2;
            border: 1px solid rgba(191, 0, 255, 0.2);
        }

        .hud-module.accent {
            border-color: rgba(255, 20, 147, 0.3);
        }

        .hud-module-inner {
            position: absolute;
            top: 2px;
            left: 2px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 6px;
            color: rgba(255, 255, 255, 0.2);
            text-transform: uppercase;
        }

        /* Layer 3: Typography Anchor (Behind Glass) */
        .hero-title-container {
            position: absolute; inset: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
        }

        .hero-letter {
            font-family: 'Epilogue', sans-serif;
            font-size: 18vw;
            font-weight: 900;
            letter-spacing: -0.06em;
            color: rgba(255, 255, 255, 0.9);
            line-height: 1;
        }

        /* 3D Canvas Container */
        #canvas-container {
            position: fixed; inset: 0;
            z-index: 10;
        }

        .vignette {
            position: fixed; inset: 0;
            background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.6) 100%);
            z-index: 5;
            pointer-events: none;
        }

        .brutalist-btn {
            background: #fff;
            color: #000;
            padding: 4px 12px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            text-transform: uppercase;
            border: none;
            border-radius: 0;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        .brutalist-btn:hover {
            background: #FF1493;
            color: #fff;
        }

        ::-webkit-scrollbar { display: none; }
      `}} />
      <div onClick={() => router.push('/selection')} className="w-full h-full cursor-pointer">
        {/* Static Background Elements */}
        <div className="space-void"></div>
        <div className="star-field"></div>
        <div className="nebula"></div>
        <div className="vignette"></div>
        
        {/* Fading Content */}
        <motion.div 
            initial={{ opacity: 0, filter: 'blur(10px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            id="content-to-refract">
          <div className="hud-grid-container" id="hud-grid-container"></div>
          <div className="hero-title-container">
            <span className="hero-letter">Q</span><span className="hero-letter">_</span><span className="hero-letter">Q</span><span className="hero-letter">U</span><span className="hero-letter">E</span><span className="hero-letter">S</span><span className="hero-letter">T</span>
          </div>
        </motion.div>

        {/* 3D Layer */}
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
            id="canvas-container" ref={containerRef}>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.6 }}
            className="scene">
          {/* Technical Overlays */}
          <div className="fixed top-8 left-12 font-mono text-[10px] text-white/40 tracking-[0.4em] pointer-events-none z-30">
            MODULAR_SPACE_GRID // GRAPH_HUD_V2
          </div>
          <div className="fixed top-8 right-12 font-mono text-[10px] text-white/40 tracking-[0.4em] pointer-events-none z-30">
            REFRACTION_INDEX: 1.62_FLINT_GLASS
          </div>
          <div className="fixed bottom-8 left-12 font-mono text-[10px] text-white/40 tracking-[0.4em] pointer-events-none z-30">
            DEEP_SPACE_PULSE: 0xFF
          </div>
          {/* Interaction Layer for Cursor */}
          <div className="fixed inset-0 z-50 pointer-events-none" id="interaction-layer">
            <div className="w-5 h-5 bg-white/30 rounded-full fixed top-0 left-0 pointer-events-none transition-transform duration-75 ease-out z-[1000]" id="cursor"></div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
