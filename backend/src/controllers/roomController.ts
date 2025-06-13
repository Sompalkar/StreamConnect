import type { Socket } from "socket.io"
import { Peer } from "../models/Peer"
import { roomService } from "../services/roomService"
import { mediasoupService } from "../services/mediasoupService"
import { hlsService } from "../services/hlsService"

export const roomController = {
  joinRoom: async (socket: Socket, roomId: string) => {
    try {
      console.log(`Client ${socket.id} joining room ${roomId}`)

      // Get or create room
      let room = roomService.getRoom(roomId)
      if (!room) {
        const router = await mediasoupService.createRouter()
        room = roomService.createRoom(roomId, router)
      }

      // Create peer
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

      // Update HLS transcoding if needed
      if (room.peers.size >= 2) {
        hlsService.startTranscoding(room)
      }

      console.log(`Client ${socket.id} joined room ${roomId}`)
      return { success: true, peers: existingPeers }
    } catch (error) {
      console.error(`Error joining room: ${error}`)
      return { success: false, error: `Failed to join room: ${error}` }
    }
  },

  leaveRoom: (socket: Socket, roomId: string) => {
    try {
      console.log(`Client ${socket.id} leaving room ${roomId}`)

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
        roomService.removeRoom(roomId)
        hlsService.stopTranscoding(roomId)
        console.log(`Room ${roomId} deleted (empty)`)
      } else if (room.peers.size < 2) {
        // Stop HLS transcoding if fewer than 2 peers
        hlsService.stopTranscoding(roomId)
      }

      console.log(`Client ${socket.id} left room ${roomId}`)
      return { success: true }
    } catch (error) {
      console.error(`Error leaving room: ${error}`)
      return { success: false, error: `Failed to leave room: ${error}` }
    }
  },

  getRoomInfo: (roomId: string) => {
    const room = roomService.getRoom(roomId)
    if (!room) return { success: false, error: "Room not found" }

    return {
      success: true,
      room: room.toJSON(),
    }
  },

  handleChatMessage: (socket: Socket, roomId: string, message: string) => {
    try {
      const room = roomService.getRoom(roomId)
      if (!room) return { success: false, error: "Room not found" }

      // Broadcast message to all peers in the room except sender
      socket.to(roomId).emit("chat-message", {
        from: socket.id,
        message,
      })

      return { success: true }
    } catch (error) {
      console.error(`Error handling chat message: ${error}`)
      return { success: false, error: `Failed to handle chat message: ${error}` }
    }
  },
}
