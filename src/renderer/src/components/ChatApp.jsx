import Conversation from './Conversation'
import InputBar from './InputBar'
import { useLLMManager } from '../context/LLMManagerContext'
import { useState, useEffect } from 'react'
import ollama from 'ollama'

const ChatApp = () => {
  const { conversations, currentConversationId, loading, addMessageToConversation, selectedModel } = useLLMManager()
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
    const userMessage = { sender: 'me', text: input };

    // Ajout du message utilisateur à la conversation
    addMessageToConversation(input, 'me');

    try {
      // Création d'une réponse vide pour commencer
      let responseText = '';
      setTypingMessage(''); // Réinitialiser le message en cours de frappe

      // Envoie la demande à ollama.chat avec streaming
      const response = await ollama.chat({
        model: selectedModel || 'llama3.1',
        messages: [{ role: 'user', content: input }],
        stream: true
      });

      // Traitement de la réponse en streaming
      for await (const part of response) {
        const newContent = part.message.content;
        responseText += newContent;
        setTypingMessage(responseText); // Mise à jour du message en cours de frappe
      }

      // Une fois la réponse complète reçue, ajouter à la conversation
      addMessageToConversation(responseText, 'assistant');
      setTypingMessage(''); // Réinitialiser le message en cours de frappe
    } catch (error) {
      console.error('Erreur lors de la communication avec Ollama:', error);
      addMessageToConversation("Une erreur est survenue lors de la communication avec le modèle.", "system");
    }
  };

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
