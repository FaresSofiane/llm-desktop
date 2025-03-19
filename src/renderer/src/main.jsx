import './assets/base.css'

import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import TopBar from './components/topbar'
import { LLMManagerProvider } from './context/LLMManagerContext'

const Main = () => {
  const [platform, setPlatform] = useState('')
  const [size, setSize] = useState('h-8')

  useEffect(() => {
    // Vérifiez si window.electron est disponible
    if (window.electron && window.electron.ipcRenderer) {
      // Fetch the platform using the exposed API
      window.electron.ipcRenderer.invoke('electron:platform', '').then((re) => {
        setPlatform(re)
      })
    }
  }, []) // Exécuter une seule fois au montage du composant

  useEffect(() => {
    // Mettre à jour la taille en fonction de la plateforme
    if (platform === 'darwin') {
      setSize('h-10')
    } else {
      setSize('h-8')
    }
  }, [platform]) // Exécuter uniquement lorsque platform change

  return (
    <div className="w-screen h-screen">
      <TopBar size={size} platform={platform} />
      <div className={`h-[calc(100vh-${size === 'h-10' ? '3rem' : '2.5rem'})] w-screen`}>
        <App />
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LLMManagerProvider>
      <Main />
    </LLMManagerProvider>
  </React.StrictMode>
)
// Writed by Sofiane Fares and Galaad Filâtre
