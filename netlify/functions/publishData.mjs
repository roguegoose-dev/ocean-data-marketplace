import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function handler(event) {
  try {
    const { title, cid, account } = JSON.parse(event.body)

    const config = new ConfigHelper().getConfig('polygon')
    const ocean = await Ocean.getInstance(config)

    const datatokenParams = {
      templateIndex: 1,
      name: `${title} DT`,
      symbol: 'GSTKN',
      cap: '1000'
    }

    const service = {
      type: 'access',
      files: [
        {
          type: 'ipfs',
          url: `ipfs://${cid}`
        }
      ],
      timeout: 0,
      serviceEndpoint: ocean.provider.url
    }

    const ddo = {
      metadata: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
        type: 'dataset',
        name: title,
        author: 'Goose',
        license: 'CC0: Public Domain',
        tags: ['environment', 'data', 'goose']
      },
      services: [service]
    }

    const created = await ocean.assets.create(ddo, account, [datatokenParams])
    const datatokenAddress = created.services[0].datatokenAddress

    return {
      statusCode: 200,
      body: JSON.stringify({ datatokenAddress })
    }
  } catch (err) {
    console.error('[Netlify] Ocean publish failed:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Unknown error' })
    }
  }
}
