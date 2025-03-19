import React from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { materialDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

const CodeHighlighter = ({ text }) => {
  // Fonction pour détecter les blocs de code et le Markdown dans le texte
  const parseText = (inputText) => {
    const codeRegex = /```(\w+)?\n([\s\S]*?)```/g // Détecte les blocs de code Markdown
    const parts = []
    let lastIndex = 0
    let match

    while ((match = codeRegex.exec(inputText)) !== null) {
      const [fullMatch, language, code] = match
      const startIndex = match.index

      // Ajouter le texte avant le bloc de code
      if (startIndex > lastIndex) {
        parts.push({
          type: 'text',
          content: inputText.slice(lastIndex, startIndex)
        })
      }

      // Ajouter le bloc de code
      parts.push({
        type: 'code',
        language: language || 'plaintext', // Utiliser 'plaintext' si aucune langue n'est spécifiée
        content: code
      })

      lastIndex = startIndex + fullMatch.length
    }

    // Ajouter le texte restant après le dernier bloc de code
    if (lastIndex < inputText.length) {
      parts.push({
        type: 'text',
        content: inputText.slice(lastIndex)
      })
    }

    return parts
  }

  const parsedParts = parseText(text)

  return (
    <div className="p-4 bg-gray-100 rounded-lg space-y-4">
      {parsedParts.map((part, index) =>
        part.type === 'code' ? (
          <div key={index} className="overflow-auto rounded-lg">
            <SyntaxHighlighter language={part.language} style={materialDark} showLineNumbers>
              {part.content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <p
            key={index}
            className="text-gray-800"
            dangerouslySetInnerHTML={{
              __html: part.content.replace(/\n/g, '<br />') // Remplace les \n par des <br />
            }}
          />
        )
      )}
    </div>
  )
}

export default CodeHighlighter
// Writed by Sofiane Fares and Galaad Filâtre
