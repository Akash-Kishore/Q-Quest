'use client';

import ScrollController from './components/ScrollController';
import HeroSection from './components/HeroSection';
import CardsSection from './components/CardsSection';
import PhysicsBackground from './components/PhysicsBackground';
import styles from './selection.module.css';

export default function SelectionPage() {
  return (
    <ScrollController>
      <div className={styles.launchPadPage}>
        {/* Aurora gradient background */}
        <div className={styles.auroraBackground} />

        {/* Canvas-based physics sphere system */}
        <PhysicsBackground />

        {/* Paper grain texture overlay */}
        <div className={styles.paperGrain} />

        {/* Pinned viewport with hero + cards */}
        <div className={styles.pinnedViewport}>
          <HeroSection />
          <CardsSection />
        </div>
      </div>
    </ScrollController>
  );
}
