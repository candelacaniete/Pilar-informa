import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import News from './pages/News'
import NewsArticle from './pages/NewsArticle'
import Guide from './pages/Guide'
import Category from './pages/Category'
import BusinessProfile from './pages/BusinessProfile'
import Events from './pages/Events'
import EventDetail from './pages/EventDetail'
import Promotions from './pages/Promotions'
import MapPage from './pages/MapPage'
import Faq from './pages/Faq'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="noticias" element={<News />} />
          <Route path="noticias/:slug" element={<NewsArticle />} />
          <Route path="guia" element={<Guide />} />
          <Route path="categoria/:slug" element={<Category />} />
          <Route path="negocio/:slug" element={<BusinessProfile />} />
          <Route path="eventos" element={<Events />} />
          <Route path="eventos/:slug" element={<EventDetail />} />
          <Route path="promociones" element={<Promotions />} />
          <Route path="preguntas-frecuentes" element={<Faq />} />
          <Route path="mapa" element={<MapPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
