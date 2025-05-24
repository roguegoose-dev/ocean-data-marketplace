import { useEffect, useState, DragEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabase setup
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [uploads, setUploads] = useState<{ title: string; description: string; url: string }[]>([])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const fetchUploads = async () => {
    const { data, error } = await supabase
      .from('datasets')
      .select('title, description, ipfs_url')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch uploads:', error)
      return
    }

    const formatted = data.map((item: any) => ({
      title: item.title,
      description: item.description,
      url: item.ipfs_url
    }))

    setUploads(formatted)
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) fetchUploads()
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null
      setUser(user)
      if (user) fetchUploads()
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const uploadToPinata = async () => {
    if (!title || !description || !file) {
      setMessage('❌ Please fill out all fields.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    formData.append('pinataMetadata', JSON.stringify({
      name: title,
      keyvalues: { description }
    }))
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`
        },
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
        setMessage(`✅ Upload successful! IPFS Link: ${ipfsUrl}`)

        await supabase.from('datasets').insert([{
          title,
          description,
          filename: file.name,
          ipfs_url: ipfsUrl
        }])

        fetchUploads()
        setTitle('')
        setDescription('')
        setFile(null)
      } else {
        setMessage(`❌ Upload failed: ${result.error?.details || result.error || 'Unknown error'}`)
      }
    } catch (err) {
      console.error(err)
      setMessage('❌ Upload failed. See console.')
    }
  }

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMessage(`❌ Login failed: ${error.message}`)
    setUser(data.user)
    setMessage('✅ Logged in!')
    fetchUploads()
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setMessage(`❌ Signup failed: ${error.message}`)
    setUser(data.user)
    setMessage('✅ Signup complete! Check your email to confirm.')
    fetchUploads()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setUploads([])
    setMessage('✅ Logged out.')
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'} p-8 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">🌊 Ocean Data Marketplace</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="text-sm px-3 py-1 border rounded">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      {!user ? (
        <div className="space-y-2 mb-6">
          <input className="w-full p-2 border rounded" type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
          <input className="w-full p-2 border rounded" type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
          <div className="flex gap-2">
            <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleLogin}>Login</button>
            <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleSignup}>Sign Up</button>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <p className="mb-2">Logged in as: <strong>{user.email}</strong></p>
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {user && (
        <div className="space-y-3 mb-6">
          <input className="w-full p-2 border rounded" type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="w-full p-4 border-2 border-dashed rounded text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-blue-400"
          >
            {file ? `Selected: ${file.name}` : 'Drag & drop a file here or click below'}
          </div>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mt-2" />
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={uploadToPinata}>Upload</button>
        </div>
      )}

      {message && <p className="mt-4 text-sm">{message}</p>}

      {uploads.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">📁 Uploaded Datasets</h2>
          <input
            className="w-full p-2 border rounded mb-4"
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {uploads
            .filter(item =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item, index) => (
              <div key={index} className="border rounded p-4 mb-4 shadow">
                <strong className="block text-lg font-medium">{item.title}</strong>
                <p className="text-sm">{item.description}</p>
                <a className="text-blue-600 underline mt-1 inline-block" href={item.url} target="_blank" rel="noopener noreferrer">🔗 View on IPFS</a>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

export default App
