import { Room } from "../models/Room"
import type { Router } from "mediasoup/node/lib/Router"

class RoomService {
  private rooms: Map<string, Room>

  constructor() {
    this.rooms = new Map()
  }

  createRoom(roomId: string, router: Router): Room {
    const room = new Room(roomId, router)
    this.rooms.set(roomId, room)
    return room
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId)
  }

  removeRoom(roomId: string): boolean {
    return this.rooms.delete(roomId)
  }

  getAllRooms(): Room[] {
    return Array.from(this.rooms.values())
  }
}

export const roomService = new RoomService()
