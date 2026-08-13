'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ReactNode, useRef } from 'react';

interface InteractiveCardProps {
  children: ReactNode;
  isActive: boolean;
  onHover: () => void;
  className?: string;
  initialTransform: {
    tx: number;
    ty: number;
    rz: number;
  };
}

export default function InteractiveCard({
  children,
  isActive,
  onHover,
  className = '',
  initialTransform,
}: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  // Motion values for tracking cursor
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for cursor movement
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // Map mouse movement to rotation and translation
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);
  const translateX = useTransform(mouseXSpring, [-0.5, 0.5], [-8, 8]);
  const translateY = useTransform(mouseYSpring, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize between -0.5 and 0.5
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseEnter={onHover}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={false}
      animate={{
        x: isActive ? 0 : initialTransform.tx,
        y: isActive ? -16 : initialTransform.ty,
        rotateZ: isActive ? 0 : initialTransform.rz,
        scale: isActive ? 1.05 : 1,
        zIndex: isActive ? 100 : 10,
        boxShadow: isActive 
          ? "0 30px 60px -15px rgba(0,0,0,0.5)" 
          : "0 10px 30px -10px rgba(103, 75, 181, 0.15)"
      }}
      style={{
        position: 'absolute',
        rotateX: isActive ? rotateX : 0,
        rotateY: isActive ? rotateY : 0,
        translateX: isActive ? translateX : 0,
        translateY: isActive ? translateY : 0,
        transformStyle: 'preserve-3d',
      }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 20,
        mass: 0.8
      }}
      className={`rounded-[32px] cursor-pointer w-[380px] md:w-[420px] h-[520px] ${className}`}
    >
      {children}
    </motion.div>
  );
}
