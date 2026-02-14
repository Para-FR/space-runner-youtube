import { useRef, useEffect, useCallback } from 'react';
import { HandLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import type { NormalizedLandmark } from '@mediapipe/tasks-vision';
import { inputStore } from '../../store/inputStore';

const PREVIEW_WIDTH = 320;
const PREVIEW_HEIGHT = 240;

// Landmark connections for skeleton drawing
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // index
  [5, 9], [9, 10], [10, 11], [11, 12],  // middle
  [9, 13], [13, 14], [14, 15], [15, 16],// ring
  [13, 17], [17, 18], [18, 19], [19, 20],// pinky
  [0, 17],                                // palm
];

function isFist(landmarks: NormalizedLandmark[]): boolean {
  const wrist = landmarks[0];
  if (!wrist) return false;
  const pairs: [number, number][] = [[8, 5], [12, 9], [16, 13], [20, 17]];
  let curledCount = 0;

  for (const [tipIdx, mcpIdx] of pairs) {
    const tip = landmarks[tipIdx];
    const mcp = landmarks[mcpIdx];
    if (!tip || !mcp) continue;
    const tipDist = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
    const mcpDist = Math.hypot(mcp.x - wrist.x, mcp.y - wrist.y);
    if (tipDist < mcpDist * 1.15) curledCount++;
  }

  return curledCount >= 3;
}

export function CameraPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef(0);
  const lastTimeRef = useRef(-1);

  const detect = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }

    const ctx = canvas.getContext('2d')!;
    const now = performance.now();

    // MediaPipe needs strictly increasing timestamps
    if (now <= lastTimeRef.current) {
      rafRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimeRef.current = now;

    const results = landmarker.detectForVideo(video, now);

    // Draw mirrored video
    ctx.save();
    ctx.translate(PREVIEW_WIDTH, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);
    ctx.restore();

    // Semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 10, 20, 0.3)';
    ctx.fillRect(0, 0, PREVIEW_WIDTH, PREVIEW_HEIGHT);

    let rightHand: { x: number; y: number } | null = null;
    let leftFist = false;

    if (results.landmarks && results.handednesses) {
      for (let h = 0; h < results.landmarks.length; h++) {
        const lms = results.landmarks[h];
        const hd = results.handednesses[h];
        if (!lms || !hd || !hd[0]) continue;
        const handedness = hd[0].categoryName;
        // MediaPipe labels from user's perspective
        const isUserRight = handedness === 'Right';
        const fist = isFist(lms);

        if (isUserRight) {
          const palm = lms[9];
          if (palm) rightHand = { x: palm.x, y: palm.y };
        } else {
          leftFist = fist;
        }

        // Draw skeleton on mirrored canvas
        const color = isUserRight
          ? '#00ccff'
          : fist
            ? '#ff3333'
            : '#33ff66';

        // Draw connections
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.7;
        for (const [a, b] of HAND_CONNECTIONS) {
          const la = lms[a!];
          const lb = lms[b!];
          if (!la || !lb) continue;
          const ax = (1 - la.x) * PREVIEW_WIDTH;
          const ay = la.y * PREVIEW_HEIGHT;
          const bx = (1 - lb.x) * PREVIEW_WIDTH;
          const by = lb.y * PREVIEW_HEIGHT;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          ctx.lineTo(bx, by);
          ctx.stroke();
        }

        // Draw landmarks
        ctx.globalAlpha = 1;
        for (const lm of lms) {
          const lx = (1 - lm.x) * PREVIEW_WIDTH;
          const ly = lm.y * PREVIEW_HEIGHT;
          ctx.beginPath();
          ctx.arc(lx, ly, 3, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }

        // Label
        const wrist = lms[0];
        if (wrist) {
          const labelX = (1 - wrist.x) * PREVIEW_WIDTH;
          const labelY = wrist.y * PREVIEW_HEIGHT - 10;
          ctx.font = 'bold 11px Courier New';
          ctx.fillStyle = color;
          ctx.shadowColor = color;
          ctx.shadowBlur = 6;
          const label = isUserRight
            ? 'RIGHT'
            : fist
              ? 'FIST!'
              : 'LEFT';
          ctx.fillText(label, labelX - 18, labelY);
          ctx.shadowBlur = 0;
        }
      }
    }

    // Update input store
    inputStore.setState({
      hand: {
        active: true,
        rightHand,
        leftFist,
      },
    });

    // Border glow when fist detected
    ctx.strokeStyle = leftFist
      ? 'rgba(255, 50, 50, 0.8)'
      : 'rgba(0, 255, 200, 0.3)';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, PREVIEW_WIDTH - 2, PREVIEW_HEIGHT - 2);

    rafRef.current = requestAnimationFrame(detect);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Start camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      const video = videoRef.current!;
      video.srcObject = stream;
      await video.play();

      // Init MediaPipe
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );
      if (cancelled) return;

      const handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
          delegate: 'GPU',
        },
        numHands: 2,
        runningMode: 'VIDEO',
      });
      if (cancelled) return;

      landmarkerRef.current = handLandmarker;
      rafRef.current = requestAnimationFrame(detect);
    }

    init();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
      const video = videoRef.current;
      if (video?.srcObject) {
        (video.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
      // Reset hand tracking state
      inputStore.setState({
        hand: { active: false, rightHand: null, leftFist: false },
      });
    };
  }, [detect]);

  return (
    <div style={styles.container}>
      <div style={styles.label}>&#x1F4F7; HAND TRACKING</div>
      <video
        ref={videoRef}
        style={{ display: 'none' }}
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        width={PREVIEW_WIDTH}
        height={PREVIEW_HEIGHT}
        style={styles.canvas}
      />
      <div style={styles.legend}>
        <span style={{ color: '#00ccff' }}>&#9679; RIGHT: Move</span>
        <span style={{ color: '#33ff66' }}>&#9679; LEFT: Shoot (fist)</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    position: 'absolute',
    top: 20,
    right: 20,
    padding: '8px 10px 6px',
    background: 'rgba(0, 15, 30, 0.7)',
    border: '1px solid rgba(0, 255, 200, 0.2)',
    borderRadius: 6,
    zIndex: 15,
    pointerEvents: 'none',
  },
  label: {
    fontSize: 10,
    letterSpacing: 3,
    color: 'rgba(0, 255, 200, 0.6)',
    fontFamily: "'Courier New', monospace",
    marginBottom: 4,
    textAlign: 'center' as const,
  },
  canvas: {
    display: 'block',
    borderRadius: 3,
  },
  legend: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 4,
    fontSize: 9,
    fontFamily: "'Courier New', monospace",
    letterSpacing: 1,
  },
};
