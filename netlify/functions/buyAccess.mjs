// netlify/functions/buyAccess.mjs
import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function handler(event) {
  try {
    const { datatokenAddress, wallet } = JSON.parse(event.body)

    const config = new ConfigHelper().getConfig('polygon')
    const ocean = await Ocean.getInstance(config)

    const tx = await ocean.assets.order(datatokenAddress, wallet)

    return {
      statusCode: 200,
      body: JSON.stringify({ tx })
    }
  } catch (err) {
    console.error('[buyAccess] Error:', err)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to buy access' })
    }
  }
}
