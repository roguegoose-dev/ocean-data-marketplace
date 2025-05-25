// src/ocean.ts

import { VeOcean, ConfigHelper } from '@oceanprotocol/lib'; // Corrected import: removed 'Ocean'

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Assuming 'polygon' for your network
  const ocean = await VeOcean.getInstance(config);
  return ocean;
}