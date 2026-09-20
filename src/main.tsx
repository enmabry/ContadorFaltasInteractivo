import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { registerSW } from 'virtual:pwa-register'
import { GoogleAuthProviderWrapper } from './context/GoogleAuthContext.tsx'

// Auto-register service worker for instant offline availability
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleAuthProviderWrapper>
      <App />
    </GoogleAuthProviderWrapper>
  </StrictMode>,
)
