import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import routes from "./routes/index.js"
import { roomController } from "./controllers/roomController.js"
import { mediasoupService } from "./services/mediasoupService.js"
import { hlsService } from "./services/hlsService.js"
import { roomService } from "./services/roomService.js"

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialize Express app
const app = express()
app.use(cors())
app.use(express.json())

// Serve HLS files statically
app.use("/hls", express.static(path.join(__dirname, "../public/hls")))

// API routes
app.use("/api", routes)

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Initialize mediasoup service
mediasoupService.initialize().catch((error) => {
  console.error("Failed to initialize mediasoup:", error)
  process.exit(1)
})

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log(`Client connected: ${socket.id}`)

  let currentRoomId: string | null = null

  // Handle room joining by room ID (backward compatibility)
  socket.on("join-room", async (roomId: string) => {
    currentRoomId = roomId
    const result = await roomController.joinRoom(socket, roomId)

    if (!result.success) {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle room joining by room code
  socket.on("join-room-by-code", async (roomCode: string) => {
    const result = await roomController.joinRoomByCode(socket, roomCode)

    if (result.success && result.room) {
      currentRoomId = result.room.id
      socket.emit("room-joined", result)
    } else {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle going live
  socket.on("go-live", async (data: { roomId: string; title?: string; description?: string }) => {
    const result = roomController.goLive(socket, data.roomId, data.title, data.description)

    if (result.success) {
      socket.emit("live-status-changed", { isLive: true })
    } else {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle ending live
  socket.on("end-live", async (data: { roomId: string }) => {
    const result = roomController.endLive(socket, data.roomId)

    if (result.success) {
      socket.emit("live-status-changed", { isLive: false })
    } else {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle WebRTC signaling - forward offers between peers
  socket.on("offer", async (data) => {
    const { to, offer } = data
    console.log(`Forwarding offer from ${socket.id} to ${to}`)
    socket.to(to).emit("offer", {
      from: socket.id,
      offer,
    })
  })

  // Handle WebRTC signaling - forward answers between peers
  socket.on("answer", async (data) => {
    const { to, answer } = data
    console.log(`Forwarding answer from ${socket.id} to ${to}`)
    socket.to(to).emit("answer", {
      from: socket.id,
      answer,
    })
  })

  // Handle WebRTC signaling - forward ICE candidates between peers
  socket.on("ice-candidate", async (data) => {
    const { to, candidate } = data
    console.log(`Forwarding ICE candidate from ${socket.id} to ${to}`)
    socket.to(to).emit("ice-candidate", {
      from: socket.id,
      candidate,
    })
  })

  // Handle chat messages
  socket.on("chat-message", (data) => {
    const { message } = data
    if (currentRoomId) {
      roomController.handleChatMessage(socket, currentRoomId, message)
    }
  })

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`)
    if (currentRoomId) {
      roomController.leaveRoom(socket, currentRoomId)
    }
  })
})

// Periodic cleanup of empty rooms (every 5 minutes)
setInterval(
  () => {
    roomService.cleanupEmptyRooms()
  },
  5 * 60 * 1000,
)

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...")

  // Cleanup services
  hlsService.cleanup()
  await mediasoupService.close()

  // Close server
  server.close(() => {
    console.log("Server closed")
    process.exit(0)
  })
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📡 WebRTC signaling ready`)
  console.log(`📺 HLS streaming available at /hls`)
  console.log(`🔗 API available at /api`)
})
