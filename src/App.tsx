import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './components/Dashboard'
import Focus from './components/Focus'
import ConfidenceLog from './components/ConfidenceLog'
import IdentityBuilder from './components/IdentityBuilder'
import ThoughtInterceptor from './components/ThoughtInterceptor'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="focus" element={<Focus />} />
          <Route path="confidence" element={<ConfidenceLog />} />
          <Route path="identity" element={<IdentityBuilder />} />
          <Route path="thoughts" element={<ThoughtInterceptor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
