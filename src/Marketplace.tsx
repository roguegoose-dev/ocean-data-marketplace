import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import DatasetViewer from './DatasetViewer'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
)

type Dataset = {
  title: string
  description?: string
  ipfs_url: string
  datatoken: string
  created_at?: string
}

export default function Marketplace() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from('datasets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching datasets:', error.message)
      setError('Failed to load datasets.')
      return
    }

    setDatasets(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading marketplace...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🌊 Goose Solutions Marketplace</h1>
        <button
          onClick={fetchData}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Refresh
        </button>
      </div>

      {error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      {datasets.length === 0 ? (
        <p className="text-center text-gray-500">No datasets available yet.</p>
      ) : (
        datasets.map((d, i) => {
          const ipfsCid = d.ipfs_url.replace('https://gateway.pinata.cloud/ipfs/', '')
          return (
            <DatasetViewer
              key={i}
              title={d.title}
              datatokenAddress={d.datatoken}
              ipfsCid={ipfsCid}
            />
          )
        })
      )}
    </div>
  )
}
