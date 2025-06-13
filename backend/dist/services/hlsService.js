"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hlsService = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class HlsService {
    constructor() {
        this.ffmpegProcesses = new Map();
        this.hlsDir = path_1.default.join(__dirname, "../../public/hls");
        // Ensure HLS directory exists
        if (!fs_1.default.existsSync(this.hlsDir)) {
            fs_1.default.mkdirSync(this.hlsDir, { recursive: true });
        }
    }
    startTranscoding(room) {
        // Stop existing process if any
        this.stopTranscoding(room.id);
        console.log(`Starting HLS transcoding for room ${room.id}`);
        // Create room-specific HLS directory
        const roomHlsDir = path_1.default.join(this.hlsDir, room.id);
        if (!fs_1.default.existsSync(roomHlsDir)) {
            fs_1.default.mkdirSync(roomHlsDir, { recursive: true });
        }
        // Start FFmpeg process
        // This is a simplified example - in a real app, you'd need to configure this based on your needs
        const ffmpegProcess = (0, child_process_1.spawn)("ffmpeg", [
            "-re",
            "-i",
            "rtp://127.0.0.1:5000",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-tune",
            "zerolatency",
            "-c:a",
            "aac",
            "-ar",
            "48000",
            "-b:a",
            "128k",
            "-ac",
            "2",
            "-f",
            "hls",
            "-hls_time",
            "2",
            "-hls_list_size",
            "10",
            "-hls_flags",
            "delete_segments",
            "-hls_segment_filename",
            `${roomHlsDir}/segment_%03d.ts`,
            `${roomHlsDir}/stream.m3u8`,
        ]);
        ffmpegProcess.stdout.on("data", (data) => {
            console.log(`FFmpeg stdout (${room.id}): ${data}`);
        });
        ffmpegProcess.stderr.on("data", (data) => {
            console.log(`FFmpeg stderr (${room.id}): ${data}`);
        });
        ffmpegProcess.on("close", (code) => {
            console.log(`FFmpeg process for room ${room.id} exited with code ${code}`);
        });
        this.ffmpegProcesses.set(room.id, ffmpegProcess);
    }
    stopTranscoding(roomId) {
        const ffmpegProcess = this.ffmpegProcesses.get(roomId);
        if (ffmpegProcess) {
            console.log(`Stopping HLS transcoding for room ${roomId}`);
            ffmpegProcess.kill();
            this.ffmpegProcesses.delete(roomId);
        }
    }
    getHlsUrl(roomId) {
        return `/hls/${roomId}/stream.m3u8`;
    }
    cleanup() {
        // Kill all FFmpeg processes
        this.ffmpegProcesses.forEach((process, roomId) => {
            console.log(`Cleaning up FFmpeg process for room ${roomId}`);
            process.kill();
        });
        this.ffmpegProcesses.clear();
    }
}
exports.hlsService = new HlsService();
