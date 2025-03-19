import Conversation from './Conversation'
import InputBar from './InputBar'
import { useLLMManager } from '../context/LLMManagerContext'
import { useState, useEffect } from 'react'
import ollama from 'ollama'

const ChatApp = () => {
  const { conversations, currentConversationId, loading, addMessageToConversation, selectedModel } =
    useLLMManager()
  const [localMessages, setLocalMessages] = useState([])
  const [typingMessage, setTypingMessage] = useState('') // État pour le texte en cours d'écriture

  const [isLoading, setIsLoading] = useState(false)
  // Met à jour les messages locaux lorsque la conversation active change
  useEffect(() => {
    const activeConversation = conversations.find((conv) => conv.id === currentConversationId)
    if (activeConversation) {
      setLocalMessages(activeConversation.messages)
    }
  }, [conversations, currentConversationId])

  const handleSendMessage = async (messageData) => {
    // Extraction du texte et des images depuis messageData
    const { text, images = [] } = messageData

    setIsLoading(true) // Indiquer que le chargement est en cours

    // Ajout du message utilisateur à la conversation
    addMessageToConversation(text, 'me', images)

    console.log(conversations)

    try {
      // Création d'une réponse vide pour commencer
      let responseText = ''
      setTypingMessage('') // Réinitialiser le message en cours de frappe

      // Préparer le message à envoyer à l'API
      const userMessage = {
        role: 'user',
        content: text
      }

      // Si des images sont présentes, les ajouter au message
      if (images && images.length > 0) {
        // Ollama prend en charge les images dans le format suivant
        userMessage.images = images
      }

      // Envoie la demande à ollama.chat avec streaming
      const response = await ollama.chat({
        model: selectedModel || 'llama3.1',
        messages: [userMessage],
        stream: true
      })

      // Traitement de la réponse en streaming
      for await (const part of response) {
        const newContent = part.message.content
        responseText += newContent
        setTypingMessage(responseText) // Mise à jour du message en cours de frappe
      }

      // Une fois la réponse complète reçue, ajouter à la conversation
      addMessageToConversation(responseText, selectedModel, images)

      console.log(typingMessage)
      setTypingMessage('') // Réinitialiser le message en cours de frappe
    } catch (error) {
      console.error('Erreur lors de la communication avec Ollama:', error)
      addMessageToConversation(
        'Une erreur est survenue lors de la communication avec le modèle.',
        'system'
      )
      setIsLoading(false) // Indiquer que le chargement est en cours
    } finally {
      setIsLoading(false) // Indiquer que le chargement est terminé
    }
  }

  return (
    <div className="flex flex-col h-[90vh]">
      <Conversation
        messages={localMessages}
        isLoading={isLoading}
        typingMessage={typingMessage} // Passer le texte en cours d'écriture
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-2/3">
        <InputBar onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default ChatApp
