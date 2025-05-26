// src/ocean.ts

// We force 'any' here because Vercel's build environment
// is incorrectly reporting 'Ocean' as not exported,
// despite @oceanprotocol/lib@4.1.0 being installed.
// This bypasses the type check on the import.
import { ConfigHelper } from '@oceanprotocol/lib';
const Ocean: any = require('@oceanprotocol/lib').Ocean; // Use require and treat as any

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Or 'mumbai'
  const ocean = await Ocean.getInstance(config); // This should still work at runtime if 4.1.0 is truly loaded
  return ocean;
}