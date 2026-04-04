import React from 'react';
import { Canvas } from '@react-three/fiber';
import BlochSphereScene from './BlochSphereScene.jsx';

export default function BlochSphere({ qubitIndex }) {
  return (
    <div className="w-full h-full aspect-square relative">
      <Canvas
        camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        style={{ background: 'transparent', width: '100%', height: '100%', outline: 'none' }}
      >
        <BlochSphereScene qubitIndex={qubitIndex} mini={false} />
      </Canvas>
    </div>
  );
}
