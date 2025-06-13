"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
class Room {
    constructor(id, router) {
        this.id = id;
        this.router = router;
        this.peers = new Map();
    }
    addPeer(peer) {
        this.peers.set(peer.id, peer);
    }
    getPeer(peerId) {
        return this.peers.get(peerId);
    }
    removePeer(peerId) {
        return this.peers.delete(peerId);
    }
    getPeers() {
        return Array.from(this.peers.values());
    }
    isEmpty() {
        return this.peers.size === 0;
    }
    broadcastMessage(from, message) {
        this.peers.forEach((peer, id) => {
            if (id !== from) {
                peer.socket.emit("message", { from, message });
            }
        });
    }
    toJSON() {
        return {
            id: this.id,
            peers: Array.from(this.peers.keys()),
        };
    }
}
exports.Room = Room;
