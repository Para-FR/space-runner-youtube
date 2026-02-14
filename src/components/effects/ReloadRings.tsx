import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { AMMO } from '../../utils/constants';

const LOW_AMMO_THRESHOLD = 0.35;
const RING_RADIUS = 5;
const TUBE_RADIUS = 0.25;

interface ReloadRingData {
  worldZ: number;
  x: number;
  y: number;
  collected: boolean;
  active: boolean;
}

export function ReloadRings({
  playerPosition,
}: {
  playerPosition: React.RefObject<THREE.Vector3>;
}) {
  const groupRef = useRef<THREE.Group>(null!);
  const initializedRef = useRef(false);

  const rings = useMemo<ReloadRingData[]>(() => {
    return Array.from({ length: AMMO.RING_COUNT }, (_, i) => ({
      worldZ: -(i + 1) * AMMO.RING_SPACING,
      x: (Math.random() - 0.5) * 16,
      y: Math.random() * 4 + 3,
      collected: false,
      active: false,
    }));
  }, []);

  useFrame((state) => {
    const pZ = playerPosition.current?.z ?? 0;
    const group = groupRef.current;
    const time = state.clock.elapsedTime;
    const { ammo, maxAmmo } = useGameStore.getState();
    const isLowAmmo = ammo / maxAmmo < LOW_AMMO_THRESHOLD;

    if (!initializedRef.current && pZ !== 0) {
      rings.forEach((ring, i) => {
        ring.worldZ = pZ - (i + 1) * AMMO.RING_SPACING;
      });
      initializedRef.current = true;
    }

    // When low ammo, activate only the nearest ring ahead of the player
    if (isLowAmmo) {
      const hasActiveRing = rings.some((r) => r.active && !r.collected);
      if (!hasActiveRing) {
        // Find the closest uncollected ring ahead of the player (lowest Z = furthest ahead)
        let best: ReloadRingData | null = null;
        for (const r of rings) {
          if (r.collected || r.active) continue;
          if (!best || r.worldZ > best.worldZ) best = r;
        }
        if (best) best.active = true;
      }
    }

    group.children.forEach((child, i) => {
      const ring = rings[i];
      if (!ring) return;

      child.position.set(ring.x, ring.y, ring.worldZ);

      const shouldShow = ring.active && !ring.collected;
      child.visible = shouldShow;

      if (shouldShow) {
        // Gentle wobble on the facing axis
        child.rotation.y = Math.sin(time * 0.4 + i * 2) * 0.12;
        child.rotation.z = Math.cos(time * 0.3 + i) * 0.08;

        // Collection check
        if (playerPosition.current) {
          const dx = playerPosition.current.x - ring.x;
          const dy = playerPosition.current.y - ring.y;
          const dz = playerPosition.current.z - ring.worldZ;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < AMMO.RING_COLLECT_RADIUS) {
            ring.collected = true;
            child.visible = false;
            useGameStore.getState().reloadAmmo(AMMO.RELOAD_AMOUNT);
          }
        }
      }

      // Recycle behind player -> far ahead
      if (ring.worldZ > pZ + 40) {
        let minZ = pZ;
        for (const r of rings) {
          if (r.worldZ < minZ) minZ = r.worldZ;
        }
        ring.worldZ = minZ - AMMO.RING_SPACING;
        ring.x = (Math.random() - 0.5) * 16;
        ring.y = Math.random() * 4 + 3;
        ring.collected = false;
        ring.active = false;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {rings.map((_, i) => (
        <group key={i}>
          {/* Main torus - facing Z (player flight direction) */}
          <mesh>
            <torusGeometry args={[RING_RADIUS, TUBE_RADIUS, 16, 48]} />
            <meshStandardMaterial
              color="#00ffaa"
              emissive="#00ff88"
              emissiveIntensity={1.5}
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Inner glow disc */}
          <mesh>
            <ringGeometry args={[0, RING_RADIUS - 0.3, 48]} />
            <meshBasicMaterial
              color="#00ff88"
              transparent
              opacity={0.06}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Outer glow halo */}
          <mesh>
            <ringGeometry args={[RING_RADIUS - 0.5, RING_RADIUS + 1.2, 48]} />
            <meshBasicMaterial
              color="#00ffcc"
              transparent
              opacity={0.08}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>

          {/* Point light to illuminate surroundings */}
          <pointLight color="#00ff88" intensity={2} distance={20} decay={2} />
        </group>
      ))}
    </group>
  );
}
