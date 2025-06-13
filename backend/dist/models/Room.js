"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(id, roomCode, watchCode, router) {
        this.id = id;
        this.roomCode = roomCode;
        this.watchCode = watchCode;
        this.router = router;
        this.peers = new Map();
        this.createdAt = new Date();
    }
    // Add a peer to the room
    addPeer(peer) {
        this.peers.set(peer.id, peer);
        console.log(`Peer ${peer.id} added to room ${this.roomCode}`);
    }
    // Get a specific peer
    getPeer(peerId) {
        return this.peers.get(peerId);
    }
    // Remove a peer from the room
    removePeer(peerId) {
        const removed = this.peers.delete(peerId);
        if (removed) {
            console.log(`Peer ${peerId} removed from room ${this.roomCode}`);
        }
        return removed;
    }
    // Get all peers in the room
    getPeers() {
        return Array.from(this.peers.values());
    }
    // Check if room is empty
    isEmpty() {
        return this.peers.size === 0;
    }
    // Get room statistics
    getStats() {
        return {
            id: this.id,
            roomCode: this.roomCode,
            watchCode: this.watchCode,
            peerCount: this.peers.size,
            createdAt: this.createdAt,
        };
    }
    // Broadcast message to all peers except sender
    broadcastMessage(fromPeerId, message) {
        this.peers.forEach((peer, id) => {
            if (id !== fromPeerId) {
                peer.socket.emit("message", { from: fromPeerId, message });
            }
        });
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
        };
    }
}
exports.Room = Room;
