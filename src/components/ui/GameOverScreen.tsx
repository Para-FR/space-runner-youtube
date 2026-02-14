import { useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import { resetEntities } from '../../store/entityStore';

export function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const highScore = useGameStore((s) => s.highScore);
  const level = useGameStore((s) => s.level);
  const startGame = useGameStore((s) => s.startGame);

  const handleRestart = useCallback(() => {
    resetEntities();
    startGame();
  }, [startGame]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'KeyR') {
        handleRestart();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleRestart]);

  const isNewHighScore = score >= highScore && score > 0;

  return (
    <div style={styles.container} onClick={handleRestart}>
      <div style={styles.content}>
        <h1 style={styles.title}>GAME OVER</h1>
        {isNewHighScore && (
          <div style={styles.newRecord}>NEW HIGH SCORE!</div>
        )}
        <div style={styles.stats}>
          <div style={styles.statRow}>
            <span>SCORE</span>
            <span>{score}</span>
          </div>
          <div style={styles.statRow}>
            <span>LEVEL</span>
            <span>{level}</span>
          </div>
          <div style={styles.statRow}>
            <span>BEST</span>
            <span>{highScore}</span>
          </div>
        </div>
        <div style={styles.prompt}>PRESS ENTER OR CLICK TO RESTART</div>
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
    background: 'radial-gradient(ellipse at center, rgba(30,0,0,0.8) 0%, rgba(0,0,0,0.95) 100%)',
  },
  content: {
    textAlign: 'center' as const,
    fontFamily: "'Courier New', monospace",
    color: '#ff3333',
  },
  title: {
    fontSize: '56px',
    fontWeight: 'bold',
    letterSpacing: '10px',
    textShadow: '0 0 30px #ff0000, 0 0 60px #990000',
    margin: 0,
  },
  newRecord: {
    fontSize: '22px',
    color: '#ffcc00',
    textShadow: '0 0 20px #ffcc00',
    marginTop: '15px',
    letterSpacing: '5px',
  },
  stats: {
    marginTop: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
  },
  statRow: {
    display: 'flex',
    justifyContent: 'space-between',
    width: '250px',
    margin: '0 auto',
    fontSize: '20px',
    color: '#cccccc',
    letterSpacing: '3px',
  },
  prompt: {
    fontSize: '16px',
    marginTop: '50px',
    color: '#00ffff',
    opacity: 0.8,
    letterSpacing: '3px',
  },
};
