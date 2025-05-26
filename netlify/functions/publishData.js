// netlify/functions/publishData.js

const { Ocean, ConfigHelper } = require('@oceanprotocol/lib')

exports.handler = async (event) => {
  try {
    const { title, cid, account } = JSON.parse(event.body)

    const config = new ConfigHelper().getConfig('polygon')
    const ocean = await Ocean.getInstance(config)

    const datatokenAddress = await ocean.assets.create({
      main: {
        type: 'dataset',
        name: title,
        dateCreated: new Date().toISOString(),
        author: 'Goose',
        license: 'CC0: Public Domain',
      },
      additionalInformation: {
        description: 'Published via Netlify Function',
      },
      services: [
        {
          id: '1',
          type: 'access',
          files: [{ type: 'ipfs', url: `https://gateway.pinata.cloud/ipfs/${cid}` }],
          datatokenAddress: '',
          timeout: 0,
        },
      ],
      account,
    })

    return {
      statusCode: 200,
      body: JSON.stringify({ datatokenAddress }),
    }
  } catch (err) {
    console.error(err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to publish dataset' }),
    }
  }
}
