import { useLLMManager } from '../context/LLMManagerContext' // Importez le contexte
import { useState, useEffect, useRef } from 'react'

import { RotateCcw, ChevronDown } from 'lucide-react'

export default function TopBar({ size, platform }) {
  const {
    models,
    selectedModel,
    setSelectedModel,
    resetConversation,
    changeLanguage,
    currentLanguage
  } = useLLMManager() // Utilisez le contexte
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des modèles
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false) // État pour gérer l'ouverture du menu déroulant des langues
  const dropdownRef = useRef(null) // Référence pour détecter les clics en dehors
  const languageDropdownRef = useRef(null) // Référence pour le menu déroulant des langues

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

  const handleModelSelect = (model) => {
    setSelectedModel(model) // Enregistrez le modèle sélectionné dans le contexte
    setIsModelDropdownOpen(false) // Fermez le menu déroulant après la sélection
  }

  const handleLanguageSelect = (langCode) => {
    changeLanguage(langCode) // Changez la langue via le contexte
    setIsLanguageDropdownOpen(false) // Fermez le menu déroulant après la sélection
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

  return (
    <div className={`w-screen ${size} bg-[#f0f0ef] flex flex-row items-center`}>
      {/* Colonne draggable avec largeur fixe */}
      <div className="flex-none" style={{ width: platform === 'darwin' ? '75px' : '10px' }}></div>
      {/* Colonne avec le bouton dropdown pour les modèles */}
      <div className="flex-none relative z-50 flex justify-center">
        <button
          className="text-gray-700 px-4 py-2 hover:bg-gray-300 pointer-cursor flex items-center"
          onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
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
            </ul>
          </div>
        )}
      </div>

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
