'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PROCESSES = [
  "// INITIALIZING Q-QUEST CORE...",
  "// CALIBRATING RESONATORS...",
  "// DECRYPTING AGENT STREAMS...",
  "// SYNCHRONIZING QUBITS...",
  "// UNLOCKING DIMENSIONS...",
  "// SCANNING ARCHITECTURE...",
  "// VALIDATING ANCHORS...",
  "// OPTIMIZING CAPACITANCE...",
  "// SECURING UPLINK...",
  "// PURGING REGISTRIES...",
];

export default function ProcessTicker() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => {
        if (prev < PROCESSES.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const lineHeight = 48;
  const offset = -(activeIndex * lineHeight) - (lineHeight / 2);

  return (
    <div className="relative h-[240px] overflow-hidden flex items-center font-mono text-base tracking-widest text-left w-full">
      {/* Highlight Bar */}
      <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[48px] bg-white z-10 rounded-sm"></div>
      
      {/* Scroller */}
      <motion.div 
        className="absolute w-full top-1/2 flex flex-col z-20"
        animate={{ y: offset }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        {PROCESSES.map((process, index) => (
          <div 
            key={index}
            className={`h-[48px] flex items-center px-3 whitespace-nowrap transition-colors duration-300 ${
              index === activeIndex 
                ? 'text-[#5a189a] font-bold' 
                : 'text-white/70 font-normal'
            }`}
          >
            {process}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
