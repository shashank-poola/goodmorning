import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import { ThemeProvider } from './hooks/ThemeContext'
import { App } from './App'
import logoUrl from './assets/logo.png'

// Dynamically set favicon so the hashed URL is correct in production builds.
;(function setFavicon() {
  const el =
    document.querySelector<HTMLLinkElement>('link#app-favicon') ??
    Object.assign(document.createElement('link'), { id: 'app-favicon' })
  el.rel = 'icon'
  el.type = 'image/png'
  el.href = logoUrl
  document.head.appendChild(el)
})()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
