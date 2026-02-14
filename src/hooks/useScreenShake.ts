import { useRef, useCallback } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EFFECTS } from '../utils/constants';

export function useScreenShake() {
  const intensityRef = useRef(0);
  const { camera } = useThree();

  const trigger = useCallback((intensity: number = EFFECTS.SCREEN_SHAKE_INTENSITY) => {
    intensityRef.current = intensity;
  }, []);

  useFrame((_, delta) => {
    if (intensityRef.current > 0.001) {
      camera.position.x += (Math.random() - 0.5) * intensityRef.current;
      camera.position.y += (Math.random() - 0.5) * intensityRef.current;
      intensityRef.current *= 1 - EFFECTS.SCREEN_SHAKE_DECAY * delta;
    }
  });

  return trigger;
}
