'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function ResearchSandboxPage() {
  const router = useRouter();

  useEffect(() => {
    const cards = Array.from(
      document.querySelectorAll<HTMLElement>('.card-item')
    );
    const prefersStaticCards = window.matchMedia(
      '(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersStaticCards) return;

    const updateCardStates = (activeCard: HTMLElement) => {
      cards.forEach((card) => {
        const isActive = card === activeCard;
        card.style.zIndex = isActive ? '100' : '10';
        card.classList.toggle('card-active', isActive);
      });
    };

    const resetCardTransform = (card: HTMLElement) => {
      card.style.transition =
        'transform 600ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 300ms cubic-bezier(0.19, 1, 0.22, 1)';
      card.style.setProperty('--ry', '0deg');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--mx', '0px');
      card.style.setProperty('--my', '0px');
    };

    const cleanups = cards.map((card) => {
      const handleEnter = () => {
        updateCardStates(card);
        card.style.transition =
          'transform 300ms cubic-bezier(0.19, 1, 0.22, 1), box-shadow 300ms cubic-bezier(0.19, 1, 0.22, 1)';
      };
      const handleMove = (event: MouseEvent) => {
        if (!card.classList.contains('card-active')) return;

        const rect = card.getBoundingClientRect();
        const percentX =
          (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const percentY =
          (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        card.style.transition = 'transform 100ms ease-out, box-shadow 300ms ease-out';
        card.style.setProperty('--ry', `${percentX * 4}deg`);
        card.style.setProperty('--rx', `${-percentY * 4}deg`);
        card.style.setProperty('--mx', `${percentX * 8}px`);
        card.style.setProperty('--my', `${percentY * 8}px`);
      };
      const handleLeave = () => resetCardTransform(card);

      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);

      return () => {
        card.removeEventListener('mouseenter', handleEnter);
        card.removeEventListener('mousemove', handleMove);
        card.removeEventListener('mouseleave', handleLeave);
      };
    });

    const stackContainer = document.querySelector<HTMLElement>('.card-stack');
    const handleStackLeave = () => {
      cards.forEach((card, index) => {
        card.classList.remove('card-active');
        card.style.zIndex = index === 0 ? '20' : '21';
        resetCardTransform(card);
      });
    };
    stackContainer?.addEventListener('mouseleave', handleStackLeave);

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      stackContainer?.removeEventListener('mouseleave', handleStackLeave);
    };
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .aurora-bg {
            position: fixed;
            inset: 0;
            z-index: 0;
            background: linear-gradient(135deg, #f8f9fc 0%, #e8ddff 25%, #ffd8ed 50%, #d1fae5 75%, #e0f2fe 100%);
            background-size: 400% 400%;
            animation: aurora 20s ease infinite;
        }

        @keyframes aurora {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }

        /* 3D Container */
        .card-stack {
            perspective: 1200px;
        }

        /* 2D/3D Plane Interactions */
        .card-item {
            position: absolute;
            will-change: transform, box-shadow;
            transition: transform 300ms cubic-bezier(0.19, 1, 0.22, 1), 
                        box-shadow 300ms cubic-bezier(0.19, 1, 0.22, 1);
            transform: translate(calc(var(--tx, 0) + var(--mx, 0px)), calc(var(--ty, 0) + var(--my, 0px))) 
                       rotate(var(--rz, 0)) 
                       rotateX(var(--rx, 0deg)) 
                       rotateY(var(--ry, 0deg)) 
                       scale(var(--s, 1));
            border-radius: 32px;
            outline: 1px solid transparent; /* Fix for anti-aliasing edges on rotate */
            -webkit-font-smoothing: antialiased;
            transform-style: preserve-3d;
        }

        /* Initial States */
        #card-left {
            --tx: -140px;
            --rz: -12deg;
            --ty: 0px;
            z-index: 20;
            box-shadow: 0 10px 30px -10px rgba(103, 75, 181, 0.15);
        }
        #card-right {
            --tx: 140px;
            --rz: 10deg;
            --ty: 0px;
            z-index: 21; /* Start with one slightly on top to maintain natural stacking */
            box-shadow: 0 10px 30px -10px rgba(45, 27, 54, 0.2);
        }

        /* Active/Hover states */
        .card-active {
            --s: 1.05 !important;
            --ty: -16px !important;
            box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15) !important;
        }

        /* Button refinement */
        .btn-go {
            transition: transform 300ms cubic-bezier(0.19, 1, 0.22, 1), 
                        box-shadow 300ms cubic-bezier(0.19, 1, 0.22, 1);
        }
        .btn-go:hover {
            transform: scale(1.03) translateY(-1px);
        }
        .btn-go .arrow-icon {
            transition: transform 300ms cubic-bezier(0.19, 1, 0.22, 1);
        }
        .btn-go:hover .arrow-icon {
            transform: translateX(4px);
        }

        .paper-grain::before {
            content: "";
            position: absolute;
            inset: 0;
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
            opacity: 0.05;
            pointer-events: none;
            z-index: 5;
            border-radius: inherit;
        }


        @media (max-width: 900px) {
            .sandbox-main {
                padding-top: 5rem !important;
                padding-bottom: 3rem !important;
            }

            .sandbox-heading-block {
                width: 100%;
                margin: 1rem auto 2rem !important;
                padding: 0 0.5rem;
            }

            .sandbox-title {
                max-width: 100%;
                margin-bottom: 1rem !important;
                font-size: clamp(2.25rem, 10vw, 4rem) !important;
                line-height: 1.05 !important;
                white-space: normal !important;
                overflow-wrap: anywhere;
            }

            .card-stack {
                height: auto !important;
                min-height: 0;
                flex-direction: column;
                gap: 1.5rem;
                perspective: none;
            }

            .card-item {
                position: relative !important;
                width: min(100%, 380px) !important;
                height: 500px !important;
                flex: 0 0 auto;
                transform: none !important;
            }

            .card-active {
                --s: 1 !important;
                --ty: 0px !important;
            }
        }

        @media (max-width: 480px) {
            .card-item {
                height: 480px !important;
                border-radius: 24px;
            }

            .card-item > div {
                border-radius: 24px;
            }
        }

        @media (hover: none), (pointer: coarse) {
            .card-item {
                transform: none !important;
            }

            .btn-go:active {
                transform: scale(0.98);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            .aurora-bg {
                animation: none;
            }

            .card-item,
            .btn-go,
            .btn-go .arrow-icon {
                transition: none !important;
                will-change: auto;
            }
        }
      `}} />

      <div className="bg-transparent font-['Inter',_sans-serif] text-[#191c1e] min-h-screen flex flex-col relative overflow-x-hidden">
        <div className="aurora-bg"></div>
        <div className="fixed inset-0 w-full h-full pointer-events-none z-10 overflow-visible" id="threejs-container-ANIMATION_SPHERES">
        </div>
        
        <header className="docked full-width top-0 no-border bg-transparent flat no-shadows z-50 absolute">
          <nav className="flex items-center px-[24px] py-[12px] w-full max-w-7xl mx-auto relative justify-center gap-8">
            <div className="flex-1 flex justify-end lg:justify-start">
              <button
                type="button"
                onClick={() => router.push('/selection')}
                className="cursor-pointer bg-transparent border-0 p-0 font-['Space_Grotesk',_sans-serif] text-[24px] font-bold tracking-tighter text-[#191c1e] whitespace-nowrap"
              >
                Q-QUEST
              </button>
            </div>
            <div className="flex justify-center gap-6"></div>
            <div className="flex-1 flex justify-end"></div>
          </nav>
        </header>
        
        <main className="sandbox-main flex-grow flex flex-col relative pt-24 pb-32 z-20 bg-transparent">
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl flex flex-col items-center justify-center flex-grow">
            <div className="sandbox-heading-block text-center max-w-3xl mx-auto mb-16 mt-8 flex flex-col items-center">
              <h1 className="sandbox-title font-['Space_Grotesk',_sans-serif] text-[64px] font-bold text-[#674bb5] mb-6 whitespace-nowrap tracking-wide drop-shadow-sm leading-[1.1]">Research Vault</h1>
              <p className="font-['Inter',_sans-serif] text-[18px] text-[#494552] max-w-xl mx-auto leading-relaxed text-center font-medium">Your gateway to quantum insights.</p>
            </div>
            
            <div className="card-stack w-full h-[600px] flex items-center justify-center relative">
              {/* Left Card: Circuit Playground */}
              <button
                type="button"
                aria-label="Open Circuit Playground"
                onClick={() => router.push('/sandbox/circuit')}
                className="card-item w-[380px] md:w-[420px] h-[520px] cursor-pointer card-left border-0 bg-transparent p-0 text-left"
                id="card-left"
                style={{ zIndex: 20 }}
              >
                <div className="paper-grain bg-gradient-to-br from-[#e8ddff] to-[#f5d9fe] rounded-[32px] p-2 h-full w-full relative overflow-hidden shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5)]">
                  <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #674bb5 1.5px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  <div className="bg-gradient-to-b from-white/90 to-white/60 backdrop-blur-md rounded-[26px] flex flex-col h-full relative border border-white/50 p-3">
                    
                    <div className="relative w-full h-[240px] rounded-[18px] overflow-hidden border-2 border-white/60 shadow-inner bg-[#cebdff]/30">
                      <Image
                        alt="A whimsical, 3D rendered illustration of a quantum circuit playground"
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 380px, 420px"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBASHDPLYujOMlDStmueCcUpGNv9H7toMMboMrfAoWelv3T1NYrj2flWk1kLibwyYYoxNbj1nD3xrFQHiU2KH-Ms3KCsk38TQbuX3vAaPhfXOePLirnCAtZK4CvhBX2KmO4PN9JX2M-DtyXfnjhvtDlgO0QUXz7pVGq2yrGA8wCYatJUV_-YZ8WH-99J13WrqjTYSvLQVyNZTvAAXompA_uyhkoPPJSABpmXOGmfKGKu4ct-kV_DJkAR8q3ZPdG0ZoNNYWJuGLPYTl-NvI"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none"></div>
                    </div>
                    
                    <div className="flex-grow flex flex-col mt-4">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <h3 className="font-['Space_Grotesk',_sans-serif] text-[24px] font-bold text-[#674bb5] tracking-tight flex items-center gap-2">
                          Research Vault 📚
                        </h3>
                      </div>
                      
                      <div className="bg-white/50 border border-white/60 rounded-2xl p-4 backdrop-blur-sm shadow-sm mb-auto">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Type</span>
                          <span className="text-[13px] font-bold text-[#674bb5]">Knowledge Base</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Difficulty</span>
                          <span className="text-[13px] text-amber-500 tracking-widest drop-shadow-sm">All Levels</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Learning Value</span>
                          <span className="text-[13px] text-amber-500 tracking-widest drop-shadow-sm">★★★★★</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Learning</span>
                          <span className="text-[13px] text-amber-500 tracking-widest drop-shadow-sm">★★★★★</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mt-4 px-1 pb-1">
                        <span className="px-3 py-1 bg-[#674bb5]/10 text-[#674bb5] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#674bb5]/20">Research</span>
                        <span className="px-3 py-1 bg-[#6c5775]/10 text-[#6c5775] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#6c5775]/20">Study Materials</span>
                        <span className="px-3 py-1 bg-[#765469]/10 text-[#765469] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#765469]/20">Papers</span>
                        <span className="px-3 py-1 bg-[#C3A6FF]/30 text-[#2D1B36] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#C3A6FF]/50">Resources</span>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
              
              {/* Right Card: Research Vault */}
              <div className="card-item w-[380px] md:w-[420px] h-[520px] cursor-pointer card-right card-active" id="card-right" style={{ zIndex: 100 }}>
                <div className="paper-grain bg-[#2D1B36] rounded-[32px] p-10 flex flex-col justify-between h-full relative overflow-hidden">
                  <div className="flex justify-between items-start relative z-10">
                    <div className="bg-[#C3A6FF]/20 p-2 rounded-xl">
                      <span className="material-symbols-outlined text-[#C3A6FF] text-2xl">science</span>
                    </div>
                    <div className="cursor-pointer opacity-70 hover:opacity-100 transition-opacity">
                      <span className="material-symbols-outlined text-white text-3xl font-light">close</span>
                    </div>
                  </div>
                  <div className="my-6 relative z-10">
                    <h4 className="text-[#C3A6FF] font-['Space_Grotesk',_sans-serif] text-[24px] mb-4 uppercase tracking-widest text-sm font-bold">Description</h4>
                    <p className="font-['Inter',_sans-serif] text-[16px] text-white/90 leading-relaxed font-light">
                      <strong>Explore a curated collection of research papers, study guides, and learning resources.</strong><br />
                      <strong>Everything you need to learn, explore, and grow in quantum computing.</strong>
                    </p>
                  </div>
                  
                  <button type="button" aria-label="Research Vault selected" className="btn-go group w-full bg-gradient-to-r from-[#D4B3FF] to-[#B696F2] p-2 rounded-full flex items-center shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3)] hover:shadow-[0_45px_80px_-20px_rgba(0,0,0,0.3)] relative z-10">
                    <span className="font-['Space_Grotesk',_sans-serif] text-[20px] font-bold text-[#2D1B36] ml-8 flex-grow text-left uppercase tracking-wide">
                        LET&apos;S GO!
                    </span>
                    <div className="bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-sm group-hover:bg-[#f8f9fc] transition-colors">
                        <span className="arrow-icon material-symbols-outlined text-[#2D1B36] font-bold text-2xl">arrow_forward</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
