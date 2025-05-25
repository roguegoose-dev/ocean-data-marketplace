import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Marketplace from './Marketplace'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/marketplace" element={<Marketplace />} />
    </Routes>
  </BrowserRouter>
)
