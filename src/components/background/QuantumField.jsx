import React, { useRef, useEffect } from 'react';
import { useQuantumStore } from '../../store/quantumStore.js';

const PARTICLE_COUNT = 120;
const CONNECTION_DIST = 120;

export default function QuantumField() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const frameRef = useRef(null);

  const stateComplexity = useQuantumStore(s => s.stateComplexity);
  const isEntangled = useQuantumStore(s => s.isEntangled);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 0.8 + Math.random() * 1.0,
      opacity: 0.2 + Math.random() * 0.4,
      hue: 180 + Math.random() * 100
    }));

    const drawWireframe = (W, H) => {
      const cx = W * 0.75;
      const cy = H * 0.5;
      const r = Math.min(W, H) * 0.22;
      
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.025)';
      ctx.lineWidth = 0.5;
      
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r, 0, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 0.3, 0, 0, 2 * Math.PI);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(cx, cy, r * 0.3, r, 0, 0, 2 * Math.PI);
      ctx.stroke();
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 11, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const W = canvas.width;
      const H = canvas.height;

      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.02;
        p.vy += (Math.random() - 0.5) * 0.02;

        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.5) {
          p.vx = (p.vx / speed) * 0.5;
          p.vy = (p.vy / speed) * 0.5;
        }

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < CONNECTION_DIST * CONNECTION_DIST) {
            const dist = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${(1 - dist / CONNECTION_DIST) * 0.12})`;
            ctx.lineWidth = (1 - dist / CONNECTION_DIST) * 0.8;
            ctx.stroke();
          }
        }
      }

      for (let i = particles.length - 1; i >= PARTICLE_COUNT; i--) {
        particles[i].opacity *= 0.95;
        if (particles[i].opacity < 0.01) {
          particles.splice(i, 1);
        }
      }

      drawWireframe(W, H);
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const unsub = useQuantumStore.subscribe(
      (state) => state.isAnimating,
      (isAnimating, prevIsAnimating) => {
        if (isAnimating && !prevIsAnimating) {
          const bx = Math.random() * canvas.width;
          const by = Math.random() * canvas.height;
          for (let i = 0; i < 20; i++) {
            particlesRef.current.push({
              x: bx, y: by,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              radius: 1.5, opacity: 1, hue: Math.random() > 0.5 ? 180 : 270
            });
          }
        }
      }
    );

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
      unsub();
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      <div style={{
        position: 'absolute', top: '-10%', right: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(124,58,237,1) 0%, rgba(124,58,237,0) 70%)',
        opacity: stateComplexity > 0 ? 0.06 : 0, filter: 'blur(80px)', transition: 'opacity 1.2s ease', mixBlendMode: 'screen'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-10%', width: '40vw', height: '40vw',
        background: 'radial-gradient(circle, rgba(0,212,255,1) 0%, rgba(0,212,255,0) 70%)',
        opacity: isEntangled ? 0.06 : 0, filter: 'blur(80px)', transition: 'opacity 1.2s ease', mixBlendMode: 'screen'
      }} />
      <div style={{
        position: 'absolute', top: '30%', left: '30%', width: '30vw', height: '30vw',
        background: 'radial-gradient(circle, rgba(6,182,212,1) 0%, rgba(6,182,212,0) 70%)',
        opacity: stateComplexity > 4 ? 0.04 : 0, filter: 'blur(80px)', transition: 'opacity 1.2s ease', mixBlendMode: 'screen'
      }} />
    </div>
  );
}
