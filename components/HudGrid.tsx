'use client';

import { useEffect, useRef } from 'react';
import styles from './HudGrid.module.css';

export default function HudGrid() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const totalSlots = 12 * 8;
    const occupied = new Set<number>();
    
    // Clear any existing modules (React strict mode effect cleanup)
    container.innerHTML = '';
    
    function createModule(size: 'small' | 'large' = 'small') {
      const mod = document.createElement('div');
      mod.className = styles.hudModule;
      
      if (size === 'large') mod.classList.add(styles.large);
      if (Math.random() > 0.8) mod.classList.add(styles.accent);
      
      const label = document.createElement('div');
      label.className = styles.hudModuleInner;
      label.textContent = Math.random() > 0.5 
        ? 'MOD_' + Math.floor(Math.random() * 99) 
        : '0x' + Math.floor(Math.random() * 256).toString(16).toUpperCase();
        
      mod.appendChild(label);
      return mod;
    }

    for (let i = 0; i < totalSlots; i++) {
      if (occupied.has(i)) continue;
      
      const row = Math.floor(i / 12);
      const col = i % 12;
      
      if (col < 11 && row < 7 && Math.random() > 0.85) {
        container.appendChild(createModule('large'));
        occupied.add(i);
        occupied.add(i + 1);
        occupied.add(i + 12);
        occupied.add(i + 13);
      } else {
        container.appendChild(createModule('small'));
        occupied.add(i);
      }
    }

    const interval = setInterval(() => {
      const modules = container.querySelectorAll(`.${styles.hudModule}`) as NodeListOf<HTMLElement>;
      if (modules.length === 0) return;
      
      const randomIdx = Math.floor(Math.random() * modules.length);
      const mod = modules[randomIdx];
      
      if (mod) {
        mod.style.background = 'rgba(255, 255, 255, 0.05)';
        mod.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        setTimeout(() => { 
          if(mod) {
            mod.style.background = 'rgba(255, 255, 255, 0.01)';
            mod.style.borderColor = '';
          }
        }, 800);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const moveX = (e.clientX / window.innerWidth - 0.5) * 20;
      const moveY = (e.clientY / window.innerHeight - 0.5) * 20;
      containerRef.current.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={styles.hudGridContainer} ref={containerRef}></div>
  );
}
