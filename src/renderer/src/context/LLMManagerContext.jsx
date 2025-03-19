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
// Dans votre LLMManagerProvider
  const [conversations, setConversations] = useState(() => {
    const initialConversation = {
      id: Date.now(),
      date: new Date(),
      messages: []
    };
    return [initialConversation];
  });
  const [currentConversationId, setCurrentConversationId] = useState(() => conversations[0].id);
  const [currentLanguage, setCurrentLanguage] = useState('fr')

  const getFormattedConversations = () => {
    return conversations.map(conv => ({
      id: conv.id,
      date: new Date(conv.date).toLocaleString(),
      preview: conv.messages.length > 0
        ? conv.messages.find(m => m.sender === 'user')?.text.substring(0, 30) + '...'
        : 'Nouvelle conversation',
      isActive: conv.id === currentConversationId
    }));
  }


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


  const resetConversation = () => {
    // Vérifier si une conversation vide existe déjà
    const existingEmptyConversation = conversations.find(
      conv => conv.messages.length === 0
    );

    if (existingEmptyConversation) {
      setCurrentConversationId(existingEmptyConversation.id);
      return;
    }

    // Sinon, créer une nouvelle conversation
    const newConversation = {
      id: Date.now(),
      date: new Date(),
      messages: []
    };

    setConversations((prev) => [...prev, newConversation]);
    setCurrentConversationId(newConversation.id);
  };

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

  const addMessageToConversation = (text, sender, images = []) => {
    if (currentConversationId) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id === currentConversationId) {
            // Créer un message avec texte et images
            const newMessage = {
              id: Date.now() + Math.random(),
              sender,
              text,
              timestamp: new Date()
            };

            // Ajouter des images au message si elles existent
            if (images && Array.isArray(images) && images.length > 0) {
              newMessage.images = [...images];
            }

            return {
              ...conv,
              messages: [...conv.messages, newMessage]
            };
          }
          return conv;
        })
      );
    } else {
      // Si aucune conversation active, en créer une nouvelle
      const newConversation = {
        id: Date.now(),
        date: new Date(),
        messages: [
          {
            id: Date.now(),
            sender,
            text,
            images: images && Array.isArray(images) ? [...images] : [],
            timestamp: new Date()
          }
        ]
      };

      setConversations((prev) => [...prev, newConversation]);
      setCurrentConversationId(newConversation.id);
    }
  };


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
    resetConversation, // Expose la méthode pour réinitialiser la conversation
    switchConversation, // Expose la méthode pour changer de conversation
    addContextToModel, // Expose la méthode pour ajouter un contexte
    changeLanguage, // Expose la méthode pour changer de langue
    conversations, // Expose toutes les conversations
    currentConversationId, // Expose l'ID de la conversation active
    currentLanguage,
    addMessageToConversation, // Expose la méthode pour ajouter un message à la conversation
    getFormattedConversations

  }

  return <LLMManagerContext.Provider value={value}>{children}</LLMManagerContext.Provider>
}
