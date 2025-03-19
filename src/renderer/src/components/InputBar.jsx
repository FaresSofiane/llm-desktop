import React, { useState } from 'react'
import { Send } from 'lucide-react'

export default function InputBar({ onSendMessage, isLoading }) {
  const [input, setInput] = useState('')

  const handleSend = () => {
    if (input.trim() !== '') {
      onSendMessage(input)
      setInput('')
    }
  }

  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-2 w-full">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Tapez ici..."
        className="flex-1 bg-transparent outline-none text-gray-900 p-2"
      />
      <button onClick={handleSend} className="bg-black text-white p-2 rounded-full">
        <Send className="w-5 h-5" />
      </button>
    </div>
  )
}
