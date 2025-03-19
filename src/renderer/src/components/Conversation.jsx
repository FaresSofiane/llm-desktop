import React, { useEffect, useRef } from 'react'

import Markdown from 'react-markdown'

const Conversation = ({ messages, isLoading, typingMessage }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage]) // Inclure typingMessage pour scroller automatiquement

  // Fonction pour détecter les blocs de code

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter((msg) => msg.sender !== 'context') // Filtrer les messages dont le sender est 'context'
          .map((msg, index) => (
            <div
              key={index}
              className={`max-w-2xl p-3 rounded-lg animate-fade-in ${
                msg.isError
                  ? 'bg-red-500 text-white self-start mr-auto text-left'
                  : msg.sender === 'me'
                    ? 'bg-blue-500 text-white self-end ml-auto text-right'
                    : 'bg-gray-300 text-black self-start mr-auto text-left'
              }`}
            >
              <span>
                <Markdown>{msg.text}</Markdown>
              </span>
            </div>
          ))}

        {/* Affiche le texte en cours d'écriture */}
        {typingMessage && (
          <div className="max-w-2xl p-3 rounded-lg bg-gray-300 text-black self-start mr-auto text-left animate-fade-in">
            {typingMessage}
          </div>
        )}

        {/* Affiche une animation de chargement si le LLM réfléchit */}
        {isLoading && (
          <div className="max-w-2xl p-3 rounded-lg bg-gray-300 text-black self-start mr-auto text-left animate-slide-in">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-400"></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default Conversation
