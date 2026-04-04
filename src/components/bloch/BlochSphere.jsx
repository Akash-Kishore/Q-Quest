import React from 'react';
import { Canvas } from '@react-three/fiber';
import BlochSphereScene from './BlochSphereScene.jsx';

export default function BlochSphere({ qubitIndex }) {
  return (
    <Canvas
      camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      dpr={[1, 1.5]}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[3, 3, 3]} intensity={0.5} color={0x00D4FF} />
      <BlochSphereScene qubitIndex={qubitIndex} mini={false} />
    </Canvas>
  );
}
