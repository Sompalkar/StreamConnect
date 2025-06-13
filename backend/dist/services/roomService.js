"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomService = void 0;
const Room_1 = require("../models/Room");
class RoomService {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(roomId, router) {
        const room = new Room_1.Room(roomId, router);
        this.rooms.set(roomId, room);
        return room;
    }
    getRoom(roomId) {
        return this.rooms.get(roomId);
    }
    removeRoom(roomId) {
        return this.rooms.delete(roomId);
    }
    getAllRooms() {
        return Array.from(this.rooms.values());
    }
}
exports.roomService = new RoomService();
