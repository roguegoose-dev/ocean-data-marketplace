// File: netlify/functions/publishDataset.js
const { Ocean, ConfigHelper } = require('@oceanprotocol/lib');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);
    const { title, cid, account } = body;

    if (!title || !cid || !account) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: title, cid, account' })
      };
    }

    const config = new ConfigHelper().getConfig('polygon'); // or 'mumbai'
    const ocean = await Ocean.getInstance(config);

    const metadata = {
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      type: 'dataset',
      name: title,
      author: 'Goose Solutions',
      license: 'CC0: Public Domain',
      tags: ['environment', 'data', 'goose']
    };

    const files = [{ type: 'ipfs', url: `ipfs://${cid}` }];

    const datatokenParams = {
      templateIndex: 1,
      name: `${title} Token`,
      symbol: 'GSTKN',
      cap: '1000'
    };

    const service = {
      type: 'access',
      files,
      timeout: 0,
      serviceEndpoint: ocean.provider.url
    };

    const ddo = {
      metadata,
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
      statusCode: 200,
      body: JSON.stringify({
        did: created.id,
        datatokenAddress,
        nftAddress
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
