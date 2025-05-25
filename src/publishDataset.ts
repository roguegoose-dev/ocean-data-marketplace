import { getOceanInstance } from './ocean'
import { MetadataMarket, ServiceAccess } from '@oceanprotocol/lib'

export async function publishDataset(account: string, title: string, cid: string) {
  const ocean = await getOceanInstance()

  const metadata: MetadataMarket = {
    main: {
      name: title,
      type: ServiceAccess,
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

  const service = {
    type: 'access' as ServiceType,
    files: metadata.main.files,
    timeout: 0,
    datatokenOptions: {
      name: `${title} Token`,
      symbol: 'GSTKN',
      cap: '1000',
      amount: '100'
    }
  }

  const asset = await ocean.assets.create(metadata, account, service)
  const datatokenAddress = asset.services[0].datatokenAddress

  const fixedRateParams = {
    datatoken: datatokenAddress,
    baseToken: ocean.datatokens.getAddress('OCEAN'),
    owner: account,
    fixedRate: '30',
    marketFeeCollector: account,
    marketFee: '0'
  }

  await ocean.fixedRateExchange.create(fixedRateParams)

  return {
    asset,
    datatokenAddress
  }
}