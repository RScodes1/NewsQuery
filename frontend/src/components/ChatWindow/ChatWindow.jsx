import { useState, useEffect, useRef } from "react";
import Message from "../Message/Message";
import ChatInput from "../ChatInput/ChatInput";
import './ChatWindow.scss';

import { useSession } from "../../context/SessionContext";
import { initSocket, sendMessage } from "../../services/socket";
import { fetchChatHistoryApi } from "../../services/api";

const ChatWindow = () => {
  const { sessionId, setSessionId, createSession, resetSession } = useSession();

  const [messages, setMessages] = useState([]);
  const [streamingText, setStreamingText] = useState("");
   const [loading, setLoading] = useState(false);
   const bottomRef = useRef(null);

   useEffect(() => {
  bottomRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages, streamingText]);


useEffect(() => {
  const start = async () => {
    let id = sessionId;

    // No session in state → load from localStorage
    if (!id) {
      id = localStorage.getItem("sessionId");
    }

    // Still no session → create one
    if (!id) {
      id = await createSession();
    }

    setSessionId(id);

    // Fetch past messages
    const history = await fetchChatHistoryApi(id);

    setMessages(Array.isArray(history) ? history : []);

    // Initialize socket
    initSocket(
      id,
    (token) => {
  setMessages(prev => {
    const copy = [...prev];
    const last = copy[copy.length - 1];

    if (last?.loading) {
      last.text += token;  // build streaming text here
    }

    return copy;
  });
},

  (finalText) => {
    setMessages(prev => {
      const copy = [...prev];
      const last = copy[copy.length - 1];

      // Replace ONLY if placeholder exists
      if (last?.loading === true) {
        copy[copy.length - 1] = {
          role: "bot",
          text: finalText,
          loading: false
        };
      }

      return copy;
    });

    setStreamingText(""); 
    setLoading(false);
}

    );
  };

  start();
}, []);

const handleSend = (msg) => {
  setMessages(prev => [...prev, { role: "user", text: msg }]);

    setMessages(prev => [...prev, { role: "bot", text: "", loading: true }]);
    setLoading(true);

  sendMessage(sessionId, msg);
};


  const handleReset = async () => {
    if (!sessionId) return;

    await resetSession(sessionId);
    setMessages([]);
  };

  return (
    <> 
      <h1>News Feed chatbot</h1>
    <div className="chat-window">
            
          <button onClick={handleReset} className="reset-btn" disabled={!sessionId}>
        Reset Session
         </button>
      <div className="messages">
        {messages?.map((m, i) => (
            <Message 
            key={i} 
            role={m.role} 
            text={m.text} 
            loading={m.loading === true}
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
