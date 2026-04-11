import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import Page1 from './pages/page1'
import Page2 from './pages/page2'
import Page3 from './pages/page3'
import Page4 from './pages/page4'
import Navbar from './components/Navbar'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Navbar />
      <div style={{ marginLeft: '72px' }}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/pages/page1" element={<Page1 />} />
          <Route path="/pages/page2" element={<Page2 />} />
          <Route path="/pages/page3" element={<Page3 />} />
          <Route path="/pages/page4" element={<Page4 />} />
        </Routes>
      </div>
    </BrowserRouter>
  </StrictMode>
)
