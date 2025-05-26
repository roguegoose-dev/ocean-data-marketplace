// src/ocean.ts

// CORRECT for @oceanprotocol/lib@4.1.0: Use 'Ocean', NOT 'VeOcean'
import { Ocean, ConfigHelper } from '@oceanprotocol/lib';

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Or 'mumbai' for testnet if applicable
  const ocean = await Ocean.getInstance(config); // CORRECT for @oceanprotocol/lib@4.1.0
  return ocean;
}