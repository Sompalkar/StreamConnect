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
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
  }),
)
app.use(express.json())

// Serve HLS files statically with proper CORS headers
app.use(
  "/hls",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "GET")
    res.header("Access-Control-Allow-Headers", "Content-Type")

    // Set proper content types for HLS files
    if (req.path.endsWith(".m3u8")) {
      res.type("application/vnd.apple.mpegurl")
    } else if (req.path.endsWith(".ts")) {
      res.type("video/mp2t")
    }

    next()
  },
  express.static(path.join(__dirname, "../public/hls")),
)

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
console.log("🚀 Initializing mediasoup...")
mediasoupService.initialize().catch((error) => {
  console.error("❌ Failed to initialize mediasoup:", error)
  process.exit(1)
})

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  let currentRoomId: string | null = null

  // Handle room joining by room ID (backward compatibility)
  socket.on("join-room", async (roomId: string) => {
    console.log(`🏠 Join room request: ${roomId}`)
    currentRoomId = roomId
    const result = await roomController.joinRoom(socket, roomId)

    if (!result.success) {
      socket.emit("error", { message: result.error })
    } else {
      socket.emit("room-joined", result)
    }
  })

  // Handle room joining by room code
  socket.on("join-room-by-code", async (roomCode: string) => {
    console.log(`🔑 Join room by code: ${roomCode}`)
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
    console.log(`🎬 Go live request:`, data)
    const result = await roomController.goLive(socket, data.roomId, data.title, data.description)

    if (result.success) {
      socket.emit("live-status-changed", { isLive: true, hlsUrl: result.hlsUrl })
    } else {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle ending live
  socket.on("end-live", async (data: { roomId: string }) => {
    console.log(`🛑 End live request:`, data)
    const result = await roomController.endLive(socket, data.roomId)

    if (result.success) {
      socket.emit("live-status-changed", { isLive: false })
    } else {
      socket.emit("error", { message: result.error })
    }
  })

  // Handle WebRTC signaling - forward offers between peers
  socket.on("offer", async (data) => {
    const { to, offer } = data
    console.log(`📡 Forwarding offer from ${socket.id} to ${to}`)
    socket.to(to).emit("offer", {
      from: socket.id,
      offer,
    })
  })

  // Handle WebRTC signaling - forward answers between peers
  socket.on("answer", async (data) => {
    const { to, answer } = data
    console.log(`📡 Forwarding answer from ${socket.id} to ${to}`)
    socket.to(to).emit("answer", {
      from: socket.id,
      answer,
    })
  })

  // Handle WebRTC signaling - forward ICE candidates between peers
  socket.on("ice-candidate", async (data) => {
    const { to, candidate } = data
    console.log(`📡 Forwarding ICE candidate from ${socket.id} to ${to}`)
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
    console.log(`🔌 Client disconnected: ${socket.id}`)
    if (currentRoomId) {
      roomController.leaveRoom(socket, currentRoomId)
    }
  })
})

// Periodic cleanup of empty rooms (every 5 minutes)
setInterval(
  () => {
    console.log("🧹 Running periodic cleanup...")
    roomService.cleanupEmptyRooms()
  },
  5 * 60 * 1000,
)

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down gracefully...")

  // Cleanup services
  await hlsService.cleanup()
  await mediasoupService.close()

  // Close server
  server.close(() => {
    console.log("✅ Server closed")
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
  console.log(`🎥 FFmpeg test: Run 'ffmpeg -version' to verify installation`)
})
