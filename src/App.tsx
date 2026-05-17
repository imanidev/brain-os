import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import MorningAnchor from './components/MorningAnchor'
import ConfidenceLog from './components/ConfidenceLog'
import IdentityBuilder from './components/IdentityBuilder'
import ThoughtInterceptor from './components/ThoughtInterceptor'
import DistractionLog from './components/DistractionLog'
import Timer from './components/Timer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<MorningAnchor />} />
          <Route path="confidence" element={<ConfidenceLog />} />
          <Route path="identity" element={<IdentityBuilder />} />
          <Route path="thoughts" element={<ThoughtInterceptor />} />
          <Route path="distractions" element={<DistractionLog />} />
          <Route path="timer" element={<Timer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
