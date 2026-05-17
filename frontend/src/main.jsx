import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MeroShareProvider } from './context/MeroShareContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MeroShareProvider>
      <App />
    </MeroShareProvider>
  </StrictMode>,
)
