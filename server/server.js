const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log("🔗 User connected:", socket.id);

    socket.on("join-room", ({ roomId, username }) => {
        socket.join(roomId);
        socket.data.username = username;
        console.log(`📥 ${username} joined room ${roomId}`);

        const clients = [...io.sockets.adapter.rooms.get(roomId) || []].map((id) => ({
            socketId: id,
            username: io.sockets.sockets.get(id).data.username || "Anonymous",
        }));

        io.to(roomId).emit("user-joined", { clients });
    });

    socket.on("code-change", ({ roomId, code }) => {
        socket.to(roomId).emit("code-update", { code });
    });

    socket.on("user-typing", ({ roomId, username }) => {
        socket.to(roomId).emit("user-typing", { username });
    });

    socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        io.emit("user-left", { socketId: socket.id });
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));