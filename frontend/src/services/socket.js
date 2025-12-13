import { io } from "socket.io-client";

let socket;

export const initSocket = (sessionId, onToken, onFinal) => {
    socket = io(process.env.REACT_APP_API_URL || 'https://newsquery.onrender.com', {
        transports: ["websocket"]
    });

    socket.on("connect", () => {
        socket.emit("join_session", { sessionId });
    });

    socket.on("bot_token", ({ token }) => onToken(token));
    socket.on("bot_done")

    return socket;
};

export const sendMessage = (sessionId, message) => {
    if (!sessionId) {
        alert("Please start a session first");
        return;
    }

    if (!socket) {
        alert("WebSocket not initialized");
        return;
    }

     else {
       socket.emit("user_message", { sessionId, message });
     }
  
};
