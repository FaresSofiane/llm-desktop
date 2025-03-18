import './assets/base.css'

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TopBar from './components/topbar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <div className={'w-screen h-screen'}>
      <TopBar />
      <div className={'h-[calc(100vh-2.5rem)] w-screen'}>
        <App />
      </div>
    </div>
  </React.StrictMode>
)
