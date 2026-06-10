
import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello 👋 How can I help you today?",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);

    const currentInput = input;
    setInput("");
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: currentInput,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      const botMessage = {
        role: "assistant",
        content: data.reply,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: "Hello 👋 How can I help you today?",
      },
    ]);
  };

  return (
    <div className="app">

      {/* Header */}
      <div className="chat-header">
        <div className="header-left">
          <div className="avatar-header">🤖</div>

          <div>
            <div className="header-name">AI Chatbot</div>

            <div className="header-status">
              <span className="status-dot"></span>
              Online
            </div>
          </div>
        </div>

        <button
          className="clear-btn"
          onClick={clearChat}
        >
          Clear Chat
        </button>
      </div>

      {/* Messages */}
      <div className="chat-messages">

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role}`}
          >

            <div className="msg-avatar">
              {msg.role === "user" ? "🧑" : "🤖"}
            </div>

            <div className="msg-bubble">
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="message assistant">
            <div className="msg-avatar">🤖</div>

            <div className="msg-bubble typing">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        {error && (
          <div className="error">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="chat-input-bar">

        <textarea
          rows="1"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading}
        >
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;

