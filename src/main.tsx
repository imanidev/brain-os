import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/Layout.css'
import './styles/Sidebar.css'
import './styles/MorningAnchor.css'
import './styles/ConfidenceLog.css'
import './styles/IdentityBuilder.css'
import './styles/ThoughtInterceptor.css'
import './styles/DistractionLog.css'
import './styles/Timer.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
