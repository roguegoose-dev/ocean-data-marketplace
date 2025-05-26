// src/publishDataset.ts

import { getOceanInstance } from './ocean';

export async function publishDataAsset(title: string, cid: string, account: string) {
  const ocean = await getOceanInstance(); // This will correctly return an 'Ocean' instance

  const metadata: any = { // Using 'any' for the DDO metadata structure
    created: new Date().toISOString(),
    updated: new Date().toISOString(),
    type: 'dataset',
    name: title,
    author: 'Goose Solutions',
    license: 'CC0: Public Domain',
    tags: ['environment', 'data', 'goose'],
  };

  const files: any[] = [ // Using 'any[]' for the files array
    {
      type: 'ipfs',
      url: `ipfs://${cid}`
    }
  ];

  const datatokenParams = {
    templateIndex: 1,
    name: `${title} Token`,
    symbol: 'GSTKN',
    cap: '1000'
  };

  const service: any = { // Using 'any' for the service object
    type: 'access',
    files: files,
    timeout: 0,
    serviceEndpoint: ocean.provider.url
  };

  const ddo: any = { // Using 'any' for the DDO object
    metadata: metadata,
    services: [service]
  };

  const created = await ocean.assets.create(ddo, account, [datatokenParams]);
  const datatokenAddress = created.services[0].datatokenAddress;
  const nftAddress = created.nftAddress;

  await ocean.fixedRateExchange.create({
    datatoken: datatokenAddress,
    baseToken: await ocean.datatokens.getAddress('OCEAN'),
    owner: account,
    rate: '30',
    publishMarketSwapFee: '0',
    marketFeeCollector: account,
    allowedConsumer: '0x0000000000000000000000000000000000000000'
  });

  return {
    did: created.id,
    datatokenAddress,
    nftAddress
  };
}