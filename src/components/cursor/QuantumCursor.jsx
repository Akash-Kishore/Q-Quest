import React, { useEffect, useRef, useState } from 'react';

export default function QuantumCursor() {
  const orbRef = useRef(null);
  const trailsRef = useRef([]);
  const crosshairRef = useRef(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [isHoveringGate, setIsHoveringGate] = useState(false);

  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const trailPos = useRef(Array.from({ length: 12 }, () => ({ x: window.innerWidth / 2, y: window.innerHeight / 2 })));
  
  useEffect(() => {
    document.documentElement.style.cursor = 'none';
    const activeTargets = new Set();
    
    let isTouch = false;
    const handleTouch = () => { isTouch = true; };
    window.addEventListener('touchstart', handleTouch, { passive: true });

    const handleMouseMove = (e) => {
      if (isTouch) return;
      const chips = document.querySelectorAll('[data-gate-chip="true"]');
      let foundHover = false;
      let targetX = e.clientX;
      let targetY = e.clientY;

      chips.forEach(chip => {
        const rect = chip.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        if (dx * dx + dy * dy < 3600) { // 60px radius
          foundHover = true;
          targetX += (cx - targetX) * 0.12;
          targetY += (cy - targetY) * 0.12;
        }
      });

      setIsHoveringGate(foundHover);
      pos.current.x = targetX;
      pos.current.y = targetY;
    };

    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('dragend', handleDragEnd);

    let frame;
    const animate = () => {
      if (isTouch) return;
      
      const tp = trailPos.current;
      tp.pop();
      tp.unshift({ x: pos.current.x, y: pos.current.y });

      if (orbRef.current) {
        orbRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) scale(${isDragging ? 1.5 : isHoveringGate ? 1.5 : 1}) translate(-50%, -50%)`;
        if (isHoveringGate) {
           orbRef.current.style.backgroundColor = '#7C3AED';
        } else {
           orbRef.current.style.backgroundColor = '#00D4FF';
        }
      }

      if (crosshairRef.current) {
        crosshairRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      trailsRef.current.forEach((t, i) => {
        if (t) t.style.transform = `translate(${tp[i].x}px, ${tp[i].y}px) translate(-50%, -50%)`;
      });

      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);

    return () => {
      document.documentElement.style.cursor = 'auto';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('touchstart', handleTouch);
      cancelAnimationFrame(frame);
    };
  }, [isDragging, isHoveringGate]);

  return (
    <>
      <div 
        ref={orbRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: '16px', height: '16px', borderRadius: '50%',
          backgroundColor: '#00D4FF', filter: 'blur(4px)', mixBlendMode: 'screen',
          zIndex: 9999, pointerEvents: 'none', transition: 'background-color 200ms, transform 100ms'
        }}
      />
      
      {isDragging && (
        <div 
          ref={crosshairRef}
          style={{
            position: 'fixed', top: 0, left: 0, width: '28px', height: '28px', borderRadius: '50%',
            border: '1px solid rgba(0, 212, 255, 0.6)', zIndex: 9999, pointerEvents: 'none'
          }}
        />
      )}

      {Array.from({ length: 12 }).map((_, i) => {
        const size = 8 - (i * (6 / 11));
        const opacity = 0.6 - (i * (0.55 / 11));
        return (
          <div
            key={i}
            ref={el => trailsRef.current[i] = el}
            style={{
              position: 'fixed', top: 0, left: 0, width: `${size}px`, height: `${size}px`, borderRadius: '50%',
              backgroundColor: '#00D4FF', opacity, zIndex: 9998, pointerEvents: 'none', filter: 'blur(1px)'
            }}
          />
        );
      })}
    </>
  );
}
