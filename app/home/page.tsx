'use client';

import HomeScrollController from './components/HomeScrollController';
import EnvironmentLayers from './components/EnvironmentLayers';
import HudGrid from './components/HudGrid';
import SphereScene from './components/SphereScene';
import PixelTransition from './components/PixelTransition';
import HeroTitle from './components/HeroTitle';
import SelectionReveal from './components/SelectionReveal';
import styles from './home.module.css';

export default function HomePage() {
  return (
    <HomeScrollController>
      <div className={styles.homePage}>
        {/* Layer 0–5: Environment (dark space → atmospheric evolution → aurora) */}
        <EnvironmentLayers />

        {/* Layer 6: HUD Grid (participates in transition, dissolves by 0.70) */}
        <HudGrid />

        {/* Layer 10: Three.js sphere + orbits + camera choreography */}
        <SphereScene />

        {/* Layer 15: Q_QUEST typography (spatial exit, never fades) */}
        <HeroTitle />

        {/* Layer 18: Selection reveal (title + cards) */}
        <SelectionReveal />

        {/* Layer 19: WebGL pixel transition (sphere → disintegrate → reform → physics → hover) */}
        <PixelTransition />
      </div>
    </HomeScrollController>
  );
}
