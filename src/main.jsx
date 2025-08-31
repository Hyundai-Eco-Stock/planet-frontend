import './main.css'

// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './App.jsx'
import { initializeForegroundMessaging } from './firebase-init.js'

// 포그라운드 리스너 초기화
initializeForegroundMessaging();

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  // </StrictMode>,
)