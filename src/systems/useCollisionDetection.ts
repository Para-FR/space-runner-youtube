import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { entityStore, spawnExplosion } from '../store/entityStore';
import { useGameStore } from '../store/gameStore';
import { spheresIntersect } from '../utils/math';
import { PLAYER } from '../utils/constants';

export function useCollisionDetection(
  playerPosition: React.RefObject<THREE.Vector3>,
  onPlayerHit: () => void
) {
  const invincibleRef = useRef(0);

  useFrame((_, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'playing') return;

    const { bullets, asteroids } = entityStore.getState();
    const { addScore, loseLife, addDestroyed } = useGameStore.getState();

    // Bullet-Asteroid collisions
    for (const bullet of bullets) {
      if (!bullet.active) continue;
      for (const asteroid of asteroids) {
        if (!asteroid.active) continue;
        if (
          spheresIntersect(
            bullet.position,
            0.3,
            asteroid.position,
            asteroid.radius
          )
        ) {
          bullet.active = false;
          asteroid.health -= 1;
          if (asteroid.health <= 0) {
            asteroid.active = false;
            spawnExplosion(asteroid.position, asteroid.radius);
            // Smaller asteroids = more points
            const points =
              asteroid.radius > 1.8 ? 100 : asteroid.radius > 1 ? 200 : 300;
            addScore(points);
            addDestroyed();
          }
          break;
        }
      }
    }

    // Player-Asteroid collisions
    invincibleRef.current -= delta;
    const pp = playerPosition.current;
    if (pp && invincibleRef.current <= 0) {
      const playerPos: [number, number, number] = [pp.x, pp.y, pp.z];
      for (const asteroid of asteroids) {
        if (!asteroid.active) continue;
        if (
          spheresIntersect(
            playerPos,
            PLAYER.COLLISION_RADIUS,
            asteroid.position,
            asteroid.radius
          )
        ) {
          asteroid.active = false;
          spawnExplosion(asteroid.position, asteroid.radius);
          loseLife();
          invincibleRef.current = PLAYER.INVINCIBLE_DURATION;
          onPlayerHit();
          break;
        }
      }
    }
  });
}
