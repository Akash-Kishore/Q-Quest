'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import AtomLogo from './AtomLogo';

type InteractiveBrandProps = {
  className: string;
  markClassName: string;
  labelClassName: string;
};

export default function InteractiveBrand({ className, markClassName, labelClassName }: InteractiveBrandProps) {
  const brandRef = useRef<HTMLAnchorElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const pointerFrameRef = useRef<number | null>(null);

  const resetHighlight = useCallback(() => {
    if (pointerFrameRef.current !== null) {
      cancelAnimationFrame(pointerFrameRef.current);
      pointerFrameRef.current = null;
    }
    brandRef.current?.removeAttribute('data-pointer-active');
    markRef.current?.style.setProperty('--brand-highlight-x', '50%');
    markRef.current?.style.setProperty('--brand-highlight-y', '50%');
  }, []);

  const handlePointerMove = useCallback((event: ReactPointerEvent<HTMLAnchorElement>) => {
    if (
      event.pointerType === 'touch'
      || !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      resetHighlight();
      return;
    }

    const brand = event.currentTarget;
    const mark = markRef.current;
    if (!mark) return;
    const clientX = event.clientX;
    const clientY = event.clientY;
    if (pointerFrameRef.current !== null) cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = requestAnimationFrame(() => {
      pointerFrameRef.current = null;
      const bounds = mark.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (clientX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (clientY - bounds.top) / bounds.height));
      mark.style.setProperty('--brand-highlight-x', `${(x * 100).toFixed(1)}%`);
      mark.style.setProperty('--brand-highlight-y', `${(y * 100).toFixed(1)}%`);
      brand.setAttribute('data-pointer-active', 'true');
    });
  }, [resetHighlight]);

  useEffect(() => resetHighlight, [resetHighlight]);

  return (
    <Link
      ref={brandRef}
      href="/home"
      className={className}
      aria-label="Return to Q-Quest home"
      onPointerMove={handlePointerMove}
      onPointerLeave={resetHighlight}
      onPointerCancel={resetHighlight}
      onBlur={resetHighlight}
    >
      <span ref={markRef} className={markClassName}><AtomLogo /></span>
      <span className={labelClassName}>Q-QUEST</span>
    </Link>
  );
}
