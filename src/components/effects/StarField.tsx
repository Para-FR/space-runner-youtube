import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const STAR_COUNT = 2000;
const FIELD_SIZE = 200;
const SPEED = 40;

export function StarField() {
  const pointsRef = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      arr[i * 3] = (Math.random() - 0.5) * FIELD_SIZE;
      arr[i * 3 + 1] = (Math.random() - 0.5) * FIELD_SIZE;
      arr[i * 3 + 2] = (Math.random() - 0.5) * FIELD_SIZE;
    }
    return arr;
  }, []);

  const sizes = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      arr[i] = Math.random() * 2 + 0.5;
    }
    return arr;
  }, []);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    const posAttr = points.geometry.attributes.position;
    if (!posAttr) return;
    const arr = posAttr.array as Float32Array;

    // Move stars toward the player (+Z direction) to create forward motion effect
    for (let i = 0; i < STAR_COUNT; i++) {
      const idx = i * 3 + 2;
      arr[idx] = (arr[idx] ?? 0) + SPEED * delta;
      // Wrap stars that pass behind the camera back to the front
      if ((arr[idx] ?? 0) > FIELD_SIZE / 2) {
        arr[idx] = (arr[idx] ?? 0) - FIELD_SIZE;
      }
    }
    posAttr.needsUpdate = true;

    // Slowly rotate the entire field for added visual interest
    points.rotation.z += delta * 0.01;
  });

  return (
    <points ref={pointsRef} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ffffff"
        sizeAttenuation
        transparent
        opacity={0.8}
        depthWrite={false}
      />
    </points>
  );
}
