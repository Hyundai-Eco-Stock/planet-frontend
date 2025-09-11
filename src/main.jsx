import './main.css'

import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
  ScrollRestoration,
} from 'react-router-dom'

import App from './App.jsx'
import { initializeForegroundMessaging } from './firebase-init.js'

// 포그라운드 리스너 초기화
initializeForegroundMessaging()

// Data Router 구성
const router = createBrowserRouter([
  {
    path: '/*',
    element: (
      <>
        <ScrollRestoration />
        <App />
      </>
    ),
  },
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)