// src/ocean.ts

import { Ocean, ConfigHelper } from '@oceanprotocol/lib'; // Correct: Use 'Ocean', not 'VeOcean'

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Assuming 'polygon'. Use 'mumbai' for testnet.
  const ocean = await Ocean.getInstance(config); // Correct: Use Ocean.getInstance()
  return ocean;
}