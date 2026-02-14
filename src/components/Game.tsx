import { useRef, useCallback, useEffect } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { useKeyboard } from '../hooks/useKeyboard';
import { useScreenShake } from '../hooks/useScreenShake';
import { useCollisionDetection } from '../systems/useCollisionDetection';
import { Scene } from './Scene';
import { StarField } from './effects/StarField';
import { Player } from './player/Player';
import { PlayerBullets } from './player/PlayerBullets';
import { AsteroidField } from './enemies/AsteroidField';
import { Explosions } from './effects/Explosions';
import { SciFiRings } from './effects/SciFiRings';
import { ReloadRings } from './effects/ReloadRings';

function CollisionSystem({
  playerPosition,
  onPlayerHit,
}: {
  playerPosition: React.RefObject<THREE.Vector3>;
  onPlayerHit: () => void;
}) {
  useCollisionDetection(playerPosition, onPlayerHit);
  return null;
}

function PauseHandler() {
  const phase = useGameStore((s) => s.phase);
  const pause = useGameStore((s) => s.pause);
  const resume = useGameStore((s) => s.resume);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Escape') {
        if (phase === 'playing') pause();
        else if (phase === 'paused') resume();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [phase, pause, resume]);

  return null;
}

export function Game() {
  const phase = useGameStore((s) => s.phase);
  const playerPositionRef = useRef(new THREE.Vector3(0, 2, 0));
  const triggerShake = useScreenShake();

  useKeyboard();

  const onPlayerHit = useCallback(() => {
    triggerShake(0.8);
  }, [triggerShake]);

  const isActive = phase === 'playing' || phase === 'paused';

  return (
    <>
      <Scene />
      <StarField />
      <PauseHandler />

      {isActive && (
        <>
          <Player positionRef={playerPositionRef} />
          <PlayerBullets playerPosition={playerPositionRef} />
          <AsteroidField playerPosition={playerPositionRef} />
          <SciFiRings playerPosition={playerPositionRef} />
          <ReloadRings playerPosition={playerPositionRef} />
          <Explosions />
          <CollisionSystem
            playerPosition={playerPositionRef}
            onPlayerHit={onPlayerHit}
          />

        </>
      )}
    </>
  );
}
