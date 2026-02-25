import { SHA256 } from 'crypto-js';

/**
 * Generates a spatiotemporal token.
 * In a real app, latitude/longitude would be quantized into a grid (e.g., 10m x 10m).
 * Time would be quantized into buckets (e.g., 15-minute intervals).
 */
export function generateEncounterToken(lat: number, lon: number, timestamp: number): string {
  // Quantize location to ~10m precision (roughly 4 decimal places)
  const latGrid = Math.round(lat * 10000);
  const lonGrid = Math.round(lon * 10000);
  
  // Quantize time to 15-minute buckets (900,000 ms)
  const timeBucket = Math.floor(timestamp / 900000);
  
  const rawData = `GRID:${latGrid}:${lonGrid}|TIME:${timeBucket}`;
  return SHA256(rawData).toString();
}

/**
 * Simulates a blinded token for PSI.
 * In a real PSI protocol, this would involve asymmetric encryption.
 */
export function blindToken(token: string, secret: string): string {
  return SHA256(token + secret).toString();
}
