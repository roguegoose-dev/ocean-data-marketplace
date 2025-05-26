import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function handler(event) {
  try {
    const { datatokenAddress, wallet } = JSON.parse(event.body)

    const config = new ConfigHelper().getConfig('polygon')
    const ocean = await Ocean.getInstance(config)

    const balance = await ocean.datatokens.balance(datatokenAddress, wallet)
    const fre = await ocean.fixedRateExchange.searchforDT(datatokenAddress)
    const price = fre.length ? fre[0].rate : null

    return {
      statusCode: 200,
      body: JSON.stringify({
        hasAccess: parseFloat(balance) > 0,
        price
      })
    }
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || 'Failed to check access' })
    }
  }
}
