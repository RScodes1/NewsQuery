import { createContext, useContext, useState } from "react";
import { createSessionApi, clearSessionApi } from "../services/api";

const SessionContext = createContext();

export const useSession = () => useContext(SessionContext);

export const SessionProvider = ({ children }) => {
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("sessionId") || null;
  });

  const [history, setHistory] = useState([]);

  // Create new session
  const createSession = async () => {
    try {
      const res = await createSessionApi();
      if (res?.sessionId) {
        setSessionId(res.sessionId);
          localStorage.setItem("sessionId", res.sessionId);
        setHistory([]); // reset history on new session
      }
    } catch (err) {
      console.error("Failed to create session", err);
    }
  };


  // Clear session (both frontend and backend)
  const resetSession = async () => {
    if (!sessionId) return;
    try {
      await clearSessionApi(sessionId);
      setHistory([]);
      setSessionId(null);
       localStorage.removeItem("sessionId");
    } catch (err) {
      console.error("Failed to clear session", err);
    }
  };

  return (
    <SessionContext.Provider value={{
      sessionId,
      setSessionId,
      history,
      createSession,
      resetSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};
