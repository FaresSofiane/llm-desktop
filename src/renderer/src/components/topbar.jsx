import { useLLMManager } from '../context/LLMManagerContext' // Importez le contexte
import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal'
import { RotateCcw, ChevronDown } from 'lucide-react'
import ollama from 'ollama' // Assurez-vous que cette bibliothèque est correctement importée

import icon from '../assets/icon.png'


Modal.setAppElement('#root') // Nécessaire pour l'accessibilité

const language = {
  en_US: { name: 'English (US)', flag: '🇺🇸' },
  en_UK: { name: 'English (UK)', flag: '🇬🇧' },
  fr: { name: 'Français', flag: '🇫🇷' },
  es: { name: 'Español', flag: '🇪🇸' },
  de: { name: 'Deutsch', flag: '🇩🇪' },
  it: { name: 'Italiano', flag: '🇮🇹' },
  pt: { name: 'Português', flag: '🇧🇷' },
  zh: { name: '中文', flag: '🇨🇳' },
  ja: { name: '日本語', flag: '🇯🇵' },
  ru: { name: 'Русский', flag: '🇷🇺' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  ko: { name: '한국어', flag: '🇰🇷' },
  hi: { name: 'हिंदी', flag: '🇮🇳' }
}

export default function TopBar({ size, platform }) {
  const {
    models,
    selectedModel,
    setSelectedModel,
    resetConversation,
    changeLanguage,
    currentLanguage,
    refreshModels // Méthode pour actualiser les modèles
  } = useLLMManager() // Utilisez le contexte
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des modèles
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des langues
  const [isModalOpen, setIsModalOpen] = useState(false) // État pour gérer l'ouverture du modal
  const [modelName, setModelName] = useState('') // État pour le nom du modèle à installer
  const [progress, setProgress] = useState(0) // État pour la barre de progression
  const [downloadSpeed, setDownloadSpeed] = useState(0) // État pour la vitesse de téléchargement
  const [isInstalling, setIsInstalling] = useState(false) // État pour indiquer si une installation est en cours
  const dropdownRef = useRef(null) // Référence pour détecter les clics en dehors
  const languageDropdownRef = useRef(null) // Référence pour le menu déroulant des langues

  const handleModelSelect = (model) => {
    setSelectedModel(model) // Enregistrez le modèle sélectionné dans le contexte
    setIsModelDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode) // Changez la langue via le contexte
    setIsLanguageDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleInstallModel = async () => {
    if (!modelName) {
      alert('Veuillez entrer un nom de modèle.')
      return
    }

    setIsInstalling(true)
    setProgress(0)
    setDownloadSpeed(0)

    let lastTimestamp = Date.now();
    let lastCompleted = 0;

    try {
      const request = {
        model: modelName,
        insecure: false,
        stream: true
      }

      // Appel à ollama.pull avec callback onProgress
      const response = await ollama.pull(request)

      for await (const part of response) {
        console.log(part);

        // Calculer et mettre à jour la progression
        if (part.total && part.completed) {
          const progressPercentage = Math.floor((part.completed / part.total) * 100);
          setProgress(progressPercentage);

          // Calculer la vitesse de téléchargement
          const currentTime = Date.now();
          const elapsedTime = (currentTime - lastTimestamp) / 1000; // en secondes

          if (elapsedTime > 0) {
            const downloadedBytes = part.completed - lastCompleted;
            const speed = downloadedBytes / elapsedTime; // octets par seconde
            setDownloadSpeed(speed);

            // Mettre à jour les variables pour le prochain calcul
            lastTimestamp = currentTime;
            lastCompleted = part.completed;
          }
        }
      }

      // L'installation est terminée avec succès
      alert(`Le modèle ${modelName} a été installé avec succès.`)
      setModelName('')
      setIsModalOpen(false)
      refreshModels() // Actualiser la liste des modèles disponibles

    } catch (error) {
      console.error("Erreur lors de l'installation du modèle:", error)
      alert("Une erreur est survenue lors de l'installation du modèle.")
    } finally {
      setIsInstalling(false)
      setDownloadSpeed(0)
    }
  }

  // Fermer les dropdowns en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target)
      ) {
        setIsModelDropdownOpen(false)
        setIsLanguageDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Formatage de la vitesse de téléchargement pour l'affichage
  const formatDownloadSpeed = () => {
    if (downloadSpeed < 1024) {
      return `${downloadSpeed.toFixed(1)} o/s`;
    } else if (downloadSpeed < 1024 * 1024) {
      return `${(downloadSpeed / 1024).toFixed(1)} Ko/s`;
    } else {
      return `${(downloadSpeed / (1024 * 1024)).toFixed(1)} Mo/s`;
    }
  }

  return (
    <div className={`w-screen ${size} bg-[#f0f0ef] flex flex-row items-center`}>
      {/* Colonne draggable avec largeur fixe */}
      <div className="flex-none" style={{ width: platform === 'darwin' ? '75px' : '10px' }}></div>
      <div className="flex items-center">
        <img src={icon} alt="App Icon" className="max-h-5 w-auto mx-3" />
      </div>
      {/* Colonne avec le bouton dropdown pour les modèles */}
      <div className="flex-none relative z-50 flex justify-center">
        <button
          className="text-gray-700 px-4 py-2 hover:bg-gray-300 pointer-cursor flex items-center"
          onClick={() => {
            setIsModelDropdownOpen(!isModelDropdownOpen)
            setIsModalOpen(false) // Fermer le modal si ouvert
          }}
          aria-haspopup="true"
          aria-expanded={isModelDropdownOpen}
        >
          <span className="mr-2">
            {selectedModel ? selectedModel.split(':')[0] : 'Choose a Model'}
          </span>
          <ChevronDown size={18} />
        </button>

        <div
          onClick={() => {
            resetConversation()
          }}
          className="flex items-center justify-center p-2 bg-transparent hover:bg-gray-200 "
        >
          <RotateCcw size={18} />
        </div>

        {isModelDropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <ul className="py-1" role="menu">
              {models.models && models.models.length > 0 ? (
                models.models.map((model) => (
                  <li
                    key={model.name}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleModelSelect(model.model)}
                    role="menuitem"
                  >
                    {model.name}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500" role="menuitem">
                  No models available
                </li>
              )}
              <li
                className="px-4 py-2 text-blue-500 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setIsModalOpen(true)
                  setIsModelDropdownOpen(false) // Fermer le dropdown
                }}
                role="menuitem"
              >
                Installer un modèle
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Modal pour installer un modèle */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => !isInstalling && setIsModalOpen(false)}
        className="bg-white rounded-lg p-6 h-80 w-1/2 mx-auto mt-20"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex"
      >
        <h2 className="text-xl font-bold mb-4">Installer un nouveau modèle</h2>
        <input
          type="text"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
          placeholder="Nom du modèle (ex: llama3)"
          className="w-full border rounded p-2 mb-4"
          disabled={isInstalling}
        />

        {isInstalling && (
          <div className="mb-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-sm text-center">{progress}% complété | {formatDownloadSpeed()}</div>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={() => !isInstalling && setIsModalOpen(false)}
            className="px-4 py-2 border rounded hover:bg-gray-100"
            disabled={isInstalling}
          >
            Annuler
          </button>
          <button
            onClick={handleInstallModel}
            className={`px-4 py-2 rounded text-white ${
              isInstalling ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
            }`}
            disabled={isInstalling}
          >
            {isInstalling ? 'Installation en cours...' : 'Installer'}
          </button>
        </div>
      </Modal>

      {/* Bouton pour changer de langue */}
      <div className="flex-none relative z-50 flex justify-center">
        <button
          className="text-gray-700 px-2 py-2 hover:bg-gray-300 pointer-cursor flex items-center"
          onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)} // Basculez l'état du menu déroulant des langues
          aria-haspopup="true"
          aria-expanded={isLanguageDropdownOpen}
        >
          <span className="">{language[currentLanguage]?.flag || '🌐'}</span>
        </button>

        {isLanguageDropdownOpen && (
          <div
            ref={languageDropdownRef}
            className="absolute top-full mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50"
          >
            <ul className="py-1" role="menu">
              {Object.entries(language).map(([code, lang]) => (
                <li
                  key={code}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => handleLanguageSelect(code)}
                  role="menuitem"
                >
                  <span className="mr-2">{lang.flag}</span>
                  {lang.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Colonne qui remplit le reste */}
      <div className={`flex-grow w-[80vw] ${size}`} style={{ WebkitAppRegion: 'drag' }}></div>


    </div>
  )
}
