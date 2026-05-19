import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/Layout.css'
import './styles/Sidebar.css'
import './styles/Focus.css'
import './styles/ConfidenceLog.css'
import './styles/IdentityBuilder.css'
import './styles/ThoughtInterceptor.css'
import './styles/Dashboard.css'
import './styles/FloatingTimer.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
