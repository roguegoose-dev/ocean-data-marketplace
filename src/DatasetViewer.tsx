import { useEffect, useState } from 'react'
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
    async function checkAccess() {
      const userWallet = await connectWallet()
      setWallet(userWallet)

      const res = await fetch('/.netlify/functions/checkAccess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datatokenAddress, wallet: userWallet })
      })

      const data = await res.json()
      if (res.ok) {
        setHasAccess(data.hasAccess)
        setStatus(data.hasAccess ? '✅ You already have access.' : '❌ You don’t have access yet.')
        setPrice(data.price)
      } else {
        setStatus(`❌ Failed to check access: ${data.error || 'Unknown error'}`)
      }
    }

    checkAccess()
  }, [datatokenAddress])

  async function handleBuy() {
    try {
      setStatus('Purchasing token...')
      const res = await fetch('/.netlify/functions/buyAccess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ datatokenAddress, wallet })
      })

      const data = await res.json()
      if (res.ok) {
        setHasAccess(true)
        setStatus('✅ Token purchased! You now have access.')
      } else {
        throw new Error(data.error || 'Unknown error')
      }
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
