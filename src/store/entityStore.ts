import { createStore } from 'zustand/vanilla';
import type { Bullet, AsteroidEntity, Explosion } from '../utils/types';

interface EntityState {
  bullets: Bullet[];
  asteroids: AsteroidEntity[];
  explosions: Explosion[];
  nextId: number;
}

export const entityStore = createStore<EntityState>()(() => ({
  bullets: [],
  asteroids: [],
  explosions: [],
  nextId: 1,
}));

export function spawnBullet(
  position: [number, number, number],
  velocity: [number, number, number]
) {
  const state = entityStore.getState();
  const inactive = state.bullets.find((b) => !b.active);
  if (inactive) {
    inactive.position = [...position];
    inactive.velocity = [...velocity];
    inactive.active = true;
    entityStore.setState({ bullets: [...state.bullets] });
  } else {
    const id = state.nextId;
    entityStore.setState({
      bullets: [
        ...state.bullets,
        { id, position: [...position], velocity: [...velocity], active: true },
      ],
      nextId: id + 1,
    });
  }
}

export function spawnAsteroid(asteroid: Omit<AsteroidEntity, 'id'>) {
  const state = entityStore.getState();
  const inactive = state.asteroids.find((a) => !a.active);
  if (inactive) {
    Object.assign(inactive, asteroid, { active: true });
    entityStore.setState({ asteroids: [...state.asteroids] });
  } else {
    const id = state.nextId;
    entityStore.setState({
      asteroids: [...state.asteroids, { ...asteroid, id, active: true }],
      nextId: id + 1,
    });
  }
}

export function spawnExplosion(
  position: [number, number, number],
  scale: number
) {
  const state = entityStore.getState();
  const inactive = state.explosions.find((e) => !e.active);
  const now = performance.now() / 1000;
  if (inactive) {
    inactive.position = [...position];
    inactive.startTime = now;
    inactive.scale = scale;
    inactive.active = true;
    entityStore.setState({ explosions: [...state.explosions] });
  } else {
    const id = state.nextId;
    entityStore.setState({
      explosions: [
        ...state.explosions,
        { id, position: [...position], startTime: now, scale, active: true },
      ],
      nextId: id + 1,
    });
  }
}

export function resetEntities() {
  entityStore.setState({
    bullets: [],
    asteroids: [],
    explosions: [],
    nextId: 1,
  });
}
