import type { Socket } from "socket.io"
import { Peer } from "../models/Peer.js"
import { roomService } from "../services/roomService.js"
import { mediasoupService } from "../services/mediasoupService.js"
import { hlsService } from "../services/hlsService.js"

export const roomController = {
  // Create a new room
  createRoom: async (creatorId: string) => {
    try {
      const router = await mediasoupService.createRouter()
      const room = roomService.createRoom(router, creatorId)

      console.log(`🏠 Room created: ${room.roomCode} by ${creatorId}`)

      return {
        success: true,
        room: {
          id: room.id,
          roomCode: room.roomCode,
          watchCode: room.watchCode,
          isLive: room.isLive,
          title: room.title,
          description: room.description,
        },
      }
    } catch (error) {
      console.error(`❌ Error creating room: ${error}`)
      return { success: false, error: `Failed to create room: ${error}` }
    }
  },

  // Join room by room code
  joinRoomByCode: async (socket: Socket, roomCode: string) => {
    try {
      console.log(`👤 Client ${socket.id} joining room with code ${roomCode}`)

      // Find room by code
      const room = roomService.getRoomByCode(roomCode)
      if (!room) {
        return { success: false, error: "Room not found" }
      }

      // Create peer and add to room
      const peer = new Peer(socket.id, socket)
      room.addPeer(peer)

      // Join socket.io room
      socket.join(room.id)

      // Notify other peers in the room
      socket.to(room.id).emit("user-connected", socket.id)

      // Get existing peers in the room
      const existingPeers = room
        .getPeers()
        .filter((p) => p.id !== socket.id)
        .map((p) => p.id)

      existingPeers.forEach((peerId) => {
        socket.emit("user-connected", peerId)
      })

      console.log(`✅ Client ${socket.id} joined room ${room.roomCode}`)
      return {
        success: true,
        room: {
          id: room.id,
          roomCode: room.roomCode,
          watchCode: room.watchCode,
          isLive: room.isLive,
          title: room.title,
          description: room.description,
          isCreator: room.isCreator(socket.id),
          hlsUrl: room.isLive ? hlsService.getHlsUrl(room.id) : null,
        },
        peers: existingPeers,
      }
    } catch (error) {
      console.error(`❌ Error joining room: ${error}`)
      return { success: false, error: `Failed to join room: ${error}` }
    }
  },

  // Go live - simplified for development
  goLive: async (socket: Socket, roomId: string, title?: string, description?: string) => {
    try {
      console.log(`🎬 Going live request for room ${roomId}`)

      const room = roomService.getRoom(roomId)
      if (!room) {
        console.log(`❌ Room ${roomId} not found`)
        return { success: false, error: "Room not found" }
      }

      if (!room.isCreator(socket.id)) {
        console.log(`❌ User ${socket.id} is not creator of room ${roomId}`)
        return { success: false, error: "Only room creator can go live" }
      }

      // Update room details
      if (title && description) {
        room.updateDetails(title, description)
        console.log(`📝 Updated room details: ${title}`)
      }

      // Mark room as live
      room.goLive()

      // Start HLS streaming
      const hlsUrl = await hlsService.startHlsStream(room)

      // Notify all peers in the room
      const liveData = {
        isLive: true,
        title: room.title,
        description: room.description,
        hlsUrl,
      }

      socket.to(roomId).emit("room-live-status", liveData)
      socket.emit("room-live-status", liveData)

      console.log(`🎉 Room ${room.roomCode} is now LIVE with HLS URL: ${hlsUrl}`)

      return { success: true, message: "Room is now live", hlsUrl }
    } catch (error) {
      console.error(`❌ Error going live: ${error}`)
      return { success: false, error: `Failed to go live: ${error}` }
    }
  },

  // End live
  endLive: async (socket: Socket, roomId: string) => {
    try {
      console.log(`🛑 Ending live for room ${roomId}`)

      const room = roomService.getRoom(roomId)
      if (!room) return { success: false, error: "Room not found" }

      if (!room.isCreator(socket.id)) {
        return { success: false, error: "Only room creator can end live" }
      }

      room.endLive()

      // Stop HLS streaming
      await hlsService.stopHlsStream(roomId)

      // Notify all peers in the room
      socket.to(roomId).emit("room-live-status", { isLive: false })
      socket.emit("room-live-status", { isLive: false })

      console.log(`✅ Room ${room.roomCode} ended live stream`)

      return { success: true, message: "Live stream ended" }
    } catch (error) {
      console.error(`❌ Error ending live: ${error}`)
      return { success: false, error: `Failed to end live: ${error}` }
    }
  },

  // Get live rooms for watch page
  getLiveRooms: () => {
    try {
      const liveRooms = roomService.getLiveRooms()
      const activeStreams = hlsService.getActiveStreams()

      console.log(`📺 Getting live rooms: ${liveRooms.length} rooms, ${activeStreams.length} active streams`)

      return {
        success: true,
        rooms: liveRooms
          .map((room) => {
            const streamInfo = activeStreams.find((s) => s.roomId === room.id)
            return {
              id: room.id,
              title: room.title,
              description: room.description,
              roomCode: room.roomCode,
              watchCode: room.watchCode,
              viewerCount: room.peers.size + Math.floor(Math.random() * 20) + 5, // Simulated viewers
              thumbnail: `/placeholder.svg?height=180&width=320&text=${encodeURIComponent(room.title)}`,
              isLive: room.isLive && hlsService.isStreamActive(room.id),
              createdAt: room.createdAt,
              startTime: streamInfo?.startTime || room.createdAt,
              hlsUrl: hlsService.getHlsUrl(room.id),
            }
          })
          .filter((room) => room.isLive), // Only return actually live rooms
      }
    } catch (error) {
      console.error(`❌ Error getting live rooms: ${error}`)
      return { success: false, error: `Failed to get live rooms: ${error}` }
    }
  },

  // Join room by ID (for existing rooms)
  joinRoom: async (socket: Socket, roomId: string) => {
    try {
      console.log(`👤 Client ${socket.id} joining room ${roomId}`)

      // Get room
      let room = roomService.getRoom(roomId)
      if (!room) {
        // Create room if it doesn't exist (for backward compatibility)
        const router = await mediasoupService.createRouter()
        room = roomService.createRoom(router, socket.id)
      }

      // Create peer and add to room
      const peer = new Peer(socket.id, socket)
      room.addPeer(peer)

      // Join socket.io room
      socket.join(roomId)

      // Notify other peers in the room
      socket.to(roomId).emit("user-connected", socket.id)

      // Get existing peers in the room
      const existingPeers = room
        .getPeers()
        .filter((p) => p.id !== socket.id)
        .map((p) => p.id)

      existingPeers.forEach((peerId) => {
        socket.emit("user-connected", peerId)
      })

      console.log(`✅ Client ${socket.id} joined room ${roomId}`)
      return {
        success: true,
        peers: existingPeers,
        room: {
          isLive: room.isLive,
          hlsUrl: room.isLive ? hlsService.getHlsUrl(room.id) : null,
        },
      }
    } catch (error) {
      console.error(`❌ Error joining room: ${error}`)
      return { success: false, error: `Failed to join room: ${error}` }
    }
  },

  // Leave room
  leaveRoom: async (socket: Socket, roomId: string) => {
    try {
      console.log(`👋 Client ${socket.id} leaving room ${roomId}`)

      const room = roomService.getRoom(roomId)
      if (!room) return { success: false, error: "Room not found" }

      // Get peer
      const peer = room.getPeer(socket.id)
      if (!peer) return { success: false, error: "Peer not found" }

      // Close peer (closes all transports, producers, consumers)
      peer.close()

      // Remove peer from room
      room.removePeer(socket.id)

      // Notify other peers
      socket.to(roomId).emit("user-disconnected", socket.id)

      // Leave socket.io room
      socket.leave(roomId)

      // Clean up room if empty
      if (room.isEmpty()) {
        await hlsService.stopHlsStream(roomId)
        roomService.removeRoom(roomId)
        console.log(`🗑️ Room ${room.roomCode} deleted (empty)`)
      }

      console.log(`✅ Client ${socket.id} left room ${roomId}`)
      return { success: true }
    } catch (error) {
      console.error(`❌ Error leaving room: ${error}`)
      return { success: false, error: `Failed to leave room: ${error}` }
    }
  },

  // Get room info by room code
  getRoomByCode: (roomCode: string) => {
    const room = roomService.getRoomByCode(roomCode)
    if (!room) return { success: false, error: "Room not found" }

    return {
      success: true,
      room: {
        ...room.toJSON(),
        hlsUrl: room.isLive ? hlsService.getHlsUrl(room.id) : null,
      },
    }
  },

  // Get room info by watch code
  getRoomByWatchCode: (watchCode: string) => {
    const room = roomService.getRoomByWatchCode(watchCode)
    if (!room) return { success: false, error: "Room not found" }

    return {
      success: true,
      room: {
        ...room.toJSON(),
        hlsUrl: room.isLive ? hlsService.getHlsUrl(room.id) : null,
      },
    }
  },

  // Handle chat messages
  handleChatMessage: (socket: Socket, roomId: string, message: string) => {
    try {
      const room = roomService.getRoom(roomId)
      if (!room) return { success: false, error: "Room not found" }

      // Broadcast message to all peers in the room except sender
      socket.to(roomId).emit("chat-message", {
        from: socket.id,
        message,
        timestamp: Date.now(),
      })

      return { success: true }
    } catch (error) {
      console.error(`❌ Error handling chat message: ${error}`)
      return { success: false, error: `Failed to handle chat message: ${error}` }
    }
  },

  // Get all rooms (for admin/debugging)
  getAllRooms: () => {
    return {
      success: true,
      stats: roomService.getRoomStats(),
    }
  },
}
