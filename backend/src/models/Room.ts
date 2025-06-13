import type { Router } from "mediasoup/node/lib/Router"
import type { Peer } from "./Peer"

export class Room {
  id: string
  router: Router
  peers: Map<string, Peer>

  constructor(id: string, router: Router) {
    this.id = id
    this.router = router
    this.peers = new Map()
  }

  addPeer(peer: Peer): void {
    this.peers.set(peer.id, peer)
  }

  getPeer(peerId: string): Peer | undefined {
    return this.peers.get(peerId)
  }

  removePeer(peerId: string): boolean {
    return this.peers.delete(peerId)
  }

  getPeers(): Peer[] {
    return Array.from(this.peers.values())
  }

  isEmpty(): boolean {
    return this.peers.size === 0
  }

  broadcastMessage(from: string, message: any): void {
    this.peers.forEach((peer, id) => {
      if (id !== from) {
        peer.socket.emit("message", { from, message })
      }
    })
  }

  toJSON() {
    return {
      id: this.id,
      peers: Array.from(this.peers.keys()),
    }
  }
}
