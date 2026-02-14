import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Preload } from '@react-three/drei';
import { Game } from './components/Game';
import { HUD } from './components/ui/HUD';
import { AmmoDisplay } from './components/ui/AmmoDisplay';
import { Radar } from './components/ui/Radar';
import { CameraPreview } from './components/ui/CameraPreview';
import { StartScreen } from './components/ui/StartScreen';
import { GameOverScreen } from './components/ui/GameOverScreen';
import { useGameStore } from './store/gameStore';

function LoadingScreen() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#00ffff',
        fontFamily: "'Courier New', monospace",
        fontSize: '20px',
        letterSpacing: '5px',
        zIndex: 30,
      }}
    >
      LOADING...
    </div>
  );
}

function PauseOverlay() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          fontFamily: "'Courier New', monospace",
          color: '#00ffff',
          fontSize: '48px',
          letterSpacing: '10px',
          textShadow: '0 0 20px #00ffff',
        }}
      >
        PAUSED
      </div>
    </div>
  );
}

function GameUI() {
  return (
    <>
      <HUD />
      <AmmoDisplay />
      <Radar />
      <CameraPreview />
    </>
  );
}

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <Suspense fallback={<LoadingScreen />}>
        <Canvas
          camera={{ position: [0, 8, 14], fov: 60, near: 0.1, far: 500 }}
          dpr={[1, 1.5]}
          performance={{ min: 0.5 }}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
        >
          <Game />
          <Preload all />
        </Canvas>
      </Suspense>

      {phase === 'start' && <StartScreen />}
      {(phase === 'playing' || phase === 'paused') && <GameUI />}
      {phase === 'paused' && <PauseOverlay />}
      {phase === 'gameover' && <GameOverScreen />}
    </div>
  );
}
