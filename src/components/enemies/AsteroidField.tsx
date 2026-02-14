import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { entityStore, spawnAsteroid } from '../../store/entityStore';
import { useGameStore } from '../../store/gameStore';
import { ASTEROID } from '../../utils/constants';
import { randomRange } from '../../utils/math';

const MAX_ASTEROIDS = 100;
const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();
const _scl = new THREE.Vector3();
const _hiddenScale = new THREE.Vector3(0, 0, 0);

export function AsteroidField({
  playerPosition,
}: {
  playerPosition: React.RefObject<THREE.Vector3>;
}) {
  const { nodes } = useGLTF('/models/asteroids.glb');
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const spawnTimerRef = useRef(0);

  // Extract geometry from the GLB and center it so instances align with their position
  const { geometry, material } = useMemo(() => {
    const meshes = Object.values(nodes).filter(
      (n): n is THREE.Mesh => (n as THREE.Mesh).isMesh
    );
    const firstMesh = meshes[0];
    const geo = firstMesh?.geometry?.clone() ?? new THREE.IcosahedronGeometry(1, 1);

    // Center geometry at origin and normalize to unit radius
    geo.computeBoundingSphere();
    geo.center();
    if (geo.boundingSphere && geo.boundingSphere.radius > 0) {
      const scale = 1 / geo.boundingSphere.radius;
      geo.scale(scale, scale, scale);
    }

    return {
      geometry: geo,
      material: firstMesh?.material ?? new THREE.MeshStandardMaterial({ color: '#886644' }),
    };
  }, [nodes]);

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'playing') return;

    const state = entityStore.getState();
    const mesh = meshRef.current;
    const pZ = playerPosition.current?.z ?? 0;
    const level = useGameStore.getState().level;

    // --- Spawning ---
    spawnTimerRef.current -= delta;
    if (spawnTimerRef.current <= 0) {
      const interval = Math.max(
        ASTEROID.MIN_SPAWN_INTERVAL,
        ASTEROID.BASE_SPAWN_INTERVAL - (level - 1) * ASTEROID.SPAWN_INTERVAL_DECAY
      );
      spawnTimerRef.current = interval;

      const count = ASTEROID.BASE_COUNT + Math.floor((level - 1) * ASTEROID.COUNT_PER_LEVEL);
      for (let c = 0; c < count; c++) {
        const radius = randomRange(ASTEROID.MIN_RADIUS, ASTEROID.MAX_RADIUS);
        const speed = ASTEROID.BASE_SPEED + (level - 1) * ASTEROID.SPEED_PER_LEVEL;
        spawnAsteroid({
          position: [
            randomRange(-15, 15),
            randomRange(0, 10),
            pZ - ASTEROID.SPAWN_DISTANCE + randomRange(-20, 0),
          ],
          velocity: [
            randomRange(-2, 2),
            randomRange(-1, 1),
            speed * randomRange(0.7, 1.3),
          ],
          rotation: [
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
          ],
          rotationSpeed: [
            randomRange(-2, 2),
            randomRange(-2, 2),
            randomRange(-2, 2),
          ],
          radius,
          health: radius > 1.8 ? 3 : radius > 1 ? 2 : 1,
          active: true,
        });
      }
    }

    // --- Update instances ---
    for (let i = 0; i < MAX_ASTEROIDS; i++) {
      const asteroid = state.asteroids[i];
      if (asteroid?.active) {
        // Update position
        asteroid.position[0] += asteroid.velocity[0] * delta;
        asteroid.position[1] += asteroid.velocity[1] * delta;
        asteroid.position[2] += asteroid.velocity[2] * delta;

        // Update rotation
        asteroid.rotation[0] += asteroid.rotationSpeed[0] * delta;
        asteroid.rotation[1] += asteroid.rotationSpeed[1] * delta;
        asteroid.rotation[2] += asteroid.rotationSpeed[2] * delta;

        // Deactivate if behind player
        if (asteroid.position[2] > pZ + ASTEROID.DESPAWN_DISTANCE) {
          asteroid.active = false;
        }

        _pos.set(asteroid.position[0], asteroid.position[1], asteroid.position[2]);
        _euler.set(asteroid.rotation[0], asteroid.rotation[1], asteroid.rotation[2]);
        _quat.setFromEuler(_euler);
        _scl.setScalar(asteroid.radius);
        _matrix.compose(_pos, _quat, _scl);
      } else {
        _pos.set(0, -1000, 0);
        _matrix.compose(_pos, _quat, _hiddenScale);
      }
      mesh.setMatrixAt(i, _matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, undefined, MAX_ASTEROIDS]}
      frustumCulled={false}
    >
      <primitive object={material} attach="material" />
    </instancedMesh>
  );
}

useGLTF.preload('/models/asteroids.glb');
