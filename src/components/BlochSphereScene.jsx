import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import useBlochAnimation from '../hooks/useBlochAnimation.js';
import { COLORS } from '../constants/colors.js';

const ORIGIN = new THREE.Vector3(0, 0, 0);
const SPHERE_RADIUS = 1;
const AXIS_LENGTH = 1.35;
const ARROW_LENGTH = 0.12;
const ARROW_RADIUS = 0.03;

const AXES = [
  { dir: [AXIS_LENGTH, 0, 0], color: COLORS.axisX, label: 'X', pos: [AXIS_LENGTH + 0.15, 0, 0] },
  { dir: [0, AXIS_LENGTH, 0], color: COLORS.axisZ, label: '|0⟩', pos: [0, AXIS_LENGTH + 0.18, 0] },
  { dir: [0, -AXIS_LENGTH, 0], color: COLORS.axisZ, label: '|1⟩', pos: [0, -AXIS_LENGTH - 0.18, 0] },
  { dir: [0, 0, AXIS_LENGTH], color: COLORS.axisY, label: 'Y', pos: [0, 0, AXIS_LENGTH + 0.15] },
];

function AxisLine({ direction, color, isNegative, mini }) {
  const points = useMemo(() => [ORIGIN, new THREE.Vector3(...direction)], [direction]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  
  useEffect(() => {
    return () => geometry.dispose();
  }, [geometry]);

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={isNegative ? 0.3 : 0.5} />
    </line>
  );
}

function PurityIndicator({ purity }) {
    const isPure = purity > 0.99;
    const txt = isPure ? "Pure state" : `Mixed state (${(purity * 100).toFixed(0)}%)`;
    return (
        <Html position={[0, -1.6, 0]} center style={{ pointerEvents: 'none' }}>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border 
                             ${isPure ? 'text-white/60 border-transparent bg-transparent' : 'text-[#7C3AED] border-[#7C3AED]/30 bg-[#7C3AED]/10'}
                             whitespace-nowrap select-none`}>
                {txt}
            </span>
        </Html>
    );
}

function AxisLabel({ position, label, color }) {
  return (
    <Html position={position} center style={{ pointerEvents: 'none' }}>
      <span className="text-[10px] font-mono font-bold select-none"
            style={{ color: `#${color.toString(16).padStart(6, '0')}` }}>
        {label}
      </span>
    </Html>
  );
}

function StateVector({ targetRef, purity }) {
  const currentVec = useRef(new THREE.Vector3(0, 1, 0)); // Start pointing at |0>
  const targetVec = useRef(new THREE.Vector3(0, 1, 0));

  const lineGeometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(6);
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => lineGeometry.dispose();
  }, [lineGeometry]);

  useFrame((_, delta) => {
    // Map Bloch coords to Three.js coords (Z -> Y, Y -> Z)
    targetVec.current.set(targetRef.x, targetRef.z, targetRef.y);
    
    const factor = 1 - Math.pow(0.001, delta / 0.4);
    currentVec.current.lerp(targetVec.current, factor);
    
    // Maintain length exactly at purity distance to prevent drifting during lerp interpolation
    const currentLen = currentVec.current.length();
    if(currentLen > 0.001 && Math.abs(currentLen - purity) > 0.001) {
        currentVec.current.normalize().multiplyScalar(Math.max(purity, 0.01)); // Prevent collapsing to zero for rendering
    }
  
    const positions = lineGeometry.attributes.position.array;
    positions[0] = 0; positions[1] = 0; positions[2] = 0;
    positions[3] = currentVec.current.x; positions[4] = currentVec.current.y; positions[5] = currentVec.current.z;
    lineGeometry.attributes.position.needsUpdate = true;
  });

  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial color={COLORS.stateVector} linewidth={2} transparent opacity={Math.max(0.3, purity)} />
    </line>
  );
}

export default function BlochSphereScene({ qubitIndex, mini }) {
  const { target, purity } = useBlochAnimation(qubitIndex);

  const equatorGeo = useMemo(() => new THREE.RingGeometry(SPHERE_RADIUS - 0.002, SPHERE_RADIUS + 0.002, 64), []);
  const sphereGeo = useMemo(() => new THREE.SphereGeometry(SPHERE_RADIUS, 24, 24), []);
  
  useEffect(() => {
      return () => {
          equatorGeo.dispose();
          sphereGeo.dispose();
      }
  }, [equatorGeo, sphereGeo]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} color={0xFFFFFF} />

      <mesh geometry={sphereGeo}>
        <meshBasicMaterial color={COLORS.sphereWire} wireframe transparent opacity={0.15} />
      </mesh>

      <mesh geometry={equatorGeo} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color={COLORS.equator} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Positive Axes */}
      {AXES.map((axis, i) => (
        <group key={`pos-${i}`}>
          <AxisLine direction={axis.dir} color={axis.color} isNegative={false} />
          {!mini && <AxisLabel position={axis.pos} label={axis.label} color={axis.color} />}
        </group>
      ))}

      {/* Negative Axes */}
      <AxisLine direction={[-AXIS_LENGTH, 0, 0]} color={COLORS.axisX} isNegative={true} />
      <AxisLine direction={[0, 0, -AXIS_LENGTH]} color={COLORS.axisY} isNegative={true} />

      <StateVector targetRef={target} purity={purity} />
      
      {!mini && <PurityIndicator purity={purity} />}

      {!mini && (
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          autoRotate={false}
          enablePan={false}
          minDistance={2}
          maxDistance={6}
        />
      )}
    </>
  );
}
