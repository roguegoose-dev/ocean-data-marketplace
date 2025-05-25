
import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon') // Or 'mumbai' for testnet
  const ocean = await Ocean.getInstance(config)
  return ocean
}
