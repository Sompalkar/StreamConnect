import { spawn, type ChildProcess } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import type { Room } from "../models/Room.js"

// Fix for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface StreamInfo {
  ffmpegProcess: ChildProcess
  isActive: boolean
  startTime: Date
}

class HlsService {
  private streams: Map<string, StreamInfo>
  private hlsDir: string

  constructor() {
    this.streams = new Map()
    this.hlsDir = path.join(__dirname, "../../public/hls")

    // Ensure HLS directory exists
    if (!fs.existsSync(this.hlsDir)) {
      fs.mkdirSync(this.hlsDir, { recursive: true })
    }

    console.log(`HLS directory: ${this.hlsDir}`)
  }

  async startHlsStream(room: Room): Promise<string> {
    // Stop existing stream if any
    await this.stopHlsStream(room.id)

    console.log(`🎥 Starting HLS stream for room ${room.roomCode}`)

    // Create room-specific HLS directory
    const roomHlsDir = path.join(this.hlsDir, room.id)
    if (!fs.existsSync(roomHlsDir)) {
      fs.mkdirSync(roomHlsDir, { recursive: true })
    }

    const playlistPath = path.join(roomHlsDir, "playlist.m3u8")
    const segmentPath = path.join(roomHlsDir, "segment_%03d.ts")

    // For development: Create a test stream with room info overlay
    const ffmpegArgs = [
      "-f",
      "lavfi",
      "-i",
      `testsrc2=size=1280x720:rate=30:duration=3600,format=yuv420p`,
      "-f",
      "lavfi",
      "-i",
      "sine=frequency=440:sample_rate=48000:duration=3600",
      "-vf",
      `drawtext=text='LIVE: ${room.title || room.roomCode}':fontcolor=white:fontsize=40:x=50:y=50:box=1:boxcolor=black@0.5`,
      "-c:v",
      "libx264",
      "-preset",
      "ultrafast", // Faster encoding for development
      "-tune",
      "zerolatency",
      "-g",
      "30", // Shorter GOP for lower latency
      "-sc_threshold",
      "0",
      "-b:v",
      "800k", // Lower bitrate for development
      "-maxrate",
      "1000k",
      "-bufsize",
      "1600k",
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ac",
      "2",
      "-f",
      "hls",
      "-hls_time",
      "2", // 2 second segments
      "-hls_list_size",
      "5", // Keep only 5 segments
      "-hls_flags",
      "delete_segments+independent_segments",
      "-hls_segment_filename",
      segmentPath,
      "-y", // Overwrite output files
      playlistPath,
    ]

    console.log(`FFmpeg command: ffmpeg ${ffmpegArgs.join(" ")}`)

    const ffmpegProcess = spawn("ffmpeg", ffmpegArgs, {
      stdio: ["ignore", "pipe", "pipe"],
    })

    // Handle FFmpeg output
    ffmpegProcess.stdout?.on("data", (data) => {
      console.log(`📺 FFmpeg stdout (${room.roomCode}): ${data.toString().trim()}`)
    })

    ffmpegProcess.stderr?.on("data", (data) => {
      const output = data.toString().trim()
      if (output.includes("frame=") || output.includes("time=")) {
        // Only log important info, not every frame
        if (output.includes("time=00:00:0")) {
          console.log(`📺 FFmpeg progress (${room.roomCode}): Stream starting...`)
        }
      } else {
        console.log(`📺 FFmpeg stderr (${room.roomCode}): ${output}`)
      }
    })

    ffmpegProcess.on("close", (code) => {
      console.log(`📺 FFmpeg process for room ${room.roomCode} exited with code ${code}`)
      this.streams.delete(room.id)
    })

    ffmpegProcess.on("error", (error) => {
      console.error(`❌ FFmpeg error for room ${room.roomCode}:`, error)
      this.streams.delete(room.id)
    })

    // Store stream info
    this.streams.set(room.id, {
      ffmpegProcess,
      isActive: true,
      startTime: new Date(),
    })

    // Wait a moment for the stream to start
    await new Promise((resolve) => setTimeout(resolve, 2000))

    const hlsUrl = `/hls/${room.id}/playlist.m3u8`
    console.log(`✅ HLS stream started for room ${room.roomCode}: ${hlsUrl}`)

    return hlsUrl
  }

  async stopHlsStream(roomId: string): Promise<void> {
    const streamInfo = this.streams.get(roomId)
    if (streamInfo) {
      console.log(`🛑 Stopping HLS stream for room ${roomId}`)

      // Kill FFmpeg process
      streamInfo.ffmpegProcess.kill("SIGTERM")

      // Wait a moment for graceful shutdown
      setTimeout(() => {
        if (!streamInfo.ffmpegProcess.killed) {
          streamInfo.ffmpegProcess.kill("SIGKILL")
        }
      }, 2000)

      this.streams.delete(roomId)

      // Clean up HLS files after a delay
      setTimeout(() => {
        const roomHlsDir = path.join(this.hlsDir, roomId)
        if (fs.existsSync(roomHlsDir)) {
          try {
            fs.rmSync(roomHlsDir, { recursive: true, force: true })
            console.log(`🧹 Cleaned up HLS files for room ${roomId}`)
          } catch (error) {
            console.error(`❌ Error cleaning up HLS files for room ${roomId}:`, error)
          }
        }
      }, 5000)
    }
  }

  getHlsUrl(roomId: string): string {
    return `/hls/${roomId}/playlist.m3u8`
  }

  isStreamActive(roomId: string): boolean {
    const streamInfo = this.streams.get(roomId)
    return streamInfo?.isActive || false
  }

  getActiveStreams(): Array<{ roomId: string; startTime: Date; hlsUrl: string }> {
    const activeStreams: Array<{ roomId: string; startTime: Date; hlsUrl: string }> = []

    for (const [roomId, streamInfo] of this.streams.entries()) {
      if (streamInfo.isActive) {
        activeStreams.push({
          roomId,
          startTime: streamInfo.startTime,
          hlsUrl: this.getHlsUrl(roomId),
        })
      }
    }

    return activeStreams
  }

  async cleanup(): Promise<void> {
    console.log("🧹 Cleaning up all HLS streams...")

    // Stop all streams
    const stopPromises = Array.from(this.streams.keys()).map((roomId) => this.stopHlsStream(roomId))
    await Promise.all(stopPromises)

    // Clean up all HLS directories
    try {
      if (fs.existsSync(this.hlsDir)) {
        fs.rmSync(this.hlsDir, { recursive: true, force: true })
        fs.mkdirSync(this.hlsDir, { recursive: true })
        console.log("✅ HLS cleanup completed")
      }
    } catch (error) {
      console.error("❌ Error during HLS cleanup:", error)
    }
  }
}

export const hlsService = new HlsService()
