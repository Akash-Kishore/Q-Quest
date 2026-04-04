import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useBlochAnimation from '../../hooks/useBlochAnimation.js';
import { THREE_COLORS } from '../../constants/colors.js';

export default function BlochSphereScene({ qubitIndex, mini = false }) {
  const { target, purity, isAnimating } = useBlochAnimation(qubitIndex);

  const currentVec = useRef(new THREE.Vector3(0, 1, 0));
  const targetVec = useRef(new THREE.Vector3());
  const arrowRef = useRef();
  const coneRef = useRef();
  const trailRefs = useRef(Array.from({ length: 8 }, () => ({
    pos: new THREE.Vector3(0, 1, 0),
    mesh: null
  })));
  const trailIndex = useRef(0);

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(1, 24, 24), []);
  const wireMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    wireframe: true, color: THREE_COLORS.sphereWire, transparent: true, opacity: mini ? 0.12 : 0.18 
  }), [mini]);
  const cylinderGeo = useMemo(() => new THREE.CylinderGeometry(0.012, 0.012, 0.85, 8), []);
  const coneGeo = useMemo(() => new THREE.ConeGeometry(0.04, 0.15, 8), []);
  const arrowMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: THREE_COLORS.stateVector, transparent: true 
  }), []);
  const torusGeo = useMemo(() => new THREE.TorusGeometry(1, 0.003, 4, 64), []);
  const equatorMat = useMemo(() => new THREE.MeshBasicMaterial({ 
    color: 0xFFFFFF, transparent: true, opacity: 0.06 
  }), []);

  const trailMats = useMemo(() => Array.from({ length: 8 }).map((_, i) => {
    const color = new THREE.Color(THREE_COLORS.trailStart).lerp(new THREE.Color(THREE_COLORS.trailEnd), i / 7);
    return new THREE.MeshBasicMaterial({ transparent: true, color });
  }), []);

  useEffect(() => {
    return () => {
      sphereGeo.dispose();
      wireMat.dispose();
      cylinderGeo.dispose();
      coneGeo.dispose();
      arrowMat.dispose();
      torusGeo.dispose();
      equatorMat.dispose();
      trailMats.forEach(m => m.dispose());
    };
  }, [sphereGeo, wireMat, cylinderGeo, coneGeo, arrowMat, torusGeo, equatorMat, trailMats]);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.pow(0.001, delta / 0.4);
    
    // Y-up configuration: Z goes to top, Y goes to depth
    targetVec.current.set(target.x, target.z, -target.y);
    currentVec.current.lerp(targetVec.current, lerpFactor);
    
    const len = currentVec.current.length() || 1;
    const dir = currentVec.current.clone().normalize();
    const up = new THREE.Vector3(0, 1, 0);

    if (arrowRef.current && coneRef.current) {
      arrowRef.current.position.copy(currentVec.current.clone().multiplyScalar(0.425));
      arrowRef.current.quaternion.setFromUnitVectors(up, dir);
      
      coneRef.current.position.copy(currentVec.current.clone().multiplyScalar(0.9));
      coneRef.current.quaternion.setFromUnitVectors(up, dir);
      
      arrowMat.opacity = Math.max(0.2, purity);
    }

    if (isAnimating) {
      trailRefs.current[trailIndex.current].pos.copy(currentVec.current);
      trailIndex.current = (trailIndex.current + 1) % 8;
    }

    trailRefs.current.forEach((t, i) => {
      if (t.mesh) {
        t.mesh.position.copy(t.pos.clone().multiplyScalar(0.425));
        t.mesh.quaternion.setFromUnitVectors(up, t.pos.clone().normalize());
        t.mesh.material.opacity = isAnimating ? (i / 8) * 0.35 * purity : 0;
      }
    });
  });

  return (
    <>
      <mesh geometry={sphereGeo} material={wireMat} />
      <mesh geometry={torusGeo} material={equatorMat} rotation={[Math.PI/2, 0, 0]} />

      <mesh ref={arrowRef} geometry={cylinderGeo} material={arrowMat} />
      <mesh ref={coneRef} geometry={coneGeo} material={arrowMat} />

      {trailRefs.current.map((t, i) => (
        <mesh key={i} ref={el => t.mesh = el} geometry={cylinderGeo} material={trailMats[i]} />
      ))}

      {!mini && (
        <>
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(1.25,0,0)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisX} transparent opacity={0.5} /></line>
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(-1.25,0,0)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisX} transparent opacity={0.25} /></line>
          
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(0,0,1.25)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisY} transparent opacity={0.5} /></line>
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(0,0,-1.25)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisY} transparent opacity={0.25} /></line>
          
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(0,1.25,0)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisZ} transparent opacity={0.5} /></line>
          <line><bufferGeometry attach="geometry" setFromPoints={[new THREE.Vector3(), new THREE.Vector3(0,-1.25,0)]} /><lineBasicMaterial attach="material" color={THREE_COLORS.axisZ} transparent opacity={0.25} /></line>

          <Html position={[1.35, 0, 0]} center><span className="text-[10px] font-mono text-[#FF3333]">x</span></Html>
          <Html position={[0, 0, 1.35]} center><span className="text-[10px] font-mono text-[#33FF33]">y</span></Html>
          <Html position={[0, 1.35, 0]} center><span className="text-[10px] font-mono text-[#00D4FF]">|0⟩</span></Html>
          <Html position={[0, -1.35, 0]} center><span className="text-[10px] font-mono text-white/50">|1⟩</span></Html>
          
          <Html position={[0, -1.5, 0]} center>
            <div className={`px-2 py-0.5 rounded border text-[10px] font-mono whitespace-nowrap
                 ${purity > 0.99 ? 'text-white/60 border-transparent' : 'text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10'}`}>
              {purity > 0.99 ? "Pure" : `Mixed ${Math.round(purity*100)}%`}
            </div>
          </Html>

          <OrbitControls enableDamping dampingFactor={0.05} enablePan={false} minDistance={2} maxDistance={6} />
        </>
      )}
    </>
  );
}
