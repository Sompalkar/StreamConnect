import type { types } from "mediasoup"
import type { Peer } from "./Peer"

export class Room {
  id: string
  roomCode: string
  watchCode: string
  router: types.Router
  peers: Map<string, Peer>
  createdAt: Date
  isLive: boolean
  title: string
  description: string
  creatorId: string

  constructor(id: string, roomCode: string, watchCode: string, router: types.Router, creatorId: string) {
    this.id = id
    this.roomCode = roomCode
    this.watchCode = watchCode
    this.router = router
    this.peers = new Map()
    this.createdAt = new Date()
    this.isLive = false
    this.title = `Live Stream ${roomCode}`
    this.description = "Live streaming session"
    this.creatorId = creatorId
  }

  // Add a peer to the room
  addPeer(peer: Peer): void {
    this.peers.set(peer.id, peer)
    console.log(`Peer ${peer.id} added to room ${this.roomCode}`)
  }

  // Get a specific peer
  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId)
  }

  // Remove a peer from the room
  removePeer(peerId: string): boolean {
    const removed = this.peers.delete(peerId)
    if (removed) {
      console.log(`Peer ${peerId} removed from room ${this.roomCode}`)
    }
    return removed
  }

  // Get all peers in the room
  getPeers(): Peer[] {
    return Array.from(this.peers.values())
  }

  // Check if room is empty
  isEmpty(): boolean {
    return this.peers.size === 0
  }

  // Check if user is creator
  isCreator(peerId: string): boolean {
    return this.creatorId === peerId
  }

  // Go live
  goLive(): void {
    this.isLive = true
    console.log(`Room ${this.roomCode} is now live`)
  }

  // End live
  endLive(): void {
    this.isLive = false
    console.log(`Room ${this.roomCode} ended live stream`)
  }

  // Update room details
  updateDetails(title: string, description: string): void {
    this.title = title
    this.description = description
  }

  // Get room statistics
  getStats() {
    return {
      id: this.id,
      roomCode: this.roomCode,
      watchCode: this.watchCode,
      peerCount: this.peers.size,
      createdAt: this.createdAt,
      isLive: this.isLive,
      title: this.title,
      description: this.description,
      creatorId: this.creatorId,
    }
  }

  // Broadcast message to all peers except sender
  broadcastMessage(fromPeerId: string, message: any): void {
    this.peers.forEach((peer, id) => {
      if (id !== fromPeerId) {
        peer.socket.emit("message", { from: fromPeerId, message })
      }
    })
  }

  // Convert room to JSON for API responses
  toJSON() {
    return {
      id: this.id,
      roomCode: this.roomCode,
      watchCode: this.watchCode,
      peerCount: this.peers.size,
      peers: Array.from(this.peers.keys()),
      createdAt: this.createdAt,
      isLive: this.isLive,
      title: this.title,
      description: this.description,
      creatorId: this.creatorId,
    }
  }
}
