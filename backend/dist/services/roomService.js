"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = void 0;
const Room_1 = require("../models/Room");
class RoomService {
    constructor() {
        this.rooms = new Map();
        this.roomCodeToId = new Map();
        this.watchCodeToId = new Map();
    }
    // Generate unique room code
    generateRoomCode() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code;
        do {
            code = "";
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.roomCodeToId.has(code));
        return code;
    }
    // Generate unique watch code
    generateWatchCode() {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let code;
        do {
            code = "WATCH";
            for (let i = 0; i < 3; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.watchCodeToId.has(code));
        return code;
    }
    // Create a new room
    createRoom(router) {
        const roomCode = this.generateRoomCode();
        const watchCode = this.generateWatchCode();
        const roomId = roomCode.toLowerCase();
        const room = new Room_1.Room(roomId, roomCode, watchCode, router);
        // Store room with multiple indexes
        this.rooms.set(roomId, room);
        this.roomCodeToId.set(roomCode, roomId);
        this.watchCodeToId.set(watchCode, roomId);
        console.log(`Room created: ${roomCode} (Watch: ${watchCode})`);
        return room;
    }
    // Get room by ID
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    // Get room by room code
    getRoomByCode(roomCode) {
        const roomId = this.roomCodeToId.get(roomCode.toUpperCase());
        return roomId ? this.rooms.get(roomId) : undefined;
    }
    // Get room by watch code
    getRoomByWatchCode(watchCode) {
        const roomId = this.watchCodeToId.get(watchCode.toUpperCase());
        return roomId ? this.rooms.get(roomId) : undefined;
    }
    // Remove a room and clean up all references
    removeRoom(roomId) {
        const room = this.rooms.get(roomId);
        if (!room)
            return false;
        // Clean up all indexes
        this.roomCodeToId.delete(room.roomCode);
        this.watchCodeToId.delete(room.watchCode);
        const removed = this.rooms.delete(roomId);
        if (removed) {
            console.log(`Room ${room.roomCode} deleted`);
        }
        return removed;
    }
    // Get all active rooms
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
    // Get room statistics
    getRoomStats() {
        return {
            totalRooms: this.rooms.size,
            totalPeers: Array.from(this.rooms.values()).reduce((sum, room) => sum + room.peers.size, 0),
            rooms: Array.from(this.rooms.values()).map((room) => room.getStats()),
        };
    }
    // Clean up empty rooms (can be called periodically)
    cleanupEmptyRooms() {
        let cleaned = 0;
        for (const [roomId, room] of this.rooms.entries()) {
            if (room.isEmpty()) {
                this.removeRoom(roomId);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            console.log(`Cleaned up ${cleaned} empty rooms`);
        }
        return cleaned;
    }
}
exports.roomService = new RoomService();
