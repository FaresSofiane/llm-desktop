import ChatApp from './components/ChatApp'
import { ChatProvider } from './context/ChatContext'

function App() {
  return (
    <>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </>
  )
}

export default App
// Writed by Sofiane Fares and Galaad Filâtre
