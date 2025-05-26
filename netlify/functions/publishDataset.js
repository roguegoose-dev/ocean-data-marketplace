import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export default async function handler(req, res) {
  try {
    const { title, cid, account } = req.body

    const config = new ConfigHelper().getConfig('polygon')
    const ocean = await Ocean.getInstance(config)

    const metadata = {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'dataset',
      name: title,
      author: 'Goose Solutions',
      license: 'CC0: Public Domain',
      tags: ['environment', 'data', 'goose'],
    }

    const files = [
      {
        type: 'ipfs',
        url: `ipfs://${cid}`
      }
    ]

    const datatokenParams = {
      templateIndex: 1,
      name: `${title} Token`,
      symbol: 'GSTKN',
      cap: '1000'
    }

    const service = {
      type: 'access',
      files,
      timeout: 0,
      serviceEndpoint: ocean.provider.url
    }

    const ddo = {
      metadata,
      services: [service]
    }

    const created = await ocean.assets.create(ddo, account, [datatokenParams])
    const datatokenAddress = created.services[0].datatokenAddress
    const nftAddress = created.nftAddress

    await ocean.fixedRateExchange.create({
      datatoken: datatokenAddress,
      baseToken: await ocean.datatokens.getAddress('OCEAN'),
      owner: account,
      rate: '30',
      publishMarketSwapFee: '0',
      marketFeeCollector: account,
      allowedConsumer: '0x0000000000000000000000000000000000000000'
    })

    res.status(200).json({
      did: created.id,
      datatokenAddress,
      nftAddress
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to publish dataset.' })
  }
}
