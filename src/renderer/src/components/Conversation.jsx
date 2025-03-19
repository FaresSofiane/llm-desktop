import React, { useEffect, useRef } from 'react'
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy } from 'lucide-react'

const Conversation = ({ messages, isLoading, typingMessage }) => {
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, typingMessage]) // Inclure typingMessage pour scroller automatiquement

  // Rendu des images en base64
  const renderImages = (images, isSentByMe) => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return null
    }

    return (
      <div
        className={`flex flex-row flex-wrap gap-2 mb-2 overflow-x-auto ${isSentByMe ? 'justify-end' : 'justify-start'}`}
      >
        {images.map((image, imgIndex) => (
          <div key={imgIndex} className="max-h-12 flex-shrink-0">
            <img
              src={`data:image/jpeg;base64,${image}`}
              alt={`Image ${imgIndex + 1}`}
              className="h-12 object-contain rounded"
            />
          </div>
        ))}
      </div>
    )
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages
          .filter((msg) => msg.sender !== 'context') // Filtrer les messages dont le sender est 'context'
          .map((msg, index) => {
            const isSentByMe = msg.sender === 'me'

            return (
              <div
                key={index}
                className={`${
                  msg.isError
                    ? 'bg-red-500 text-white self-start mr-auto text-left max-w-2xl'
                    : isSentByMe
                      ? 'bg-blue-500 text-white self-end ml-auto text-left max-w-2xl'
                      : 'bg-gray-300 text-black self-start mr-auto text-left max-w-4xl'
                } p-3 rounded-lg animate-fade-in`}
              >
                {/* En-tête du message */}
                <div className="flex justify-between items-center mb-2 border-b border-opacity-20 pb-2">
                  <span className="font-medium">{isSentByMe ? 'You' : 'Assistant'}</span>
                  <div className="relative group">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="p-1 hover:bg-opacity-20 hover:bg-gray-500 rounded"
                      aria-label="Copier"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>

                {/* Affichage des images */}
                {msg.images && renderImages(msg.images, isSentByMe)}

                {/* Modification du rendu du texte pour les messages de l'utilisateur */}
                {isSentByMe ? (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                ) : (
                  <span>
                    <Markdown
                      children={msg.text}
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code(props) {
                          const { children, className, node, ...rest } = props
                          const match = /language-(\w+)/.exec(className || '')
                          const language = match ? match[1] : 'text'
                          const codeString = String(children).replace(/\n$/, '')

                          return match ? (
                            <div className="relative mt-2">
                              {/* En-tête du bloc de code */}
                              <div className="flex justify-between items-center px-4 py-2 bg-[#2d2d2d] rounded-t border border-gray-500 shadow-lg">
                                <span className="text-gray-300 text-sm">{language}</span>
                                <button
                                  onClick={() => copyToClipboard(codeString)}
                                  className="p-1 hover:bg-gray-700 rounded group relative"
                                  aria-label="Copier le code"
                                >
                                  <Copy size={16} className="text-gray-300" />
                                  <div className="absolute hidden group-hover:block bg-gray-700 text-white text-xs py-1 px-2 rounded -bottom-8 right-0 whitespace-nowrap">
                                    Copier
                                  </div>
                                </button>
                              </div>
                              <SyntaxHighlighter
                                {...rest}
                                PreTag="div"
                                language={language}
                                style={materialDark}
                                className="rounded-t-none rounded-b !mt-0"
                                customStyle={{
                                  margin: 0,
                                  backgroundColor: '#2d2d2d'
                                }}
                              >
                                {codeString}
                              </SyntaxHighlighter>
                            </div>
                          ) : (
                            <code {...rest} className={className}>
                              {children}
                            </code>
                          )
                        }
                      }}
                    />
                  </span>
                )}
              </div>
            )
          })}

        {/* Affiche le texte en cours d'écriture */}
        {typingMessage || isLoading ? (
          <div className="max-w-4xl p-3 rounded-lg bg-gray-300 text-black self-start mr-auto text-left animate-fade-in">
            {/* Ajout du header pendant le chargement */}
            <div className="flex justify-between items-center mb-2 border-b border-opacity-20 pb-2">
              <span className="font-medium">Assistant</span>
              <div className="relative">
                <button className="p-1 cursor-not-allowed opacity-50" disabled aria-label="Copier">
                  <Copy size={16} />
                </button>
              </div>
            </div>

            {typingMessage && <span>{typingMessage}</span>}
            {isLoading && (
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-400"></div>
              </div>
            )}
          </div>
        ) : null}

        {/* Affiche une animation de chargement si le LLM réfléchit */}

        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}

export default Conversation
