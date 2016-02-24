/* @flow */

export default function clamp(n: number, min: number, max: number): number {
  return Math.max(Math.min(n, max), min);
}
