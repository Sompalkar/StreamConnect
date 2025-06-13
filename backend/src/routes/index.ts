import express from "express"
import { roomController } from "../controllers/roomController"

const router = express.Router()

// API routes
router.get("/rooms/:roomId", (req, res) => {
  const { roomId } = req.params
  const result = roomController.getRoomInfo(roomId)

  if (result.success) {
    res.json(result)
  } else {
    res.status(404).json(result)
  }
})

router.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

export default router
