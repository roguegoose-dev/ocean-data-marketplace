import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import DatasetViewer from './DatasetViewer'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_KEY!
)

export default function Marketplace() {
  const [datasets, setDatasets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('datasets').select('*')
      if (error) {
        console.error('Error fetching datasets:', error)
        return
      }
      setDatasets(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading) return <div className="p-8 text-center">Loading marketplace...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold mb-6">🌊 Goose Solutions Marketplace</h1>
      {datasets.length === 0 && (
        <p className="text-center text-gray-500">No datasets available yet.</p>
      )}
      {datasets.map((d, i) => {
        const ipfsCid = d.ipfs_url.replace('https://gateway.pinata.cloud/ipfs/', '')
        return (
          <DatasetViewer
            key={i}
            title={d.title}
            datatokenAddress={d.datatoken}
            ipfsCid={ipfsCid}
          />
        )
      })}
    </div>
  )
}

