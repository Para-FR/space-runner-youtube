export function spheresIntersect(
  posA: [number, number, number],
  radiusA: number,
  posB: [number, number, number],
  radiusB: number
): boolean {
  const dx = posA[0] - posB[0];
  const dy = posA[1] - posB[1];
  const dz = posA[2] - posB[2];
  return dx * dx + dy * dy + dz * dz < (radiusA + radiusB) ** 2;
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
