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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const router = express_1.default.Router();
// Create a new room
router.post("/rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield roomController_1.roomController.createRoom();
    if (result.success) {
        res.json(result);
    }
    else {
        res.status(500).json(result);
    }
}));
// Get room info by room code
router.get("/rooms/code/:roomCode", (req, res) => {
    const { roomCode } = req.params;
    const result = roomController_1.roomController.getRoomByCode(roomCode);
    if (result.success) {
        res.json(result);
    }
    else {
        res.status(404).json(result);
    }
});
// Get room info by watch code
router.get("/rooms/watch/:watchCode", (req, res) => {
    const { watchCode } = req.params;
    const result = roomController_1.roomController.getRoomByWatchCode(watchCode);
    if (result.success) {
        res.json(result);
    }
    else {
        res.status(404).json(result);
    }
});
// Get all rooms (admin endpoint)
router.get("/rooms", (req, res) => {
    const result = roomController_1.roomController.getAllRooms();
    res.json(result);
});
// Health check
router.get("/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
exports.default = router;
