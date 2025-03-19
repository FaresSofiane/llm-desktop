import Conversation from './Conversation'
import InputBar from './InputBar'
import { useLLMManager } from '../context/LLMManagerContext'
import { useState, useEffect } from 'react'

const ChatApp = () => {
  const { askQuestion, conversations, currentConversationId, loading } = useLLMManager()
  const [localMessages, setLocalMessages] = useState([])
  const [typingMessage, setTypingMessage] = useState('') // État pour le texte en cours d'écriture

  // Met à jour les messages locaux lorsque la conversation active change
  useEffect(() => {
    const activeConversation = conversations.find((conv) => conv.id === currentConversationId)
    if (activeConversation) {
      setLocalMessages(activeConversation.messages)
    }
  }, [conversations, currentConversationId])

  const handleSendMessage = async (input) => {
    const userMessage = { sender: 'me', text: input }
    setLocalMessages((prevMessages) => [...prevMessages, userMessage])

    try {
      setTypingMessage('') // Réinitialiser le texte en cours d'écriture
      await askQuestion(input) // Pose la question via le contexte

      // La réponse sera automatiquement ajoutée via le contexte, donc pas besoin de la gérer ici
      setTypingMessage('') // Effacer le texte en cours d'écriture
    } catch (error) {
      console.error('Error while sending message:', error)
      const errorMessage = {
        sender: 'system',
        text: `Erreur : ${error.message || 'Une erreur est survenue.'}`,
        isError: true
      }
      setLocalMessages((prevMessages) => [...prevMessages, errorMessage])
    }
  }

  return (
    <div className="flex flex-col h-[80vh]">
      <Conversation
        messages={localMessages}
        isLoading={loading}
        typingMessage={typingMessage} // Passer le texte en cours d'écriture
      />
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-2/3">
        <InputBar onSendMessage={handleSendMessage} isLoading={loading} />
      </div>
    </div>
  )
}

export default ChatApp
