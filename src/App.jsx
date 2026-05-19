import { useState, useRef, useEffect } from 'react'
import './App.css'

const SYSTEM_PROMPT = `You are a helpful, friendly, and smart AI assistant. 
Answer clearly and concisely. Be conversational and warm.`

export default function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi there! 👋 I'm your AI assistant. How can I help you today?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || isLoading) return

    const userMessage = { id: Date.now(), role: 'user', content: text }
    const updatedMessages = [...messages, userMessage]

    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          max_tokens: 1024,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updatedMessages.map(({ role, content }) => ({ role, content }))
          ]
        })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData?.error?.message || `Error: ${response.status}`)
      }

      const data = await response.json()
      const reply = data.choices?.[0]?.message?.content ?? 'No response received.'

      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, role: 'assistant', content: reply }
      ])
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const clearChat = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: "Hi there! 👋 I'm your AI assistant. How can I help you today?"
    }])
    setError(null)
  }

  return (
    <div className="app">
      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="avatar-header">🤖</div>
          <div>
            <p className="header-name">AI Assistant</p>
            <p className="header-status">
              <span className="status-dot"></span>Online
            </p>
          </div>
        </div>
        <button className="clear-btn" onClick={clearChat}>🗑️ Clear</button>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.map(msg => (
          <div key={msg.id} className={`message ${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </div>
            <div className="msg-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="message assistant">
            <div className="msg-avatar">🤖</div>
            <div className="msg-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && <p className="error">{error}</p>}

        <div ref={bottomRef} />
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <textarea
          ref={inputRef}
          placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isLoading}
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  )
}