import { createStore } from 'zustand/vanilla';
import * as THREE from 'three';

interface HandTrackingState {
  active: boolean;
  /** Right hand normalized position (0-1), null if not detected */
  rightHand: { x: number; y: number } | null;
  /** Whether left hand is making a fist */
  leftFist: boolean;
}

interface InputState {
  keys: Set<string>;
  shooting: boolean;
  hand: HandTrackingState;
}

export const inputStore = createStore<InputState>()(() => ({
  keys: new Set<string>(),
  shooting: false,
  hand: {
    active: false,
    rightHand: null,
    leftFist: false,
  },
}));

// Global player position accessible from HTML UI (outside Canvas)
export const playerPositionGlobal = new THREE.Vector3(0, 2, 0);
