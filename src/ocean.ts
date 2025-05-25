import { VeOcean, ConfigHelper } from '@oceanprotocol/lib' // Removed Ocean, Metadata, ServiceType

export async function getOceanInstance() {
  const config = new ConfigHelper().getConfig('polygon')
  const ocean = await VeOcean.getInstance(config)
  return ocean
}