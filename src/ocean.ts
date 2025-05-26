import { Ocean, ConfigHelper } from '@oceanprotocol/lib'

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon') // or 'mumbai'
  const ocean = await Ocean.getInstance(config)
  return ocean
}
