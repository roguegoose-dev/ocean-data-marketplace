import { getOceanInstance } from './ocean'
import {
  Metadata,
  ServiceType,
  FreCreationParams
} from '@oceanprotocol/lib'

export async function publishDataset(account: string, title: string, cid: string) {
  const ocean = await getOceanInstance()

  const metadata: Metadata = {
    main: {
      name: title,
      type: 'dataset',
      dateCreated: new Date().toISOString(),
      author: 'Goose Solutions',
      license: 'CC0: Public Domain',
      files: [
        {
          index: 0,
          contentType: 'application/json',
          url: `ipfs://${cid}`
        }
      ]
    },
    additionalInformation: {
      description: 'Environmental dataset from Goose Solutions.',
      tags: ['environment', 'data', 'goose']
    }
  }

  // Step 1: Create the asset (NFT + datatoken)
  const asset = await ocean.assets.create(metadata, account, {
    type: 'access' as ServiceType,
    files: metadata.main.files,
    timeout: 0,
    datatokenOptions: {
      name: `${title} Token`,
      symbol: 'GSTKN',
      cap: '1000',
      amount: '100'
    }
  })

  const datatokenAddress = asset.services[0].datatokenAddress

  // Step 2: Set price via Fixed Rate Exchange (1 OCEAN per token)
  const fixedRateParams: FreCreationParams = {
  datatoken: datatokenAddress,
  baseToken: ocean.datatokens.getAddress('OCEAN'),
  owner: account,
  fixedRate: '30', // <--- $10+ USD equivalent
  marketFeeCollector: account,
  marketFee: '0'
}


  await ocean.fixedRateExchange.create(fixedRateParams)

  return {
  asset,
  datatokenAddress
}


