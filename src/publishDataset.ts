// src/publishDataset.ts

import { Ocean } from '@oceanprotocol/lib'; // Correct: Use 'Ocean' here too
import { getOceanInstance } from './ocean'; // Import your helper function

// These types are NOT exported by @oceanprotocol/lib@4.1.0 directly for DDO/Files
// You should remove direct 'import type { DDO, Files }'
// The library functions will infer the correct types when you pass the objects.

// Assuming you have these variables available when calling publishDataAsset
// Replace 'declare const' with actual function parameters or obtained values.
// export async function publishDataAsset(title: string, cid: string, account: string) {
// For now, I'll keep the placeholders as your original snippet had similar context.

export async function publishDataAsset(title: string, cid: string, account: string) {
  const ocean = await getOceanInstance();

  // DDO Metadata structure for Ocean v4.1.0
  const metadata: any = { // Using 'any' to avoid type errors since DDO type is not exported directly
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    type: 'dataset', // Or 'algorithm', 'container'
    name: title,
    author: 'Goose Solutions',
    license: 'CC0: Public Domain',
    tags: ['environment', 'data', 'goose'],
    // Add more metadata fields as required by your DDO structure
    // e.g., 'description', 'links', 'checksums', etc.
  };

  // Files structure for Ocean v4.1.0
  const files: any[] = [ // Using 'any[]' since Files type is not exported directly
    {
      type: 'ipfs',
      url: `ipfs://${cid}`
    }
  ];

  // Datatoken parameters
  const datatokenParams = {
    templateIndex: 1, // Default template for ERC-20
    name: `${title} Token`,
    symbol: 'GSTKN',
    cap: '1000' // Max supply
  };

  // Service structure for Ocean v4.1.0
  const service: any = { // Using 'any' for simplicity
    type: 'access',
    files: files, // Link to the files array
    timeout: 0, // 0 for infinite
    serviceEndpoint: ocean.provider.url // Use the provider URL for the service endpoint
  };

  // Construct the DDO object
  const ddo: any = { // Using 'any' for simplicity
    metadata: metadata,
    services: [service]
  };

  // Create the asset
  const created = await ocean.assets.create(ddo, account, [datatokenParams]);
  const datatokenAddress = created.services[0].datatokenAddress;
  const nftAddress = created.nftAddress; // The NFT address of the asset

  // Create a fixed rate exchange (listing)
  await ocean.fixedRateExchange.create({
    datatoken: datatokenAddress,
    baseToken: await ocean.datatokens.getAddress('OCEAN'), // Base token (OCEAN)
    owner: account,
    rate: '30', // Price (e.g., 30 OCEAN)
    publishMarketSwapFee: '0', // Swap fee percentage for the market (0% for now)
    marketFeeCollector: account, // Where market fees go
    allowedConsumer: '0x0000000000000000000000000000000000000000' // 0 address for public listing
  });

  return {
    did: created.id, // Decentralized Identifier
    datatokenAddress,
    nftAddress
  };
}