// src/service.js
import { io } from "socket.io-client";

export const initSocket = async() => {
    const options = {
        "force new connection": true,
        reconnectionAttempts: Infinity, // correct key name
        timeout: 10000, // corrected typo
        transports: ["websocket"],
    };

    // connect to your backend Socket.IO server
    return io("http://localhost:3000", options);
};