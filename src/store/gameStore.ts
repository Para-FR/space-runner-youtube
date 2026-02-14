import { create } from 'zustand';
import type { GamePhase } from '../utils/types';
import { AMMO } from '../utils/constants';

interface GameState {
  phase: GamePhase;
  score: number;
  lives: number;
  level: number;
  highScore: number;
  destroyedCount: number;
  ammo: number;
  maxAmmo: number;

  startGame: () => void;
  endGame: () => void;
  pause: () => void;
  resume: () => void;
  addScore: (points: number) => void;
  loseLife: () => void;
  addDestroyed: () => void;
  nextLevel: () => void;
  consumeAmmo: () => boolean;
  reloadAmmo: (amount: number) => void;
}

export const useGameStore = create<GameState>()((set, get) => ({
  phase: 'start',
  score: 0,
  lives: 3,
  level: 1,
  highScore: parseInt(localStorage.getItem('spaceRunnerHighScore') ?? '0'),
  destroyedCount: 0,
  ammo: AMMO.START,
  maxAmmo: AMMO.MAX,

  startGame: () =>
    set({
      phase: 'playing',
      score: 0,
      lives: 3,
      level: 1,
      destroyedCount: 0,
      ammo: AMMO.START,
    }),

  endGame: () => {
    const { score, highScore } = get();
    const newHigh = Math.max(score, highScore);
    localStorage.setItem('spaceRunnerHighScore', String(newHigh));
    set({ phase: 'gameover', highScore: newHigh });
  },

  pause: () => set({ phase: 'paused' }),
  resume: () => set({ phase: 'playing' }),

  addScore: (points) => set((s) => ({ score: s.score + points })),

  loseLife: () => {
    const newLives = get().lives - 1;
    if (newLives <= 0) {
      get().endGame();
    } else {
      set({ lives: newLives });
    }
  },

  addDestroyed: () => {
    const { destroyedCount, level } = get();
    const newCount = destroyedCount + 1;
    const threshold = 20 + (level - 1) * 5;
    if (newCount >= threshold) {
      set({ destroyedCount: 0, level: level + 1 });
    } else {
      set({ destroyedCount: newCount });
    }
  },

  nextLevel: () => set((s) => ({ level: s.level + 1, destroyedCount: 0 })),

  consumeAmmo: () => {
    const { ammo } = get();
    if (ammo <= 0) return false;
    set({ ammo: ammo - 1 });
    return true;
  },

  reloadAmmo: (amount) =>
    set((s) => ({ ammo: Math.min(s.maxAmmo, s.ammo + amount) })),
}));
