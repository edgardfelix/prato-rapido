/*
 * Lightweight canvas confetti (no dependencies): ~150 paper pieces burst up
 * from the medal, flutter with drag and gravity, then fade. One rAF loop,
 * device-pixel-ratio aware (capped at 2) and fully cleaned up on cancel.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  tilt: number;
  tiltSpeed: number;
  width: number;
  height: number;
  color: string;
  round: boolean;
}

interface ConfettiOptions {
  colors: string[];
  /** Burst origin as a fraction of the viewport. */
  origin?: { x: number; y: number };
  count?: number;
  durationMs?: number;
}

const GRAVITY = 900; // px/s²
const DRAG = 1.9; // velocity lost per second (paper flutters down slowly)

export function launchConfetti(
  canvas: HTMLCanvasElement,
  { colors, origin = { x: 0.5, y: 0.32 }, count = 150, durationMs = 3_000 }: ConfettiOptions,
): () => void {
  const context = canvas.getContext('2d');
  if (!context || colors.length === 0) return () => undefined;

  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const resize = () => {
    canvas.width = Math.round(window.innerWidth * ratio);
    canvas.height = Math.round(window.innerHeight * ratio);
  };
  resize();
  window.addEventListener('resize', resize);

  const startX = window.innerWidth * origin.x;
  const startY = window.innerHeight * origin.y;
  const particles: Particle[] = Array.from({ length: count }, (_, index) => {
    // Mostly upwards, fanning out ~70° to each side (narrow phones keep most of the burst on screen).
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;
    const speed = 380 + Math.random() * 560;
    return {
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 14,
      tilt: Math.random() * Math.PI,
      tiltSpeed: 5 + Math.random() * 7,
      width: 6 + Math.random() * 6,
      height: 3 + Math.random() * 5,
      color: colors[index % colors.length] ?? '#10B981',
      round: Math.random() < 0.22,
    };
  });

  // The clock starts on the first frame: a rAF timestamp can be *earlier* than the launch (it is the
  // frame's start time), and a negative step would throw every particle off-screen at once.
  let hasStarted = false;
  let startedAt = 0;
  let lastFrame = 0;
  let frame = 0;

  const draw = (now: number) => {
    if (!hasStarted) {
      hasStarted = true;
      startedAt = now;
      lastFrame = now;
    }
    const dt = Math.min(0.034, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    const elapsed = now - startedAt;
    const fadeStart = durationMs * 0.65;
    const alpha = elapsed < fadeStart ? 1 : Math.max(0, 1 - (elapsed - fadeStart) / (durationMs - fadeStart));

    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.globalAlpha = alpha;

    let visible = 0;
    for (const particle of particles) {
      particle.vx -= particle.vx * DRAG * dt;
      particle.vy -= particle.vy * DRAG * dt;
      particle.vy += GRAVITY * dt;
      particle.x += particle.vx * dt + Math.sin(particle.tilt) * 18 * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
      particle.tilt += particle.tiltSpeed * dt;
      if (particle.y > window.innerHeight + 24) continue;
      visible += 1;

      // Rotation + a vertical "flip" (cos of the tilt) fakes a 3D paper twist.
      const cos = Math.cos(particle.rotation);
      const sin = Math.sin(particle.rotation);
      const flip = Math.cos(particle.tilt);
      context.setTransform(cos * ratio, sin * ratio, -sin * flip * ratio, cos * flip * ratio, particle.x * ratio, particle.y * ratio);
      context.fillStyle = particle.color;
      if (particle.round) {
        context.beginPath();
        context.arc(0, 0, particle.width / 2.6, 0, Math.PI * 2);
        context.fill();
      } else {
        context.fillRect(-particle.width / 2, -particle.height / 2, particle.width, particle.height);
      }
    }

    if (visible > 0 && elapsed < durationMs) {
      frame = requestAnimationFrame(draw);
    } else {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  frame = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener('resize', resize);
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.clearRect(0, 0, canvas.width, canvas.height);
  };
}

/** Theme colors (CSS variables, so both themes match) plus a few festive accents. */
export function readConfettiColors(): string[] {
  const styles = getComputedStyle(document.documentElement);
  const themeColors = ['--pr-primary', '--pr-streak', '--pr-gold', '--pr-water']
    .map((name) => styles.getPropertyValue(name).trim())
    .filter(Boolean);
  return [...themeColors, '#F43F5E', '#A78BFA', '#34D399', '#FBBF24'];
}
