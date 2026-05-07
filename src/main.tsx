import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './pages/App'
import Navbar from './components/Navbar'
import Page1 from './pages/page1'
import Page2 from './pages/page2'
import Page3 from './pages/page3'
import Page4 from './pages/page4'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div style={{ marginLeft: '72px' }}>
        {children}
      </div>
    </>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Página de inicio — sin navbar */}
        <Route path="/" element={<App />} />

        {/* Juegos — con navbar */}
        <Route path="/page1" element={<Layout><Page1 /></Layout>} />
        <Route path="/page2" element={<Layout><Page2 /></Layout>} />
        <Route path="/page3" element={<Layout><Page3 /></Layout>} />
        <Route path="/page4" element={<Layout><Page4 /></Layout>} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)