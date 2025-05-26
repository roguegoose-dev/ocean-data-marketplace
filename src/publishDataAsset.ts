import { getOceanInstance } from './ocean'

export async function publishDataAsset(title: string, cid: string, account: string) {
  const ocean = await getOceanInstance()

  const metadata = {
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

  const service = {
    type: 'access',
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

  await ocean.fixedRateExchange.create({
    datatoken: datatokenAddress,
    baseToken: ocean.datatokens.getAddress('OCEAN'),
    owner: account,
    fixedRate: '30',
    marketFeeCollector: account,
    marketFee: '0'
  })

  return {
    asset,
    datatokenAddress
  }
}
