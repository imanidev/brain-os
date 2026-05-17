import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MorningAnchor from './components/MorningAnchor'
import ConfidenceLog from './components/ConfidenceLog'
import IdentityBuilder from './components/IdentityBuilder'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MorningAnchor />} />
          <Route path="confidence" element={<ConfidenceLog />} />
          <Route path="identity" element={<IdentityBuilder />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
