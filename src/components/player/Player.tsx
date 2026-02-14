import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { inputStore, playerPositionGlobal } from '../../store/inputStore';
import { spawnBullet } from '../../store/entityStore';
import { useGameStore } from '../../store/gameStore';
import { PLAYER, CAMERA } from '../../utils/constants';
import { clamp, lerp } from '../../utils/math';

export function Player({
  positionRef,
}: {
  positionRef: React.RefObject<THREE.Vector3>;
}) {
  const { scene } = useGLTF('/models/spaceship.glb');
  const groupRef = useRef<THREE.Group>(null!);
  const velocityRef = useRef({ x: 0, y: 0 });
  const shootCooldownRef = useRef(0);
  const forwardZRef = useRef(0);

  useFrame((state, delta) => {
    const phase = useGameStore.getState().phase;
    if (phase !== 'playing') return;

    const input = inputStore.getState();
    const vel = velocityRef.current;
    const group = groupRef.current;

    // --- Forward movement (automatic rail) ---
    forwardZRef.current -= PLAYER.FORWARD_SPEED * delta;
    group.position.z = forwardZRef.current;

    // --- Lateral/Vertical movement ---
    const { hand } = input;

    if (hand.active && hand.rightHand) {
      // Hand tracking: map normalized hand position to play area
      // Mirror X: raw x=0 (camera left) = user's right = positive ship X
      const targetX = (0.5 - hand.rightHand.x) * 2 * PLAYER.BOUNDS_X;
      const targetY = (0.5 - hand.rightHand.y) * 2 * PLAYER.BOUNDS_Y + 3;

      const clampedTargetX = clamp(targetX, -PLAYER.BOUNDS_X, PLAYER.BOUNDS_X);
      const clampedTargetY = clamp(targetY, 0.5, PLAYER.BOUNDS_Y);

      // Smooth lerp to target position
      const handLerp = 1 - Math.exp(-6 * delta);
      const prevX = group.position.x;
      const prevY = group.position.y;
      group.position.x = lerp(group.position.x, clampedTargetX, handLerp);
      group.position.y = lerp(group.position.y, clampedTargetY, handLerp);

      // Derive velocity for ship tilt
      vel.x = (group.position.x - prevX) / delta;
      vel.y = (group.position.y - prevY) / delta;
    } else {
      // Keyboard controls
      const moveX =
        (input.keys.has('KeyD') || input.keys.has('ArrowRight') ? 1 : 0) -
        (input.keys.has('KeyA') || input.keys.has('ArrowLeft') ? 1 : 0);
      const moveY =
        (input.keys.has('KeyW') || input.keys.has('ArrowUp') ? 1 : 0) -
        (input.keys.has('KeyS') || input.keys.has('ArrowDown') ? 1 : 0);

      const targetVelX = moveX * PLAYER.MAX_SPEED;
      const targetVelY = moveY * PLAYER.MAX_SPEED;

      const accelLerp = 1 - Math.exp(-PLAYER.ACCELERATION * 0.1 * delta);
      const dampLerp = 1 - Math.exp(-PLAYER.DAMPING * delta);

      if (moveX !== 0) {
        vel.x = lerp(vel.x, targetVelX, accelLerp);
      } else {
        vel.x = lerp(vel.x, 0, dampLerp);
      }
      if (moveY !== 0) {
        vel.y = lerp(vel.y, targetVelY, accelLerp);
      } else {
        vel.y = lerp(vel.y, 0, dampLerp);
      }

      group.position.x += vel.x * delta;
      group.position.y += vel.y * delta;

      group.position.x = clamp(group.position.x, -PLAYER.BOUNDS_X, PLAYER.BOUNDS_X);
      group.position.y = clamp(group.position.y, 0.5, PLAYER.BOUNDS_Y);
    }

    // Smooth ship tilt proportional to velocity
    const tiltLerp = 1 - Math.exp(-PLAYER.TILT_LERP * delta);
    group.rotation.z = lerp(group.rotation.z, -vel.x * PLAYER.TILT_FACTOR_X, tiltLerp);
    group.rotation.x = lerp(group.rotation.x, -vel.y * PLAYER.TILT_FACTOR_Y, tiltLerp);

    // Update position ref for collision detection + camera + other systems
    if (positionRef.current) {
      positionRef.current.copy(group.position);
    }
    // Sync global position for HTML UI (radar)
    playerPositionGlobal.copy(group.position);

    // --- Camera follow ---
    const cam = state.camera;
    const targetCamX = group.position.x * 0.3;
    const targetCamY = group.position.y + CAMERA.OFFSET_Y;
    const targetCamZ = group.position.z + CAMERA.OFFSET_Z;

    cam.position.x = lerp(cam.position.x, targetCamX, CAMERA.LERP_SPEED * delta);
    cam.position.y = lerp(cam.position.y, targetCamY, CAMERA.LERP_SPEED * delta);
    cam.position.z = lerp(cam.position.z, targetCamZ, CAMERA.LERP_SPEED * delta);

    cam.lookAt(
      group.position.x * 0.5,
      group.position.y,
      group.position.z - CAMERA.LOOK_AHEAD
    );

    // --- Shooting (consumes ammo) ---
    shootCooldownRef.current -= delta;
    const isShooting =
      input.shooting ||
      input.keys.has('Space') ||
      (hand.active && hand.leftFist);
    if (isShooting && shootCooldownRef.current <= 0) {
      const canShoot = useGameStore.getState().consumeAmmo();
      if (canShoot) {
        shootCooldownRef.current = PLAYER.SHOOT_COOLDOWN;
        const pos: [number, number, number] = [
          group.position.x,
          group.position.y,
          group.position.z,
        ];
        spawnBullet(pos, [0, 0, -PLAYER.BULLET_SPEED]);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 2, 0]}>
      <primitive
        object={scene}
        scale={[1.5, 1.5, 1.5]}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}

useGLTF.preload('/models/spaceship.glb');
