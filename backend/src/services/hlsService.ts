import { spawn, type ChildProcess } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { Room } from "../models/Room"

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class HlsService {
  private ffmpegProcesses: Map<string, ChildProcess>
  private hlsDir: string

  constructor() {
    this.ffmpegProcesses = new Map()
    this.hlsDir = path.join(__dirname, "../../public/hls")

    // Ensure HLS directory exists
    if (!fs.existsSync(this.hlsDir)) {
      fs.mkdirSync(this.hlsDir, { recursive: true })
    }
  }

  startTranscoding(room: Room): void {
    // Stop existing process if any
    this.stopTranscoding(room.id)

    console.log(`Starting HLS transcoding for room ${room.id}`)

    // Create room-specific HLS directory
    const roomHlsDir = path.join(this.hlsDir, room.id)
    if (!fs.existsSync(roomHlsDir)) {
      fs.mkdirSync(roomHlsDir, { recursive: true })
    }

    // Start FFmpeg process
    // This is a simplified example - in a real app, you'd need to configure this based on your needs
    const ffmpegProcess = spawn("ffmpeg", [
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
    ])

    ffmpegProcess.stdout.on("data", (data) => {
      console.log(`FFmpeg stdout (${room.id}): ${data}`)
    })

    ffmpegProcess.stderr.on("data", (data) => {
      console.log(`FFmpeg stderr (${room.id}): ${data}`)
    })

    ffmpegProcess.on("close", (code) => {
      console.log(`FFmpeg process for room ${room.id} exited with code ${code}`)
    })

    this.ffmpegProcesses.set(room.id, ffmpegProcess)
  }

  stopTranscoding(roomId: string): void {
    const ffmpegProcess = this.ffmpegProcesses.get(roomId)
    if (ffmpegProcess) {
      console.log(`Stopping HLS transcoding for room ${roomId}`)
      ffmpegProcess.kill()
      this.ffmpegProcesses.delete(roomId)
    }
  }

  getHlsUrl(roomId: string): string {
    return `/hls/${roomId}/stream.m3u8`
  }

  cleanup(): void {
    // Kill all FFmpeg processes
    this.ffmpegProcesses.forEach((process, roomId) => {
      console.log(`Cleaning up FFmpeg process for room ${roomId}`)
      process.kill()
    })
    this.ffmpegProcesses.clear()
  }
}

export const hlsService = new HlsService()

