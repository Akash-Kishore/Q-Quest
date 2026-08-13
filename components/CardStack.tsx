'use client';

import { useState, useRef, useEffect, MouseEvent as ReactMouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useSpring, useTransform } from 'framer-motion';

interface CardStackProps {
  initialActiveCard: 'left' | 'right';
}

export default function CardStack({ initialActiveCard }: CardStackProps) {
  const router = useRouter();
  const [activeCard, setActiveCard] = useState<'left' | 'right'>(initialActiveCard);

  const leftCardRef = useRef<HTMLDivElement>(null);
  const rightCardRef = useRef<HTMLDivElement>(null);

  const updateCardStates = (active: 'left' | 'right') => {
    setActiveCard(active);
  };

  const resetAllCards = () => {
    // Optionally reset to initial active card or do nothing
    setActiveCard(initialActiveCard);
  };

  return (
    <div 
      className="card-stack w-full h-[600px] flex items-center justify-center relative perspective-[1200px]"
      onMouseLeave={resetAllCards}
    >
      {/* Left Card: Circuit Playground */}
      <CardItem 
        id="card-left"
        isActive={activeCard === 'left'}
        defaultZIndex={20}
        defaultTransform="translate(-140px, 0px) rotate(-12deg)"
        onHover={() => updateCardStates('left')}
        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBKe7wbcNg0HzI5n1vp6oimhl6oi4HVTksg9yz2M_WtkZuPM725XtZdzQ_WgmSgzMAdHu_f0x6so9LGeOTVT366WkxdDHSlghy83FdZbL9EWVpBhJZWUmTiKdSZRw1-mHwrTMyMYk8XWiJIe-Y00WcmnTRUCdT3q153d-nM9SgxB87irk5586sA73CvdQUv1gg0YmxLQ3uJZuRABqOXaNttkavHNDfXnCns6rjNNOMJuOmvFZfOYi4gN38U6P5TrM5Q4dDYVFE12-Kg"
        title="Circuit Playground ⚛️"
        type="Interactive Lab"
        difficulty="★★★☆☆"
        tags={['Hands-on', 'Sandbox', 'Interactive', 'Quantum']}
      />

      {/* Right Card: Research Vault */}
      <CardItem 
        id="card-right"
        isActive={activeCard === 'right'}
        defaultZIndex={21}
        defaultTransform="translate(140px, 0px) rotate(10deg)"
        onHover={() => updateCardStates('right')}
        imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuBASHDPLYujOMlDStmueCcUpGNv9H7toMMboMrfAoWelv3T1NYrj2flWk1kLibwyYYoxNbj1nD3xrFQHiU2KH-Ms3KCsk38TQbuX3vAaPhfXOePLirnCAtZK4CvhBX2KmO4PN9JX2M-DtyXfnjhvtDlgO0QUXz7pVGq2yrGA8wCYatJUV_-YZ8WH-99J13WrqjTYSvLQVyNZTvAAXompA_uyhkoPPJSABpmXOGmfKGKu4ct-kV_DJkAR8q3ZPdG0ZoNNYWJuGLPYTl-NvI"
        title="Research Vault 📚"
        type="Knowledge Base"
        difficulty="All Levels"
        tags={['Research', 'Study Materials', 'Papers', 'Resources']}
      />
    </div>
  );
}

interface CardItemProps {
  id: string;
  isActive: boolean;
  defaultZIndex: number;
  defaultTransform: string;
  onHover: () => void;
  imageSrc: string;
  title: string;
  type: string;
  difficulty: string;
  tags: string[];
}

function CardItem({ id, isActive, defaultZIndex, defaultTransform, onHover, imageSrc, title, type, difficulty, tags }: CardItemProps) {
  // Use framer motion springs for smooth 3D tracking
  const mx = useSpring(0, { stiffness: 300, damping: 30 });
  const my = useSpring(0, { stiffness: 300, damping: 30 });
  const rx = useSpring(0, { stiffness: 300, damping: 30 });
  const ry = useSpring(0, { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!isActive) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;
    
    const maxRot = 4;
    const maxTrans = 8;
    
    mx.set(percentX * maxTrans);
    my.set(percentY * maxTrans);
    ry.set(percentX * maxRot);
    rx.set(-percentY * maxRot);
  };

  const handleMouseLeave = () => {
    mx.set(0);
    my.set(0);
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      id={id}
      className={`absolute w-[380px] md:w-[420px] h-[520px] cursor-pointer rounded-[32px]`}
      style={{
        zIndex: isActive ? 100 : defaultZIndex,
        x: mx,
        y: my,
        rotateX: rx,
        rotateY: ry,
      }}
      initial={false}
      animate={{
        transform: isActive 
          ? `translate(0px, -16px) rotate(0deg) scale(1.05)` 
          : defaultTransform,
        boxShadow: isActive 
          ? '0 30px 60px -15px rgba(0,0,0,0.15)' 
          : (id === 'card-left' ? '0 10px 30px -10px rgba(103, 75, 181, 0.15)' : '0 10px 30px -10px rgba(45, 27, 54, 0.2)')
      }}
      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="bg-gradient-to-br from-[#e8ddff] to-[#f5d9fe] rounded-[32px] p-2 h-full w-full relative overflow-hidden shadow-[inset_0_0_0_2px_rgba(255,255,255,0.5)]">
        {/* Pattern Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #674bb5 1.5px, transparent 0)', backgroundSize: '24px 24px' }}></div>
        
        <div className="bg-gradient-to-b from-white/90 to-white/60 backdrop-blur-md rounded-[26px] flex flex-col h-full relative border border-white/50 p-3">
          <div className="relative w-full h-[240px] rounded-[18px] overflow-hidden border-2 border-white/60 shadow-inner bg-[#cebdff]/30">
            <img alt={title} className="w-full h-full object-cover" src={imageSrc} />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/40 pointer-events-none"></div>
          </div>
          <div className="flex-grow flex flex-col mt-4 text-[#191c1e]">
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-headline font-bold tracking-tight text-2xl flex items-center gap-2 text-[#674bb5]">
                {title}
              </h3>
            </div>
            <div className="bg-white/50 border border-white/60 rounded-2xl p-4 backdrop-blur-sm shadow-sm mb-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Type</span>
                <span className="text-[13px] font-bold text-[#674bb5]">{type}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Difficulty</span>
                <span className="text-[13px] text-amber-500 tracking-widest drop-shadow-sm">{difficulty}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-bold text-[#494552] uppercase tracking-wider">Interactivity</span>
                <span className="text-[13px] text-amber-500 tracking-widest drop-shadow-sm">★★★★★</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 px-1 pb-1">
              {tags.map((tag, i) => (
                <span key={i} className="px-3 py-1 bg-[#674bb5]/10 text-[#674bb5] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#674bb5]/20">
                  {tag}
                </span>
              ))}
            </div>
            
            {isActive && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 w-full bg-gradient-to-r from-[#D4B3FF] to-[#A880FF] p-2 rounded-full flex items-center shadow-lg hover:scale-[1.02] transition-transform group"
              >
                <span className="font-headline text-[16px] font-bold text-[#2D1B36] ml-6 flex-grow text-left uppercase tracking-wide">
                  LET'S GO!
                </span>
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
                  <span className="text-[#2D1B36] font-bold text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
