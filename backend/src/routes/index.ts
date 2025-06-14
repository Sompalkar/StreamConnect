import express from "express"
import { roomController } from "../controllers/roomController"

const router = express.Router()

// Create a new room
router.post("/rooms", async (req, res) => {
  const { creatorId } = req.body
  const result = await roomController.createRoom(creatorId || "anonymous")

  if (result.success) {
    res.json(result)
  } else {
    res.status(500).json(result)
  }
})

// Get live rooms for watch page
router.get("/rooms/live", (req, res) => {
  const result = roomController.getLiveRooms()

  if (result.success) {
    res.json(result)
  } else {
    res.status(500).json(result)
  }
})

// Get room info by room code
router.get("/rooms/code/:roomCode", (req, res) => {
  const { roomCode } = req.params
  const result = roomController.getRoomByCode(roomCode)

  if (result.success) {
    res.json(result)
  } else {
    res.status(404).json(result)
  }
})

// Get room info by watch code
router.get("/rooms/watch/:watchCode", (req, res) => {
  const { watchCode } = req.params
  const result = roomController.getRoomByWatchCode(watchCode)

  if (result.success) {
    res.json(result)
  } else {
    res.status(404).json(result)
  }
})

// Get all rooms (admin endpoint)
router.get("/rooms", (req, res) => {
  const result = roomController.getAllRooms()
  res.json(result)
})

// Health check
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

export default router
