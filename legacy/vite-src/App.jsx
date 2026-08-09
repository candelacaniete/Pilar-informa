import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import News from './pages/News'
import Guide from './pages/Guide'
import BusinessProfile from './pages/BusinessProfile'
import Events from './pages/Events'
import Promotions from './pages/Promotions'
import MapPage from './pages/MapPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="noticias" element={<News />} />
          <Route path="guia" element={<Guide />} />
          <Route path="negocio/:slug" element={<BusinessProfile />} />
          <Route path="eventos" element={<Events />} />
          <Route path="promociones" element={<Promotions />} />
          <Route path="mapa" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
