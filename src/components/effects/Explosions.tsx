import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { entityStore } from '../../store/entityStore';
import { EFFECTS } from '../../utils/constants';

const MAX_PARTICLES = 500;
const _matrix = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _scl = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _hiddenScale = new THREE.Vector3(0, 0, 0);

interface Particle {
  active: boolean;
  position: [number, number, number];
  velocity: [number, number, number];
  startTime: number;
  baseScale: number;
}

export function Explosions() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const particlesRef = useRef<Particle[]>([]);

  // Pre-allocate particle pool
  useMemo(() => {
    particlesRef.current = Array.from({ length: MAX_PARTICLES }, () => ({
      active: false,
      position: [0, 0, 0] as [number, number, number],
      velocity: [0, 0, 0] as [number, number, number],
      startTime: 0,
      baseScale: 0,
    }));
  }, []);

  // Color ramp: white -> yellow -> orange -> transparent
  const colorArray = useMemo(() => {
    const colors = new Float32Array(MAX_PARTICLES * 3);
    for (let i = 0; i < MAX_PARTICLES; i++) {
      colors[i * 3] = 1;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 0.3;
    }
    return colors;
  }, []);

  useFrame(() => {
    const state = entityStore.getState();
    const now = performance.now() / 1000;
    const particles = particlesRef.current;
    const mesh = meshRef.current;

    // Spawn new particles from active explosions
    for (const explosion of state.explosions) {
      if (!explosion.active) continue;
      const age = now - explosion.startTime;
      if (age > EFFECTS.EXPLOSION_DURATION) {
        explosion.active = false;
        continue;
      }
      // Only spawn particles once per explosion (at startTime)
      if (age < 0.05) {
        for (let p = 0; p < EFFECTS.EXPLOSION_PARTICLES; p++) {
          const free = particles.find((pt) => !pt.active);
          if (!free) break;
          free.active = true;
          free.position = [...explosion.position];
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const spd = 5 + Math.random() * 15;
          free.velocity = [
            Math.sin(phi) * Math.cos(theta) * spd,
            Math.sin(phi) * Math.sin(theta) * spd,
            Math.cos(phi) * spd,
          ];
          free.startTime = now;
          free.baseScale = explosion.scale * (0.1 + Math.random() * 0.15);
        }
      }
    }

    // Update particles
    const dt = 1 / 60; // Fixed dt for particle sim
    const colors = mesh.geometry.attributes.color as THREE.BufferAttribute;

    for (let i = 0; i < MAX_PARTICLES; i++) {
      const particle = particles[i]!;
      if (particle.active) {
        const age = now - particle.startTime;
        if (age > EFFECTS.EXPLOSION_DURATION) {
          particle.active = false;
          _pos.set(0, -1000, 0);
          _matrix.compose(_pos, _quat, _hiddenScale);
        } else {
          particle.position[0] += particle.velocity[0] * dt;
          particle.position[1] += particle.velocity[1] * dt;
          particle.position[2] += particle.velocity[2] * dt;

          // Slow down
          particle.velocity[0] *= 0.96;
          particle.velocity[1] *= 0.96;
          particle.velocity[2] *= 0.96;

          const t = age / EFFECTS.EXPLOSION_DURATION;
          const scale = particle.baseScale * (1 - t);

          _pos.set(
            particle.position[0],
            particle.position[1],
            particle.position[2]
          );
          _scl.setScalar(Math.max(scale, 0.01));
          _matrix.compose(_pos, _quat, _scl);

          // Color: white -> orange -> dark
          colors.array[i * 3] = 1;
          colors.array[i * 3 + 1] = Math.max(0, 1 - t * 2);
          colors.array[i * 3 + 2] = Math.max(0, 0.5 - t);
        }
      } else {
        _pos.set(0, -1000, 0);
        _matrix.compose(_pos, _quat, _hiddenScale);
      }
      mesh.setMatrixAt(i, _matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
    colors.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, MAX_PARTICLES]}
      frustumCulled={false}
    >
      <icosahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        vertexColors
        toneMapped={false}
        transparent
        opacity={0.9}
        depthWrite={false}
      />
      <instancedBufferAttribute
        attach="geometry-attributes-color"
        args={[colorArray, 3]}
      />
    </instancedMesh>
  );
}
