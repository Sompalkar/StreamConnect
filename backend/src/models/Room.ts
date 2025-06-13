import type { Router } from "mediasoup/node/lib/Router"
import type { Peer } from "./Peer"

export class Room {
  id: string
  roomCode: string
  watchCode: string
  router: Router
  peers: Map<string, Peer>
  createdAt: Date

  constructor(id: string, roomCode: string, watchCode: string, router: Router) {
    this.id = id
    this.roomCode = roomCode
    this.watchCode = watchCode
    this.router = router
    this.peers = new Map()
    this.createdAt = new Date()
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

  // Get room statistics
  getStats() {
    return {
      id: this.id,
      roomCode: this.roomCode,
      watchCode: this.watchCode,
      peerCount: this.peers.size,
      createdAt: this.createdAt,
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
    }
  }
}
