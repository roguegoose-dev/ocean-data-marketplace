import { useEffect, useState } from 'react'
import type { DragEvent } from 'react'
import { createClient } from '@supabase/supabase-js'
import { publishDataset } from './publishDataset'
import { connectWallet } from './wallet'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_KEY
)

function App() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return setMessage(`❌ Login failed: ${error.message}`)
    setUser(data.user)
    setMessage('✅ Logged in!')
  }

  const handleSignup = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) return setMessage(`❌ Signup failed: ${error.message}`)
    setUser(data.user)
    setMessage('✅ Signup complete! Check your email to confirm.')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('✅ Logged out.')
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const uploadToPinataAndOcean = async () => {
    if (!title || !description || !file) {
      setMessage('❌ Fill out all fields.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('pinataMetadata', JSON.stringify({ name: title, keyvalues: { description } }))
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }))

    try {
      const pinataRes = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`
        },
        body: formData
      })

      const pinataData = await pinataRes.json()
      if (!pinataRes.ok) {
        setMessage(`❌ Pinata error: ${pinataData.error?.details || pinataData.error || 'Unknown'}`)
        return
      }

      const ipfsCid = pinataData.IpfsHash
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsCid}`

      const account = await connectWallet()
      const { datatokenAddress } = await publishDataset(account, title, ipfsCid)

      await supabase.from('datasets').insert([{
        title,
        description,
        filename: file.name,
        ipfs_url: ipfsUrl,
        datatoken: datatokenAddress,
        user_id: user.id
      }])

      setMessage(`✅ Uploaded & Published!`)
      setTitle('')
      setDescription('')
      setFile(null)
    } catch (err) {
      console.error(err)
      setMessage('❌ Upload failed. See console.')
    }
  }

  return (
    <div className={`${darkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-black'} p-8 max-w-2xl mx-auto`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Goose Admin 🪿</h1>
        <button onClick={() => setDarkMode(!darkMode)} className="text-sm px-3 py-1 border rounded">
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <a href="/marketplace" className="underline text-blue-500 text-sm mb-4 inline-block">🌐 View Public Marketplace</a>

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
        <>
          <div className="mb-6">
            <p className="mb-2">Logged in as <strong>{user.email}</strong></p>
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={handleLogout}>Logout</button>
          </div>

          <div className="space-y-3 mb-6">
            <input className="w-full p-2 border rounded" type="text" placeholder="Dataset Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="w-full p-2 border rounded" placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="w-full p-4 border-2 border-dashed rounded text-center cursor-pointer bg-gray-50 dark:bg-gray-800 hover:border-blue-400"
            >
              {file ? `Selected: ${file.name}` : 'Drag & drop a file here or click below'}
            </div>
            <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full mt-2" />
            <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700" onClick={uploadToPinataAndOcean}>
              Upload & Publish to Ocean
            </button>
          </div>
        </>
      )}

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  )
}

export default App
