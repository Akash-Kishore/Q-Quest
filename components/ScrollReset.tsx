'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReset() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const resetScroll = () => {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    resetScroll();
    const frame = requestAnimationFrame(resetScroll);
    window.addEventListener('pagehide', resetScroll);
    window.addEventListener('beforeunload', resetScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pagehide', resetScroll);
      window.removeEventListener('beforeunload', resetScroll);
    };
  }, [pathname]);

  return null;
}
