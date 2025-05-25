import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function getOceanInstance(): Promise<Ocean> {
  const config = new ConfigHelper().getConfig('polygon') // Use 'mumbai' for testnet
  const ocean = await Ocean.getInstance(config)
  return ocean
}
