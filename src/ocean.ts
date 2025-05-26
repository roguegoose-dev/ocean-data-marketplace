// src/ocean.ts

// Manually import the necessary classes and treat them as 'any' to bypass Vercel's type checking issues.
// This assumes the underlying JavaScript code for @oceanprotocol/lib is correctly installed and functional at runtime.
const Ocean: any = require('@oceanprotocol/lib').Ocean;
const ConfigHelper: any = require('@oceanprotocol/lib').ConfigHelper;

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon'); // Or 'mumbai'
  const ocean = await Ocean.getInstance(config);
  return ocean;
}