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
  const [searchTerm, setSearchTerm] = useState('') // ✅ Search term state

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

  const filteredDatasets = datasets.filter((d) => {
    const lower = searchTerm.toLowerCase()
    return (
      d.title.toLowerCase().includes(lower) ||
      d.description?.toLowerCase().includes(lower)
    )
  })

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">🌊 Decentralized Dataset Marketplace (Ocean Protocol)</h1>
          <p className="text-sm text-gray-600 mt-1">Built and managed by Goose Solutions LLC</p>
        </div>
        <button
          onClick={fetchData}
          className="text-sm text-blue-600 underline hover:text-blue-800 mt-4 md:mt-0"
        >
          Refresh
        </button>
      </div>

      {/* ✅ Search Bar */}
      <input
        type="text"
        placeholder="Search datasets by title or description..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded mb-4"
      />

      {error && (
        <p className="text-center text-red-600">{error}</p>
      )}

      {filteredDatasets.length === 0 ? (
        <div className="text-center py-20">
          <h2 className="text-xl font-semibold mb-2">🚫 No matching datasets found</h2>
          <p className="text-gray-600">Try adjusting your search or come back later.</p>
        </div>
      ) : (
        filteredDatasets.map((d, i) => {
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
