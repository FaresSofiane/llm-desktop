import React, { createContext, useState, useContext } from 'react'

// Création du contexte
const ChatContext = createContext()

// Fournisseur de contexte
export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([])

  const handleSendMessage = (text) => {
    if (text.startsWith('/other')) {
      setMessages((prev) => [...prev, { sender: 'other', text: text.replace('/other', '').trim() }])
    } else {
      setMessages((prev) => [...prev, { sender: 'me', text }])
    }
  }

  return (
    <ChatContext.Provider value={{ messages, handleSendMessage }}>
      {children}
    </ChatContext.Provider>
  )
}

// Hook personnalisé pour utiliser le contexte
export const useChat = () => useContext(ChatContext)
// Writed by Sofiane Fares and Galaad Filâtre
