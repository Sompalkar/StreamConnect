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
// Initialize Express app
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/hls", express_1.default.static(path_1.default.join(__dirname, "../public/hls")));
app.use("/api", routes_1.default);
// Create HTTP server
const server = http_1.default.createServer(app);
// Initialize Socket.IO
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
// Initialize mediasoup
mediasoupService_1.mediasoupService.initialize().catch((error) => {
    console.error("Failed to initialize mediasoup:", error);
    process.exit(1);
});
// Socket.IO connection handling
io.on("connection", (socket) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Client connected: ${socket.id}`);
    let currentRoomId = null;
    // Handle room joining
    socket.on("join-room", (roomId) => __awaiter(void 0, void 0, void 0, function* () {
        currentRoomId = roomId;
        yield roomController_1.roomController.joinRoom(socket, roomId);
    }));
    // Handle WebRTC signaling
    socket.on("offer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, offer } = data;
        console.log(`Forwarding offer from ${socket.id} to ${to}`);
        socket.to(to).emit("offer", {
            from: socket.id,
            offer,
        });
    }));
    socket.on("answer", (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { to, answer } = data;
        console.log(`Forwarding answer from ${socket.id} to ${to}`);
        socket.to(to).emit("answer", {
            from: socket.id,
            answer,
        });
    }));
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
// Graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Shutting down...");
    hlsService_1.hlsService.cleanup();
    yield mediasoupService_1.mediasoupService.close();
    process.exit(0);
}));
// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
