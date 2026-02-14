export interface Bullet {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  active: boolean;
}

export interface AsteroidEntity {
  id: number;
  position: [number, number, number];
  velocity: [number, number, number];
  rotation: [number, number, number];
  rotationSpeed: [number, number, number];
  radius: number;
  health: number;
  active: boolean;
}

export interface Explosion {
  id: number;
  position: [number, number, number];
  startTime: number;
  scale: number;
  active: boolean;
}

export type GamePhase = 'start' | 'playing' | 'paused' | 'gameover';
