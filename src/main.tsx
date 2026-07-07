import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/global.css'
import { ThemeProvider } from './hooks/ThemeContext'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
