import { Ocean, ConfigHelper, ServiceType } from '@oceanprotocol/lib'
import { Metadata } from '@oceanprotocol/lib/dist/node/@types'

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon') // Or 'mumbai' for testnet
  const ocean = await Ocean.getInstance(config)
  return ocean
}
