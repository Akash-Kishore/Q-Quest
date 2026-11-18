'use client';

import { useEffect, useState } from 'react';

export default function TelemetryFeed() {
  const [latency, setLatency] = useState("0.002MS");
  const [coord, setCoord] = useState("40.7128 N");

  useEffect(() => {
    const updateTelemetry = () => {
      const randomLatency = (Math.random() * (0.009 - 0.001) + 0.001).toFixed(3);
      setLatency(`${randomLatency}MS`);

      const baseCoord = 40.7128;
      const fluctuation = (Math.random() - 0.5) * 0.001;
      const newCoord = (baseCoord + fluctuation).toFixed(4);
      setCoord(`${newCoord} N`);
    };

    const interval = setInterval(updateTelemetry, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-right flex flex-col items-end gap-8 font-mono">
      <p className="text-white text-[14px] leading-relaxed max-w-[340px] opacity-80">
        {'// HANG TIGHT, EXPLORER. THE DATA TRANSFER IS IN PROGRESS. CALIBRATING REINFORCEMENT LEARNING AGENTS FOR OPTIMAL RESONANCE.'}
      </p>
      
      <div className="h-[1px] w-full bg-white/20"></div>
      
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full text-[13px] text-white/60">
        <div className="flex flex-col">
          <span className="text-white/40">LATENCY</span>
          <span className="text-white">{latency}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">BUFFER</span>
          <span className="text-white">OPTIMIZED</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">UPLINK</span>
          <span className="text-white">SECURE</span>
        </div>
        <div className="flex flex-col">
          <span className="text-white/40">COORD</span>
          <span className="text-white">{coord}</span>
        </div>
      </div>
    </div>
  );
}
