// src/ocean.ts
import { ConfigHelper } from '@oceanprotocol/lib';
const Ocean: any = require('@oceanprotocol/lib').Ocean; // Use require and treat as any

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Or 'mumbai'
  const ocean = await Ocean.getInstance(config);
  return ocean;
}