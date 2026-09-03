'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useScrollContext } from './ScrollController';
import { PhysicsEngine } from '../lib/physics';
import { getSphereConfig } from '../lib/sphereConfig';
import styles from '../selection.module.css';

export default function PhysicsBackground() {
  const { subscribe, reducedMotion } = useScrollContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<PhysicsEngine | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const progressRef = useRef(0);

  // Draw a single sphere with pastel radial gradient + soft shadow
  const drawSphere = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      opacity: number,
      highlightColor: string,
      baseColor: string
    ) => {
      ctx.save();
      ctx.globalAlpha = opacity;

      // Soft glow / shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
      ctx.shadowBlur = radius * 0.4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = radius * 0.15;

      // Radial gradient — highlight offset to top-left
      const gradient = ctx.createRadialGradient(
        x - radius * 0.2,
        y - radius * 0.2,
        radius * 0.05,
        x,
        y,
        radius
      );
      gradient.addColorStop(0, highlightColor);
      gradient.addColorStop(0.6, 'rgba(240, 241, 241, 0.5)');
      gradient.addColorStop(1, baseColor);

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // HiDPI support
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (engineRef.current) {
        engineRef.current.setBounds(w, h);
      }
    };

    // Init engine
    const w = window.innerWidth;
    const h = window.innerHeight;
    const engine = new PhysicsEngine();
    const config = getSphereConfig(w);
    engine.init(config, w, h);
    engineRef.current = engine;

    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };
    // Touch tracking
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };
    const handleTouchEnd = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    window.addEventListener('mousemove', handleMouse);
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Subscribe to scroll progress
    const unsub = subscribe((p: number) => {
      progressRef.current = p;
    });

    if (reducedMotion) {
      // Static render at final positions
      engine.setScrollProgress(1);
      engine.step();
      const rw = window.innerWidth;
      const rh = window.innerHeight;
      ctx.clearRect(0, 0, rw, rh);
      for (const s of engine.spheres) {
        drawSphere(ctx, s.x, s.y, s.radius, s.opacity, s.highlightColor, s.baseColor);
      }
      return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', handleMouse);
        document.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('touchmove', handleTouch);
        window.removeEventListener('touchend', handleTouchEnd);
        unsub();
      };
    }

    // Animation loop
    const loop = () => {
      const eng = engineRef.current;
      if (!eng) return;

      eng.setScrollProgress(progressRef.current);
      eng.setCursorPosition(mouseRef.current.x, mouseRef.current.y);
      eng.step();

      const cw = window.innerWidth;
      const ch = window.innerHeight;
      ctx.clearRect(0, 0, cw, ch);
      for (const s of eng.spheres) {
        drawSphere(ctx, s.x, s.y, s.radius, s.opacity, s.highlightColor, s.baseColor);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('touchend', handleTouchEnd);
      unsub();
    };
  }, [subscribe, reducedMotion, drawSphere]);

  return (
    <canvas
      ref={canvasRef}
      className={styles.physicsCanvas}
      aria-hidden="true"
    />
  );
}
