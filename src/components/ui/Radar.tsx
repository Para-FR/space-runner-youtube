import { useRef, useEffect, useCallback } from 'react';
import { entityStore } from '../../store/entityStore';
import { playerPositionGlobal } from '../../store/inputStore';
import { RADAR } from '../../utils/constants';

export function Radar() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = RADAR.SIZE;
    const half = size / 2;
    const range = RADAR.RANGE;
    const pp = playerPositionGlobal;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Background circle
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 15, 30, 0.8)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Grid rings
    for (let r = 1; r <= 3; r++) {
      ctx.beginPath();
      ctx.arc(half, half, (half - 2) * (r / 3), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // Cross lines
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.08)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(half, 2);
    ctx.lineTo(half, size - 2);
    ctx.moveTo(2, half);
    ctx.lineTo(size - 2, half);
    ctx.stroke();

    // Sweep line (rotating)
    const sweepAngle = (Date.now() / 1500) % (Math.PI * 2);
    ctx.beginPath();
    ctx.moveTo(half, half);
    ctx.lineTo(
      half + Math.cos(sweepAngle) * (half - 2),
      half + Math.sin(sweepAngle) * (half - 2)
    );
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sweep trail (fading arc)
    const gradient = ctx.createConicGradient(sweepAngle - 0.8, half, half);
    gradient.addColorStop(0, 'rgba(0, 255, 200, 0)');
    gradient.addColorStop(0.12, 'rgba(0, 255, 200, 0.06)');
    gradient.addColorStop(0.13, 'rgba(0, 255, 200, 0)');
    ctx.beginPath();
    ctx.arc(half, half, half - 2, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Map world coords to radar: X maps to radar X, Z maps to radar Y (inverted)
    const toRadar = (wx: number, wz: number): [number, number] => {
      const dx = wx - pp.x;
      const dz = wz - pp.z;
      const rx = half + (dx / range) * (half - 6);
      const ry = half + (dz / range) * (half - 6); // +Z = toward player = down on radar
      return [rx, ry];
    };

    // Draw asteroids
    const { asteroids } = entityStore.getState();
    for (const a of asteroids) {
      if (!a.active) continue;
      const [rx, ry] = toRadar(a.position[0], a.position[2]);
      // Only draw if within radar circle
      const dist = Math.sqrt((rx - half) ** 2 + (ry - half) ** 2);
      if (dist > half - 4) continue;

      const dotSize = Math.max(1.5, (a.radius / 5) * 3);
      ctx.beginPath();
      ctx.arc(rx, ry, dotSize, 0, Math.PI * 2);
      ctx.fillStyle = '#ff4444';
      ctx.shadowColor = '#ff4444';
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Draw player (center)
    ctx.beginPath();
    ctx.moveTo(half, half - 5);
    ctx.lineTo(half - 3.5, half + 3);
    ctx.lineTo(half + 3.5, half + 3);
    ctx.closePath();
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer frame glow
    ctx.beginPath();
    ctx.arc(half, half, half - 1, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 200, 0.15)';
    ctx.lineWidth = 2;
    ctx.stroke();

    rafRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return (
    <div style={styles.container}>
      <div style={styles.label}>&#x25C9; RADAR</div>
      <canvas
        ref={canvasRef}
        width={RADAR.SIZE}
        height={RADAR.SIZE}
        style={styles.canvas}
      />
      {/* Corner accents */}
      <svg style={styles.cornerTL} width="10" height="10" viewBox="0 0 10 10">
        <path d="M0 10 L0 0 L10 0" stroke="#00ffcc" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
      <svg style={styles.cornerTR} width="10" height="10" viewBox="0 0 10 10">
        <path d="M0 0 L10 0 L10 10" stroke="#00ffcc" strokeWidth="1" fill="none" opacity="0.4" />
      </svg>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    padding: '8px 10px 10px',
    background: 'rgba(0, 15, 30, 0.6)',
    border: '1px solid rgba(0, 255, 200, 0.15)',
    borderRadius: 6,
    pointerEvents: 'none',
    zIndex: 10,
  },
  label: {
    fontSize: 10,
    letterSpacing: 4,
    color: 'rgba(0, 255, 200, 0.5)',
    fontFamily: "'Courier New', monospace",
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  canvas: {
    display: 'block',
    borderRadius: '50%',
  },
  cornerTL: {
    position: 'absolute' as const,
    top: -1,
    left: -1,
  },
  cornerTR: {
    position: 'absolute' as const,
    top: -1,
    right: -1,
  },
};
