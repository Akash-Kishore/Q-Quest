'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SelectionPage() {
  const router = useRouter();

  useEffect(() => {
    const spheres = Array.from(document.querySelectorAll('.physics-sphere')) as HTMLElement[];
    
    // Physics variables now work with 1:1 screen coordinates as the container is unscaled
    const params = spheres.map(sphere => {
        const rect = sphere.getBoundingClientRect();
        return {
            el: sphere,
            x: rect.left,
            y: rect.top,
            r: rect.width / 2,
            vx: (Math.random() - 0.5) * 0.002,
            vy: (Math.random() - 0.5) * 0.002,
            mass: rect.width
        };
    });

    let animationId: number;

    function update() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        for (let i = 0; i < params.length; i++) {
            let p = params[i];

            // Apply movement
            p.x += p.vx;
            p.y += p.vy;

            // Boundary collisions
            if (p.x - p.r < 0) { p.x = p.r; p.vx *= -1; }
            if (p.x + p.r > width) { p.x = width - p.r; p.vx *= -1; }
            if (p.y - p.r < 0) { p.y = p.r; p.vy *= -1; }
            if (p.y + p.r > height) { p.y = height - p.r; p.vy *= -1; }

            // Sphere-to-sphere collisions
            for (let j = i + 1; j < params.length; j++) {
                let p2 = params[j];
                let dx = p2.x - p.x;
                let dy = p2.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let minDist = p.r + p2.r;

                if (distance < minDist) {
                    let angle = Math.atan2(dy, dx);
                    let targetX = p.x + Math.cos(angle) * minDist;
                    let targetY = p.y + Math.sin(angle) * minDist;
                    let ax = (targetX - p2.x) * 0.005;
                    let ay = (targetY - p2.y) * 0.005;

                    p.vx -= ax;
                    p.vy -= ay;
                    p2.vx += ax;
                    p2.vy += ay;
                }
            }

            p.el.style.left = '0px';
            p.el.style.top = '0px';
            p.el.style.transform = `translate(${p.x - p.r}px, ${p.y - p.r}px)`;
        }

        animationId = requestAnimationFrame(update);
    }

    update();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .paper-grain {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            opacity: 0.06;
            pointer-events: none;
        }
        .physics-sphere {
            filter: drop-shadow(0 8px 12px rgba(0,0,0,0.08));
            background: radial-gradient(circle at 30% 30%, #ffffff 0%, #f0f1f1 100%);
            position: absolute; 
            will-change: transform;
        }
        .aurora-bg {
            background: linear-gradient(135deg, #ffffff, #ffe0f0, #e8d5ff, #d1f3ff, #ffe9d5, #ffffff);
            background-size: 400% 400%;
            animation: aurora-flow 20s ease infinite;
        }
        @keyframes aurora-flow {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
        }
        /* Custom centering for 75% scale */
        #scale-root {
            transform: scale(0.75);
            transform-origin: center center;
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
      `}} />

      <div className="aurora-bg min-h-screen font-body text-[#2d2f2f] relative overflow-hidden flex items-center justify-center">
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden w-full h-full" id="parallax-container">
          {/* Large Interactive Spheres */}
          <div className="physics-sphere absolute top-[15%] left-[12%] w-48 h-48 rounded-full opacity-40"></div>
          <div className="physics-sphere absolute top-[78%] left-[82%] w-64 h-64 rounded-full opacity-30"></div>
          <div className="physics-sphere absolute top-[45%] left-[5%] w-32 h-32 rounded-full opacity-50"></div>
          <div className="physics-sphere absolute top-[8%] left-[65%] w-40 h-40 rounded-full opacity-20"></div>
          {/* Mid-size Interactive Spheres */}
          <div className="physics-sphere absolute top-[62%] left-[35%] w-20 h-20 rounded-full opacity-40 bg-white"></div>
          <div className="physics-sphere absolute top-[28%] left-[88%] w-16 h-16 rounded-full opacity-60 bg-white"></div>
          {/* Small Cluster Particles */}
          <div className="physics-sphere absolute top-[92%] left-[18%] w-4 h-4 rounded-full opacity-70 bg-white"></div>
          <div className="physics-sphere absolute top-[5%] left-[95%] w-6 h-6 rounded-full opacity-50 bg-white"></div>
          <div className="physics-sphere absolute top-[55%] left-[70%] w-3 h-3 rounded-full opacity-60 bg-white"></div>
          <div className="physics-sphere absolute top-[12%] left-[42%] w-5 h-5 rounded-full opacity-40 bg-white"></div>
          {/* Bottom Clustered Spheres */}
          <div className="physics-sphere absolute top-[85%] left-[8%] w-12 h-12 rounded-full opacity-30 bg-white"></div>
          <div className="physics-sphere absolute top-[75%] left-[52%] w-8 h-8 rounded-full opacity-45 bg-white"></div>
          <div className="physics-sphere absolute top-[90%] left-[75%] w-14 h-14 rounded-full opacity-25 bg-white"></div>
          <div className="physics-sphere absolute top-[82%] left-[45%] w-10 h-10 rounded-full opacity-35 bg-white"></div>
          <div className="physics-sphere absolute top-[95%] left-[25%] w-16 h-16 rounded-full opacity-20 bg-white"></div>
          <div className="physics-sphere absolute top-[68%] left-[92%] w-6 h-6 rounded-full opacity-50 bg-white"></div>
        </div>
        
        {/* Root Wrapper for Scaling and Centering */}
        <div id="scale-root">
          {/* Global Texture Overlay */}
          <div className="fixed inset-0 paper-grain z-[100]"></div>
          
          {/* Main Content Canvas */}
          <div className="relative z-10 w-full flex flex-col items-center justify-center py-12 px-12 pointer-events-auto">
            {/* Header Section */}
            <header className="text-center max-w-4xl mb-12">
              <span className="font-mono text-[#2D1B36] font-bold text-sm tracking-[0.2em] uppercase bg-[#f8cec2] px-4 py-1.5 mb-6 inline-block">System-01 // Laboratory</span>
              <h2 className="text-7xl md:text-9xl font-headline font-bold text-[#2D1B36] tracking-tighter leading-none mb-8">Launch Pad</h2>
              <p className="text-[#5a5c5c] text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto">
                <strong>Ready for your next mission?</strong><br />
                <strong>Build, explore, and unlock the fascinating world of quantum computing.</strong>
              </p>
            </header>
            
            {/* Main Interface Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-[1200px]">
              {/* Card 1: Circuit Playground */}
              <div onClick={() => router.push('/sandbox/circuit')} className="group relative bg-white border-[4px] border-[#2D1B36] rounded-none p-8 flex flex-col h-[520px] shadow-[16px_16px_0px_0px_rgba(45,27,54,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all cursor-pointer">
                <div className="flex-grow flex items-center justify-center overflow-hidden mb-8">
                  <img alt="Circuit Playground" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCpZ25JnRjxUlIXIkrCNwWIxhTIJe2awdiU0bArXjBfmnUjUhN7NTrfMCzmDtTExMRrfI6E9VDX4CtfIkXdMqu1Q4HL1lvLuDGDDkrHdTA3xpZOdaGySBwgmO-IQJuj6ljVSgyfvK4hvGFI5BeH78QQlycrP7t9DEqRBiSkwc3DZxZo6C6x_xmExP-PO2HdhZSW22o963q1XwAO9GFUoDYqEq820rwwaJ2giFVRnuFXZ-jfnALJIyOExLiaS_fnSDUIayNaP9v6ESgU" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2D1B36] bg-[#e3c6ff] px-3 py-1">EXPERIMENTAL-014</span>
                    <span className="material-symbols-outlined text-[#2D1B36] scale-125">bolt</span>
                  </div>
                  <h3 className="text-4xl font-headline font-bold text-[#2D1B36] leading-none">Circuit Playground</h3>
                </div>
              </div>
              
              {/* Card 2: Research Vault */}
              <div onClick={() => router.push('/sandbox/research')} className="group relative bg-white border-[4px] border-[#2D1B36] rounded-none p-8 flex flex-col h-[520px] shadow-[16px_16px_0px_0px_rgba(45,27,54,1)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all cursor-pointer">
                <div className="flex-grow flex items-center justify-center overflow-hidden mb-8">
                  <img alt="Research Vault" className="w-full h-full object-cover mix-blend-multiply opacity-90 group-hover:scale-105 transition-transform duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVdACyLaDxVMWXnb7AlxxJEANtmHWdtVRqAkIRIbm7dlNyxrMHj_Z66g_azl8CrQ0qr0-HcL4hTZXl8fE85bRp6W_SMvFiFC1imGV61g0p_5PnYR9WGrNphln3S9SFKMBWAJ9HBWaSP3ZDB91G8_v-jG9HsM3hxtvUxS3kB0nJJ9zKq7jTQt0-p9M5OJ4rhp_XyzO7uYtqL3aoONUaBd0Di3A-01L3DGm_9c3dlFn9Gd-5V4nXokXHq6-W6tvS1Y4DEDkh2aqkPTHx" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2D1B36] bg-[#f8cec2] px-3 py-1">ARCHIVE-LOG</span>
                    <span className="material-symbols-outlined text-[#2D1B36] scale-125">history_edu</span>
                  </div>
                  <h3 className="text-4xl font-headline font-bold text-[#2D1B36] leading-none">Research Vault</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
