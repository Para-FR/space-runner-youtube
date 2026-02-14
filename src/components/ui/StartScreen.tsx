import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const highScore = useGameStore((s) => s.highScore);

  const handleStart = useCallback(() => {
    startGame();
  }, [startGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'Space') {
        handleStart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleStart]);

  return (
    <div style={styles.container} onClick={handleStart}>
      <div style={styles.content}>
        <h1 style={styles.title}>SPACE RUNNER</h1>
        <div style={styles.subtitle}>ASTEROID DESTROYER</div>
        <div style={styles.prompt}>PRESS ENTER OR CLICK TO START</div>
        <div style={styles.controls}>
          <div>WASD / ARROWS - MOVE</div>
          <div>SPACE - SHOOT</div>
          <div>ESC - PAUSE</div>
        </div>
        {highScore > 0 && (
          <div style={styles.highScore}>HIGH SCORE: {highScore}</div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 20,
    background: 'radial-gradient(ellipse at center, rgba(0,10,30,0.7) 0%, rgba(0,0,0,0.9) 100%)',
  },
  content: {
    textAlign: 'center' as const,
    fontFamily: "'Courier New', monospace",
    color: '#00ffff',
  },
  title: {
    fontSize: '64px',
    fontWeight: 'bold',
    letterSpacing: '12px',
    textShadow: '0 0 30px #00ffff, 0 0 60px #0066ff',
    margin: 0,
  },
  subtitle: {
    fontSize: '20px',
    letterSpacing: '8px',
    color: '#ff6600',
    textShadow: '0 0 15px #ff6600',
    marginTop: '10px',
  },
  prompt: {
    fontSize: '18px',
    marginTop: '60px',
    animation: 'pulse 1.5s ease-in-out infinite',
    opacity: 0.9,
    letterSpacing: '3px',
  },
  controls: {
    fontSize: '14px',
    marginTop: '40px',
    lineHeight: '2',
    opacity: 0.6,
    letterSpacing: '2px',
  },
  highScore: {
    fontSize: '16px',
    marginTop: '30px',
    color: '#ffcc00',
    textShadow: '0 0 10px #ffcc00',
    letterSpacing: '3px',
  },
};
