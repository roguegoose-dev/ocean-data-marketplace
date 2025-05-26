import { useEffect, useState } from 'react'
import { getOceanInstance } from './ocean'
import { connectWallet } from './wallet'

type Props = {
  title: string
  datatokenAddress: string
  ipfsCid: string
}

export default function DatasetViewer({ title, datatokenAddress, ipfsCid }: Props) {
  const [hasAccess, setHasAccess] = useState(false)
  const [wallet, setWallet] = useState('')
  const [status, setStatus] = useState('Checking access...')
  const [price, setPrice] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      const ocean = await getOceanInstance() // This will now correctly return an 'Ocean' instance
      const userWallet = await connectWallet()
      setWallet(userWallet)

      // 1. Check access
      const balance = await ocean.datatokens.balance(datatokenAddress, userWallet)
      setHasAccess(parseFloat(balance) > 0)
      setStatus(parseFloat(balance) > 0 ? '✅ You already have access.' : '❌ You don’t have access yet.')

      // 2. Load price
      const fre = await ocean.fixedRateExchange.searchforDT(datatokenAddress)
      if (fre?.length) setPrice(fre[0].rate)
    }

    init()
  }, [datatokenAddress])

  async function handleBuy() {
    try {
      const ocean = await getOceanInstance()
      await ocean.assets.order(datatokenAddress, wallet)
      setHasAccess(true)
      setStatus('✅ Token purchased! You now have access.')
    } catch (e) {
      console.error(e)
      setStatus('❌ Purchase failed.')
    }
  }

  return (
    <div className="border p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-1">{title}</h2>
      {price && <p className="text-sm text-gray-600 mb-1">Price: <strong>{price} OCEAN</strong></p>}
      <p className="text-sm mb-3">{status}</p>

      {!hasAccess ? (
        <button
          onClick={handleBuy}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Buy Access
        </button>
      ) : (
        <a
          href={`https://gateway.pinata.cloud/ipfs/${ipfsCid}`}
          className="text-green-600 underline mt-2 inline-block"
          target="_blank"
          rel="noopener noreferrer"
        >
          Download Dataset
        </a>
      )}
    </div>
  )
}