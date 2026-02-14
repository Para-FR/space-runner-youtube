import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { entityStore } from '../../store/entityStore';

const MAX_BULLETS = 200;
const BULLET_MAX_DISTANCE = 200;
const _matrix = new THREE.Matrix4();
const _position = new THREE.Vector3();
const _scale = new THREE.Vector3(1, 1, 1);
const _hiddenScale = new THREE.Vector3(0, 0, 0);
const _quaternion = new THREE.Quaternion();

export function PlayerBullets({
  playerPosition,
}: {
  playerPosition: React.RefObject<THREE.Vector3>;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null!);

  useFrame((_, delta) => {
    const state = entityStore.getState();
    const mesh = meshRef.current;
    const pZ = playerPosition.current?.z ?? 0;

    for (let i = 0; i < MAX_BULLETS; i++) {
      const bullet = state.bullets[i];
      if (bullet?.active) {
        bullet.position[0] += bullet.velocity[0] * delta;
        bullet.position[1] += bullet.velocity[1] * delta;
        bullet.position[2] += bullet.velocity[2] * delta;

        // Deactivate bullets that are too far ahead of the player
        if (bullet.position[2] < pZ - BULLET_MAX_DISTANCE) {
          bullet.active = false;
        }

        _position.set(bullet.position[0], bullet.position[1], bullet.position[2]);
        _matrix.compose(_position, _quaternion, _scale);
      } else {
        _position.set(0, -1000, 0);
        _matrix.compose(_position, _quaternion, _hiddenScale);
      }
      mesh.setMatrixAt(i, _matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_BULLETS]}
      frustumCulled={false}
    >
      <cylinderGeometry args={[0.05, 0.05, 0.6, 6]} />
      <meshBasicMaterial color="#00ffff" toneMapped={false} />
    </instancedMesh>
  );
}
