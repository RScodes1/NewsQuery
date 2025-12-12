import { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import ChatInput from "../ChatInput/ChatInput";
import "./ChatWindow.scss";

import { useSession } from "../../context/SessionContext";
import { initSocket, sendMessage } from "../../services/socket";
import { fetchChatHistoryApi } from "../../services/api";

const ChatWindow = () => {
  const { sessionId, setSessionId, createSession, resetSession } = useSession();

  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize session + socket
  useEffect(() => {
    const start = async () => {
      let id = sessionId || localStorage.getItem("sessionId") || (await createSession());
      setSessionId(id);

      // Fetch history
      const history = await fetchChatHistoryApi(id);
      setMessages(Array.isArray(history) ? history : []);

      // Initialize socket
      initSocket(
        id,
        // Token callback: append streaming token to last bot message
        (token) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];

            if (last?.role === "bot" && last.loading) {
              // Stop dots animation once first token arrives
              last.dots = false;
              last.text += token;
            }

            return copy;
          });
        },
        // Final callback: finalize bot message
        (finalText) => {
          setMessages((prev) => {
            const copy = [...prev];
            const last = copy[copy.length - 1];

            if (last?.role === "bot") {
              last.text = finalText;
              last.loading = false;
              last.dots = false;
            }

            return copy;
          });
        }
      );
    };

    start();
  }, []);

  // Send message
  const handleSend = (msg) => {
    // Add user message
    setMessages((prev) => [...prev, { role: "user", text: msg }]);

    // Add bot placeholder with dots animation
    setMessages((prev) => [
      ...prev,
      { role: "bot", text: "", loading: true, dots: true }
    ]);

    sendMessage(sessionId, msg);
  };

  // Reset session
  const handleReset = async () => {
    if (!sessionId) return;
    await resetSession(sessionId);
    setMessages([]);
  };

  return (
    <>
      <h1>News Feed Chatbot</h1>

      <div className="chat-window">
        <button
          onClick={handleReset}
          className="reset-btn"
          disabled={!sessionId}
        >
          Reset Session
        </button>

        <div className="messages">
          {messages.map((m, i) => (
            <Message
              key={i}
              role={m.role}
              text={m.text}
              loading={m.loading}
              dots={m.dots}
            />
          ))}

          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={handleSend} />
      </div>
    </>
  );
};

export default ChatWindow;
