import React from "react";
import { useSession, SessionProvider } from "./context/SessionContext";
import ChatWindow from "./components/ChatWindow/ChatWindow";
import './app.scss';

function AppContent() {
  const { sessionId, createSession } = useSession();
  return (
    <div className="app">
      {!sessionId ? (
        <div className="welcome-screen">
          <h2>Welcome to News Chatbot</h2>
          <button onClick={createSession}>Start New Session</button>
        </div>
      ) : (
        <>
          <ChatWindow />
        </>
      )}
    </div>
  );
}

function App() {
  return (
    <SessionProvider>
      <AppContent />
    </SessionProvider>
  );
}

export default App;
