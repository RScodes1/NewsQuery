import { io } from "socket.io-client";

let socket;

export const initSocket = (sessionId, onToken, onFinal) => {
    socket = io(process.env.REACT_APP_API_URL || 'http://localhost:4500', {
        transports: ["websocket"]
    });

    socket.on("connect", () => {
        console.log("Connected to WS:", socket.id);
        socket.emit("join_session", { sessionId });
    });

    socket.on("bot_token", ({ token }) => onToken(token));
    socket.on("bot_response", ({ text }) => onFinal(text));

    return socket;
};

// Pass sessionId explicitly from frontend when sending
export const sendMessage = (sessionId, message) => {
    if (!sessionId) {
        alert("Please start a session first");
        return;
    }

    if (!socket) {
        alert("WebSocket not initialized");
        return;
    }

    socket.emit("user_message", { sessionId, message });
};
