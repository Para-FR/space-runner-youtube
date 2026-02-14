import { useGameStore } from '../../store/gameStore';

export function AmmoDisplay() {
  const ammo = useGameStore((s) => s.ammo);
  const maxAmmo = useGameStore((s) => s.maxAmmo);
  const ratio = ammo / maxAmmo;

  const barColor =
    ratio > 0.5 ? '#00ffcc' : ratio > 0.2 ? '#ffaa00' : '#ff3333';
  const glowColor =
    ratio > 0.5 ? '#00ffcc' : ratio > 0.2 ? '#ffaa00' : '#ff3333';

  return (
    <div style={styles.container}>
      {/* Label */}
      <div style={styles.label}>AMMO</div>

      {/* Ammo bar frame */}
      <div style={styles.barFrame}>
        {/* Segmented bar */}
        <div style={styles.barTrack}>
          {Array.from({ length: maxAmmo }, (_, i) => (
            <div
              key={i}
              style={{
                ...styles.segment,
                backgroundColor: i < ammo ? barColor : 'rgba(255,255,255,0.05)',
                boxShadow: i < ammo ? `0 0 4px ${glowColor}` : 'none',
              }}
            />
          ))}
        </div>

        {/* Scanning line animation */}
        <div style={styles.scanLine} />
      </div>

      {/* Counter */}
      <div style={{ ...styles.counter, color: barColor, textShadow: `0 0 8px ${glowColor}` }}>
        {ammo.toString().padStart(2, '0')}/{maxAmmo}
      </div>

      {/* Corner decorations */}
      <svg style={styles.cornerTL} width="8" height="8" viewBox="0 0 8 8">
        <path d="M0 8 L0 0 L8 0" stroke="#00ffcc" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
      <svg style={styles.cornerBR} width="8" height="8" viewBox="0 0 8 8">
        <path d="M8 0 L8 8 L0 8" stroke="#00ffcc" strokeWidth="1" fill="none" opacity="0.5" />
      </svg>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    width: 200,
    padding: '10px 14px',
    background: 'rgba(0, 20, 40, 0.7)',
    border: '1px solid rgba(0, 255, 200, 0.15)',
    borderRadius: 4,
    fontFamily: "'Courier New', monospace",
    pointerEvents: 'none',
    zIndex: 10,
  },
  label: {
    fontSize: 10,
    letterSpacing: 4,
    color: 'rgba(0, 255, 200, 0.5)',
    marginBottom: 6,
  },
  barFrame: {
    position: 'relative' as const,
    width: '100%',
    height: 14,
    overflow: 'hidden',
  },
  barTrack: {
    display: 'flex',
    gap: 1.5,
    height: '100%',
    alignItems: 'stretch',
  },
  segment: {
    flex: 1,
    borderRadius: 1,
    transition: 'background-color 0.15s ease, box-shadow 0.15s ease',
  },
  scanLine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,200,0.08) 50%, transparent 100%)',
    animation: 'ammoScan 2s linear infinite',
    pointerEvents: 'none' as const,
  },
  counter: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginTop: 6,
    textAlign: 'right' as const,
  },
  cornerTL: {
    position: 'absolute' as const,
    top: -1,
    left: -1,
  },
  cornerBR: {
    position: 'absolute' as const,
    bottom: -1,
    right: -1,
  },
};
