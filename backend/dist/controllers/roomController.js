"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const Peer_1 = require("../models/Peer");
const roomService_1 = require("../services/roomService");
const mediasoupService_1 = require("../services/mediasoupService");
const hlsService_1 = require("../services/hlsService");
exports.roomController = {
    joinRoom: (socket, roomId) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(`Client ${socket.id} joining room ${roomId}`);
            // Get or create room
            let room = roomService_1.roomService.getRoom(roomId);
            if (!room) {
                const router = yield mediasoupService_1.mediasoupService.createRouter();
                room = roomService_1.roomService.createRoom(roomId, router);
            }
            // Create peer
            const peer = new Peer_1.Peer(socket.id, socket);
            room.addPeer(peer);
            // Join socket.io room
            socket.join(roomId);
            // Notify other peers in the room
            socket.to(roomId).emit("user-connected", socket.id);
            // Get existing peers in the room
            const existingPeers = room
                .getPeers()
                .filter((p) => p.id !== socket.id)
                .map((p) => p.id);
            existingPeers.forEach((peerId) => {
                socket.emit("user-connected", peerId);
            });
            // Update HLS transcoding if needed
            if (room.peers.size >= 2) {
                hlsService_1.hlsService.startTranscoding(room);
            }
            console.log(`Client ${socket.id} joined room ${roomId}`);
            return { success: true, peers: existingPeers };
        }
        catch (error) {
            console.error(`Error joining room: ${error}`);
            return { success: false, error: `Failed to join room: ${error}` };
        }
    }),
    leaveRoom: (socket, roomId) => {
        try {
            console.log(`Client ${socket.id} leaving room ${roomId}`);
            const room = roomService_1.roomService.getRoom(roomId);
            if (!room)
                return { success: false, error: "Room not found" };
            // Get peer
            const peer = room.getPeer(socket.id);
            if (!peer)
                return { success: false, error: "Peer not found" };
            // Close peer (closes all transports, producers, consumers)
            peer.close();
            // Remove peer from room
            room.removePeer(socket.id);
            // Notify other peers
            socket.to(roomId).emit("user-disconnected", socket.id);
            // Leave socket.io room
            socket.leave(roomId);
            // Clean up room if empty
            if (room.isEmpty()) {
                roomService_1.roomService.removeRoom(roomId);
                hlsService_1.hlsService.stopTranscoding(roomId);
                console.log(`Room ${roomId} deleted (empty)`);
            }
            else if (room.peers.size < 2) {
                // Stop HLS transcoding if fewer than 2 peers
                hlsService_1.hlsService.stopTranscoding(roomId);
            }
            console.log(`Client ${socket.id} left room ${roomId}`);
            return { success: true };
        }
        catch (error) {
            console.error(`Error leaving room: ${error}`);
            return { success: false, error: `Failed to leave room: ${error}` };
        }
    },
    getRoomInfo: (roomId) => {
        const room = roomService_1.roomService.getRoom(roomId);
        if (!room)
            return { success: false, error: "Room not found" };
        return {
            success: true,
            room: room.toJSON(),
        };
    },
    handleChatMessage: (socket, roomId, message) => {
        try {
            const room = roomService_1.roomService.getRoom(roomId);
            if (!room)
                return { success: false, error: "Room not found" };
            // Broadcast message to all peers in the room except sender
            socket.to(roomId).emit("chat-message", {
                from: socket.id,
                message,
            });
            return { success: true };
        }
        catch (error) {
            console.error(`Error handling chat message: ${error}`);
            return { success: false, error: `Failed to handle chat message: ${error}` };
        }
    },
};
