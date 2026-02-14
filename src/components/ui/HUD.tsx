import { useGameStore } from '../../store/gameStore';

export function HUD() {
  const score = useGameStore((s) => s.score);
  const lives = useGameStore((s) => s.lives);
  const level = useGameStore((s) => s.level);

  return (
    <div style={styles.container}>
      <div style={styles.topBar}>
        <div style={styles.lives}>
          {Array.from({ length: lives }, (_, i) => (
            <span key={i} style={styles.heart}>
              &#9829;
            </span>
          ))}
        </div>
        <div style={styles.level}>LEVEL {level}</div>
        <div style={styles.score}>{score.toString().padStart(8, '0')}</div>
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
    pointerEvents: 'none',
    fontFamily: "'Courier New', monospace",
    color: '#00ffff',
    zIndex: 10,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 30px',
  },
  lives: {
    fontSize: '28px',
    display: 'flex',
    gap: '8px',
  },
  heart: {
    color: '#ff3366',
    textShadow: '0 0 10px #ff3366',
  },
  level: {
    fontSize: '18px',
    letterSpacing: '4px',
    textShadow: '0 0 10px #00ffff',
    opacity: 0.8,
  },
  score: {
    fontSize: '24px',
    letterSpacing: '2px',
    textShadow: '0 0 10px #00ffff',
  },
};
