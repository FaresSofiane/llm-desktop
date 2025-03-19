import React, { useState, useRef } from 'react'
import { Send, Image, X } from 'lucide-react'

export default function InputBar({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('')
  const [images, setImages] = useState([])
  const fileInputRef = useRef(null)
  const textareaRef = useRef(null)

  // Ajout de la fonction pour ajuster la hauteur du textarea
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 5 * 24) // 24px est la hauteur approximative d'une ligne
    textarea.style.height = `${newHeight}px`
  }

  // Gestionnaire de changement de texte
  const handleInputChange = (e) => {
    setInput(e.target.value)
    adjustTextareaHeight()
  }

  // Conversion de l'image en Base64
  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result.split(',')[1]) // Obtenir seulement la partie encodée
      reader.onerror = (error) => reject(error)
      reader.readAsDataURL(file)
    })
  }

  // Conversion de l'image en Uint8Array
  const convertImageToUint8Array = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const arrayBuffer = reader.result
        const uint8Array = new Uint8Array(arrayBuffer)
        resolve(uint8Array)
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  const handleSend = async () => {
    if ((input.trim() !== '' || images.length > 0) && !isLoading) {
      try {
        // Convertir toutes les images en Base64 (ou Uint8Array)
        const processedImages = await Promise.all(
          images.map(async (image) => {
            // On peut choisir soit Base64 soit Uint8Array selon le besoin
            // Ici j'utilise Base64 comme exemple
            return await convertImageToBase64(image.file)
          })
        )

        onSendMessage({
          text: input,
          images: processedImages // Tableau de chaînes Base64 ou Uint8Array
        })

        setInput('')
        setImages([])
      } catch (error) {
        console.error('Erreur lors de la conversion des images:', error)
      }
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const newImages = files.map((file) => ({
      file,
      name: file.name,
      url: URL.createObjectURL(file)
    }))

    setImages((prevImages) => [...prevImages, ...newImages])
  }

  const removeImage = (index) => {
    if (!isLoading) {
      setImages(images.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="flex flex-col w-full">
      {/* Aperçu des images */}
      {images.length > 0 && (
        <div className="mb-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex overflow-x-auto space-x-2 pb-2 max-h-32">
            {images.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="flex flex-col items-center bg-white p-2 rounded-md border border-gray-200 w-24">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-16 w-20 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1 truncate w-full text-center">
                    {image.name}
                  </p>
                  <button
                    onClick={() => removeImage(index)}
                    className={`absolute -top-2 -right-2 text-white rounded-full p-1 ${
                      isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
                    }`}
                    disabled={isLoading}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de saisie */}
      <div className="flex items-center bg-gray-100 rounded-lg p-2 w-full">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
              e.preventDefault()
              handleSend()
            }
          }}
          placeholder={isLoading ? 'En cours de réflexion...' : 'Tapez ici...'}
          className="flex-1 bg-transparent outline-none text-gray-900 p-2 resize-none min-h-[24px] max-h-[120px] overflow-y-auto whitespace-pre-wrap"
          disabled={isLoading}
          rows={1}
        />

        {/* Bouton d'ajout d'images */}
        <button
          onClick={() => !isLoading && fileInputRef.current.click()}
          className={`text-white p-2 rounded-full mr-2 transition-colors ${
            isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
          disabled={isLoading}
        >
          <Image className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={isLoading}
        />

        {/* Bouton d'envoi */}
        <button
          onClick={handleSend}
          className={`text-white p-2 rounded-full transition-colors ${
            isLoading || (input.trim() === '' && images.length === 0)
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-black hover:bg-gray-800'
          }`}
          disabled={isLoading || (input.trim() === '' && images.length === 0)}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
