// Deterministic PRNG to ensure reproducible, high-quality, varied datasets
export function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

// Clamp utility
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Normalize value from [min, max] into [0, 1]
export function normalize(val: number, min: number, max: number): number {
  if (max === min) return 0;
  return clamp((val - min) / (max - min), 0, 1);
}

// One-hot encoder
export function oneHot(index: number, totalClasses: number): number[] {
  const arr = new Array(totalClasses).fill(0);
  if (index >= 0 && index < totalClasses) {
    arr[index] = 1;
  }
  return arr;
}
