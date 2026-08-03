import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './design-tokens.css' // Global design tokens
import './i18n'
import App from './App.tsx'
import { AuthProvider } from './contexts/AuthContext'

const savedTheme = window.localStorage.getItem('smaj_public_theme')
document.documentElement.dataset.theme = savedTheme === 'dark' ? 'dark' : 'light'

if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

const redirectPath = window.sessionStorage.getItem('smaj_redirect_path')
if (redirectPath) {
  window.sessionStorage.removeItem('smaj_redirect_path')
  window.history.replaceState(null, '', redirectPath)
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
