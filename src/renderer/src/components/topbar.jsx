import { useLLMManager } from '../context/LLMManagerContext' // Importez le contexte
import { useState, useEffect, useRef } from 'react'
import Modal from 'react-modal'
import { RotateCcw, ChevronDown, MessageSquare, Plus } from 'lucide-react'
import ollama from 'ollama' // Assurez-vous que cette bibliothèque est correctement importée
import PropTypes from 'prop-types'

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

TopBar.propTypes = {
  size: PropTypes.string.isRequired,
  platform: PropTypes.string.isRequired
}

export default function TopBar({ size, platform }) {
  const {
    models,
    selectedModel,
    setSelectedModel,
    resetConversation,
    changeLanguage,
    currentLanguage,
    refreshModels, // Méthode pour actualiser les modèles
    conversations, // Liste des conversations disponibles
    currentConversationId, // ID de la conversation actuelle
    switchConversation, // Méthode pour changer de conversation
    createNewConversation // Méthode pour créer une nouvelle conversation
  } = useLLMManager() // Utilisez le contexte

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des modèles
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des langues
  const [isConversationDropdownOpen, setIsConversationDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des conversations
  const [isModalOpen, setIsModalOpen] = useState(false) // État pour gérer l'ouverture du modal
  const [modelName, setModelName] = useState('') // État pour le nom du modèle à installer
  const [progress, setProgress] = useState(0) // État pour la barre de progression
  const [downloadSpeed, setDownloadSpeed] = useState(0) // État pour la vitesse de téléchargement
  const [isInstalling, setIsInstalling] = useState(false) // État pour indiquer si une installation est en cours

  const dropdownRef = useRef(null) // Référence pour détecter les clics en dehors
  const languageDropdownRef = useRef(null) // Référence pour le menu déroulant des langues
  const conversationDropdownRef = useRef(null) // Référence pour le menu déroulant des conversations

  const handleModelSelect = (model) => {
    setSelectedModel(model) // Enregistrez le modèle sélectionné dans le contexte
    setIsModelDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode) // Changez la langue via le contexte
    setIsLanguageDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleConversationSelect = (conversationId) => {
    switchConversation(conversationId) // Changez de conversation via le contexte
    setIsConversationDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleNewConversation = () => {
    resetConversation() // Créer une nouvelle conversation
    setIsConversationDropdownOpen(false) // Fermez le menu déroulant après la création
  }

  const handleInstallModel = async () => {
    if (!modelName) {
      alert('Veuillez entrer un nom de modèle.')
      return
    }

    setIsInstalling(true)
    setProgress(0)
    setDownloadSpeed(0)

    let lastTimestamp = Date.now()
    let lastCompleted = 0

    try {
      const request = {
        model: modelName,
        insecure: false,
        stream: true
      }

      // Appel à ollama.pull avec callback onProgress
      const response = await ollama.pull(request)

      for await (const part of response) {
        console.log(part)

        // Calculer et mettre à jour la progression
        if (part.total && part.completed) {
          const progressPercentage = Math.floor((part.completed / part.total) * 100)
          setProgress(progressPercentage)

          // Calculer la vitesse de téléchargement
          const currentTime = Date.now()
          const elapsedTime = (currentTime - lastTimestamp) / 1000 // en secondes

          if (elapsedTime > 0) {
            const downloadedBytes = part.completed - lastCompleted
            const speed = downloadedBytes / elapsedTime // octets par seconde
            setDownloadSpeed(speed)

            // Mettre à jour les variables pour le prochain calcul
            lastTimestamp = currentTime
            lastCompleted = part.completed
          }
        }
      }

      console.log('Modèle installé avec succès')
      refreshModels() // Rafraîchir la liste des modèles après installation
      setIsInstalling(false)
      setIsModalOpen(false) // Fermer la modale après installation
      setModelName('')
    } catch (error) {
      console.error('Erreur lors de l\'installation du modèle:', error)
      alert(`Erreur lors de l'installation: ${error.message}`)
      setIsInstalling(false)
    }
  }

  // Gestionnaire pour l'ouverture/fermeture du menu déroulant des modèles
  const toggleModelDropdown = () => {
    setIsModelDropdownOpen(!isModelDropdownOpen)
    setIsLanguageDropdownOpen(false)
    setIsConversationDropdownOpen(false)
  }

  // Gestionnaire pour l'ouverture/fermeture du menu déroulant des langues
  const toggleLanguageDropdown = () => {
    setIsLanguageDropdownOpen(!isLanguageDropdownOpen)
    setIsModelDropdownOpen(false)
    setIsConversationDropdownOpen(false)
  }

  // Gestionnaire pour l'ouverture/fermeture du menu déroulant des conversations
  const toggleConversationDropdown = () => {
    setIsConversationDropdownOpen(!isConversationDropdownOpen)
    setIsModelDropdownOpen(false)
    setIsLanguageDropdownOpen(false)
  }

  // Gestionnaire pour l'ouverture du modal d'installation
  const openModal = () => {
    setIsModalOpen(true)
  }

  // Gestionnaire pour la fermeture du modal d'installation
  const closeModal = () => {
    if (!isInstalling) {
      // Empêcher la fermeture pendant l'installation
      setIsModalOpen(false)
      setModelName('')
      setProgress(0)
      setDownloadSpeed(0)
    }
  }

  // Effet pour détecter les clics en dehors du menu déroulant des modèles
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.closest('[data-dropdown="model"]')
      ) {
        setIsModelDropdownOpen(false)
      }

      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target) &&
        !event.target.closest('[data-dropdown="language"]')
      ) {
        setIsLanguageDropdownOpen(false)
      }

      if (
        conversationDropdownRef.current &&
        !conversationDropdownRef.current.contains(event.target) &&
        !event.target.closest('[data-dropdown="conversation"]')
      ) {
        setIsConversationDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Formatage de la vitesse de téléchargement pour l'affichage
  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond >= 1024 * 1024) {
      return `${(bytesPerSecond / (1024 * 1024)).toFixed(2)} MB/s`
    } else if (bytesPerSecond >= 1024) {
      return `${(bytesPerSecond / 1024).toFixed(2)} KB/s`
    } else {
      return `${bytesPerSecond.toFixed(2)} B/s`
    }
  }

  useEffect(() => {

    console.log(conversations)

  }, [conversations])

  // Trouver le nom de la conversation actuelle
  const currentConversationName = conversations?.find(conv => conv.id === currentConversationId)?.name || "Nouvelle conversation"

  return (
    <div
      className={`w-full flex items-center ${size} justify-between px-4 py-2  bg-gray-100  border-b border-gray-300 `}
    >
      {/* Logo et nom de l'application */}
      <div className={`flex items-center space-x-2 ${platform === 'darwin' ? 'ml-16' : ''}`}>
        <img src={icon} alt="Logo" className="w-auto h-5" />
        <h1 className="text-lg font-bold text-gray-800 ">
          AlpagaLLM
        </h1>
      </div>

      <div
        className="h-6 w-full "
        style={{ WebkitAppRegion: 'drag' }}
      ></div>


      {/* Section centrale avec les dropdowns */}
      <div className={`flex items-center space-x-4 ${platform !== 'darwin' ? 'mr-40' : ''}`}>
        {/* Sélecteur de conversation */}
        <div className="relative">
          <button
            data-dropdown="conversation"
            className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-gray-300 bg-white  hover:bg-gray-100 "
            onClick={toggleConversationDropdown}
          >
            <MessageSquare size={16} />
            <span className="text-sm truncate max-w-[150px]">{currentConversationName}</span>
            <ChevronDown size={16} />
          </button>

          {isConversationDropdownOpen && (
            <div
              ref={conversationDropdownRef}
              className="absolute z-10 mt-1 w-56 bg-white  shadow-lg rounded-lg border border-gray-300  max-h-60 overflow-y-auto"
            >
              <ul>
                {conversations &&
                  conversations.map((conversation) => (
                    <li
                      key={conversation.id}
                      className={`px-4 py-2 text-sm hover:bg-gray-100  cursor-pointer ${
                        conversation.id === currentConversationId ? 'bg-blue-100 ' : ''
                      }`}
                      onClick={() => handleConversationSelect(conversation.id)}
                    >
                      {conversation.name || `Conversation ${conversation.id}`}
                    </li>
                  ))}
                <li
                  className="border-t border-gray-300  px-4 py-2 text-sm hover:bg-gray-100  cursor-pointer flex items-center"
                  onClick={handleNewConversation}
                >
                  <Plus size={14} className="mr-2" /> Nouvelle conversation
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Sélecteur de modèle */}
        <div className="relative">
          <button
            data-dropdown="model"
            className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-gray-300  bg-white hover:bg-gray-100 "
            onClick={toggleModelDropdown}
          >
            <span className="text-sm hidden sm:inline">Modèle: </span>
            <span className="text-sm">{selectedModel.split(':')[0] || 'Aucun'}</span>
            <ChevronDown size={16} />
          </button>

          {isModelDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute z-10 mt-1 w-56 bg-white shadow-lg rounded-lg border border-gray-300  max-h-60 overflow-y-auto"
            >
              <ul>
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
                  className="border-t border-gray-300  px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    setIsModelDropdownOpen(false)
                    openModal()
                  }}
                >
                  Installer un nouveau modèle...
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* Sélecteur de langue */}
        <div className="relative">
          <button
            data-dropdown="language"
            className="flex items-center space-x-1 px-3 py-1 rounded-lg border border-gray-300  bg-white  hover:bg-gray-100 "
            onClick={toggleLanguageDropdown}
          >
            <span className="text-sm">{language[currentLanguage]?.flag || '🌐'}</span>
            <ChevronDown size={16} />
          </button>
          {isLanguageDropdownOpen && (
            <div
              ref={languageDropdownRef}
              className="absolute right-0 z-10 mt-1 w-56 bg-white  shadow-lg rounded-lg border border-gray-300  max-h-60 overflow-y-auto"
            >
              <ul>
                {Object.entries(language).map(([code, { name, flag }]) => (
                  <li
                    key={code}
                    className={`px-4 py-2 text-sm hover:bg-gray-100  cursor-pointer ${
                      code === currentLanguage ? 'bg-blue-100 ' : ''
                    }`}
                    onClick={() => handleLanguageSelect(code)}
                  >
                    <span className="mr-2">{flag}</span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Modal pour installer un nouveau modèle */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        overlayClassName="fixed inset-0 bg-black/50 z-40"
        contentLabel="Installer un modèle"
      >
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Installer un modèle</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Nom du modèle:</label>
            <input
              type="text"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="Exemple: llama3:8b"
              className="w-full px-3 py-2 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white "
              disabled={isInstalling}
            />
          </div>

          {isInstalling && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">{progress}%</span>
                <span className="text-sm">{formatSpeed(downloadSpeed)}</span>
              </div>
              <div className="w-full bg-gray-200  rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 rounded-lg bg-gray-300  hover:bg-gray-400 "
              disabled={isInstalling}
            >
              Annuler
            </button>
            <button
              onClick={handleInstallModel}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={isInstalling || !modelName}
            >
              {isInstalling ? 'Installation...' : 'Installer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
// Writed by Sofiane Fares and Galaad Filâtre
