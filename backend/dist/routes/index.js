"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const roomController_1 = require("../controllers/roomController");
const router = express_1.default.Router();
// API routes
router.get("/rooms/:roomId", (req, res) => {
    const { roomId } = req.params;
    const result = roomController_1.roomController.getRoomInfo(roomId);
    if (result.success) {
        res.json(result);
    }
    else {
        res.status(404).json(result);
    }
});
router.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
exports.default = router;
