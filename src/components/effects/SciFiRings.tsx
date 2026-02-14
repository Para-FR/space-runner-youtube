import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const RING_COUNT = 4;
const SPACING = 80;

export function SciFiRings({
  playerPosition,
}: {
  playerPosition: React.RefObject<THREE.Vector3>;
}) {
  const { scene } = useGLTF('/models/scifi_ring.glb');
  const groupRef = useRef<THREE.Group>(null!);

  const rings = useMemo(() => {
    return Array.from({ length: RING_COUNT }, (_, i) => ({
      offset: -i * SPACING - 60,
      x: (Math.random() - 0.5) * 10,
      y: Math.random() * 4 + 2,
      rotSpeed: (Math.random() - 0.5) * 0.3,
    }));
  }, []);

  useFrame((_, delta) => {
    const pZ = playerPosition.current?.z ?? 0;
    const group = groupRef.current;

    group.children.forEach((child, i) => {
      const ring = rings[i]!;
      const ringZ = pZ + ring.offset;

      child.position.z = ringZ;
      child.position.x = ring.x;
      child.position.y = ring.y;
      child.rotation.z += ring.rotSpeed * delta;

      // Wrap rings that pass behind to the front
      if (child.position.z > pZ + 30) {
        ring.offset -= RING_COUNT * SPACING;
        ring.x = (Math.random() - 0.5) * 10;
        ring.y = Math.random() * 4 + 2;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((_, i) => (
        <primitive
          key={i}
          object={scene.clone()}
          scale={[1.5, 1.5, 1.5]}
        />
      ))}
    </group>
  );
}

useGLTF.preload('/models/scifi_ring.glb');
