import { createContext, useContext, useState, useEffect } from 'react'
import ollama from 'ollama'

// Créez le contexte
const LLMManagerContext = createContext()

// Créez un hook personnalisé pour utiliser le contexte
export const useLLMManager = () => {
  return useContext(LLMManagerContext)
}

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

// Créez le Provider
export const LLMManagerProvider = ({ children }) => {
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('') // Défaut : modèle valide
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [conversations, setConversations] = useState([]) // Stocke toutes les conversations
  const [currentConversationId, setCurrentConversationId] = useState(null) // ID de la conversation active

  const [currentLanguage, setCurrentLanguage] = useState('fr')

  const fetchModels = async () => {
    setLoading(true)
    setError(null)
    try {
      const modelsList = await ollama.list() // Utilisation directe de ollama.list()
      setModels(modelsList)
    } catch (err) {
      setError('Failed to fetch models')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const askQuestion = async (question) => {
    if (selectedModel === '') {
      throw new Error('Invalid model selected. Please select a valid model.')
    }

    try {
      // Récupérer la conversation active
      const activeConversation = conversations.find((conv) => conv.id === currentConversationId)

      if (!activeConversation) {
        throw new Error('No active conversation found.')
      }

      // Préparation des messages pour le modèle
      const formattedMessages = [
        ...activeConversation.messages.map((msg) => ({
          role: msg.sender === 'me' ? 'user' : 'assistant',
          content: msg.text
        })),
        { role: 'user', content: question }
      ]

      // Appel à ollama.chat
      const response = await ollama.chat({
        model: selectedModel,
        messages: formattedMessages
      })

      // Simuler l'écriture progressive
      let currentText = ''
      for (let i = 0; i < response.message.content.length; i++) {
        currentText += response.message.content[i]
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === currentConversationId
              ? {
                  ...conv,
                  messages: [
                    ...conv.messages.filter((msg) => msg.sender !== 'typing'),
                    { sender: 'typing', text: currentText }
                  ]
                }
              : conv
          )
        )
        await new Promise((resolve) => setTimeout(resolve, 10)) // Délai entre chaque caractère
      }

      // Mise à jour de la conversation active avec le message final
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [
                  ...conv.messages.filter((msg) => msg.sender !== 'typing'),
                  { sender: 'me', text: question },
                  { sender: 'other', text: response.message.content }
                ]
              }
            : conv
        )
      )

      console.log(conversations)

      return response.message.content
    } catch (err) {
      console.error('Failed to ask question:', err)
      throw err
    }
  }

  const resetConversation = () => {
    const newConversation = {
      id: Date.now(), // Utilise un timestamp comme ID unique
      date: new Date(),
      messages: []
    }

    setConversations((prev) => [...prev, newConversation])
    setCurrentConversationId(newConversation.id)
  }

  const switchConversation = (conversationId = null) => {
    if (conversationId) {
      setCurrentConversationId(conversationId)
    } else {
      // Si aucun ID n'est fourni, retourne la dernière conversation
      const lastConversation = conversations[conversations.length - 1]
      if (lastConversation) {
        setCurrentConversationId(lastConversation.id)
      }
    }
  }

  const addContextToModel = (context) => {
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [...conv.messages, { sender: 'context', text: context }]
              }
            : conv
        )
      )
    } else {
      throw new Error('No active conversation to add context to.')
    }
  }

  const changeLanguage = (langCode) => {
    if (!language[langCode]) {
      throw new Error(`Language code ${langCode} is not supported.`)
    }

    setCurrentLanguage(langCode)

    // Ajouter un message contextuel au début de la conversation
    const contextMessage = {
      sender: 'context',
      text: `It is imperative that you respond in ${language[currentLanguage].name}, It's imperative that you answer in Markdown format, with a compulsory main title and a hierarchy of subtitles if necessary. Don't hesitate to use all the MarkDown methods for formatting text and computer code.  .`
    }

    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === currentConversationId
            ? {
                ...conv,
                messages: [contextMessage, ...conv.messages]
              }
            : conv
        )
      )
    } else {
      // Si aucune conversation active, créer une nouvelle conversation avec le message contextuel
      const newConversation = {
        id: Date.now(),
        date: new Date(),
        messages: [contextMessage]
      }
      setConversations((prev) => [...prev, newConversation])
      setCurrentConversationId(newConversation.id)
    }

    console.log(conversations)
  }

  useEffect(() => {
    fetchModels()
    resetConversation() // Initialise une première conversation par défaut
  }, [])

  const value = {
    models,
    selectedModel,
    setSelectedModel, // Expose la méthode pour changer le modèle sélectionné
    loading,
    error,
    refreshModels: fetchModels,
    askQuestion, // Expose la méthode pour poser des questions
    resetConversation, // Expose la méthode pour réinitialiser la conversation
    switchConversation, // Expose la méthode pour changer de conversation
    addContextToModel, // Expose la méthode pour ajouter un contexte
    changeLanguage, // Expose la méthode pour changer de langue
    conversations, // Expose toutes les conversations
    currentConversationId, // Expose l'ID de la conversation active
    currentLanguage
  }

  return <LLMManagerContext.Provider value={value}>{children}</LLMManagerContext.Provider>
}
