"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const routes_1 = __importDefault(require("./routes"));
const roomController_1 = require("./controllers/roomController");
const mediasoupService_1 = require("./services/mediasoupService");
const hlsService_1 = require("./services/hlsService");
const roomService_1 = require("./services/roomService");
// Initialize Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve HLS files statically
app.use("/hls", express_1.default.static(path_1.default.join(__dirname, "../public/hls")));
// API routes
app.use("/api", routes_1.default);
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO with CORS
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Initialize mediasoup service
mediasoupService_1.mediasoupService.initialize().catch((error) => {
    console.error("Failed to initialize mediasoup:", error);
    process.exit(1);
});
// Socket.IO connection handling
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Client connected: ${socket.id}`);
    let currentRoomId = null;
    // Handle room joining by room ID (backward compatibility)
    socket.on("join-room", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        currentRoomId = roomId;
        const result = yield roomController_1.roomController.joinRoom(socket, roomId);
        if (!result.success) {
            socket.emit("error", { message: result.error });
        }
    }));
    // Handle room joining by room code
    socket.on("join-room-by-code", (roomCode) => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield roomController_1.roomController.joinRoomByCode(socket, roomCode);
        if (result.success && result.room) {
            currentRoomId = result.room.id;
            socket.emit("room-joined", result);
        }
        else {
            socket.emit("error", { message: result.error });
        }
    }));
    // Handle WebRTC signaling - forward offers between peers
    socket.on("offer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, offer } = data;
        console.log(`Forwarding offer from ${socket.id} to ${to}`);
        socket.to(to).emit("offer", {
            from: socket.id,
            offer,
        });
    }));
    // Handle WebRTC signaling - forward answers between peers
    socket.on("answer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, answer } = data;
        console.log(`Forwarding answer from ${socket.id} to ${to}`);
        socket.to(to).emit("answer", {
            from: socket.id,
            answer,
        });
    }));
    // Handle WebRTC signaling - forward ICE candidates between peers
    socket.on("ice-candidate", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, candidate } = data;
        console.log(`Forwarding ICE candidate from ${socket.id} to ${to}`);
        socket.to(to).emit("ice-candidate", {
            from: socket.id,
            candidate,
        });
    }));
    // Handle chat messages
    socket.on("chat-message", (data) => {
        const { message } = data;
        if (currentRoomId) {
            roomController_1.roomController.handleChatMessage(socket, currentRoomId, message);
        }
    });
    // Handle disconnection
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.id}`);
        if (currentRoomId) {
            roomController_1.roomController.leaveRoom(socket, currentRoomId);
        }
    });
}));
// Periodic cleanup of empty rooms (every 5 minutes)
setInterval(() => {
    roomService_1.roomService.cleanupEmptyRooms();
}, 5 * 60 * 1000);
// Graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down gracefully...");
    // Cleanup services
    hlsService_1.hlsService.cleanup();
    yield mediasoupService_1.mediasoupService.close();
    // Close server
    server.close(() => {
        console.log("Server closed");
        process.exit(0);
    });
}));
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 WebRTC signaling ready`);
    console.log(`📺 HLS streaming available at /hls`);
    console.log(`🔗 API available at /api`);
});
