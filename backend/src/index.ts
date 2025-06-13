import express from "express"
import http from "http"
import { Server } from "socket.io"
import cors from "cors"
import path from "path"
import routes from "./routes"
import { roomController } from "./controllers/roomController"
import { mediasoupService } from "./services/mediasoupService"
import { hlsService } from "./services/hlsService"

// Initialize Express app
const app = express()
app.use(cors())
app.use(express.json())
app.use("/hls", express.static(path.join(__dirname, "../public/hls")))
app.use("/api", routes)

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
})

// Initialize mediasoup
mediasoupService.initialize().catch((error) => {
  console.error("Failed to initialize mediasoup:", error)
  process.exit(1)
})

// Socket.IO connection handling
io.on("connection", async (socket) => {
  console.log(`Client connected: ${socket.id}`)

  let currentRoomId: string | null = null

  // Handle room joining
  socket.on("join-room", async (roomId: string) => {
    currentRoomId = roomId
    await roomController.joinRoom(socket, roomId)
  })

  // Handle WebRTC signaling
  socket.on("offer", async (data) => {
    const { to, offer } = data
    console.log(`Forwarding offer from ${socket.id} to ${to}`)
    socket.to(to).emit("offer", {
      from: socket.id,
      offer,
    })
  })

  socket.on("answer", async (data) => {
    const { to, answer } = data
    console.log(`Forwarding answer from ${socket.id} to ${to}`)
    socket.to(to).emit("answer", {
      from: socket.id,
      answer,
    })
  })

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

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down...")
  hlsService.cleanup()
  await mediasoupService.close()
  process.exit(0)
})

// Start server
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
