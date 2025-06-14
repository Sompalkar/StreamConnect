import { createWorker } from "mediasoup"
import type { types } from "mediasoup"

class MediasoupService {
  private worker: types.Worker | null = null
  private initialized = false
  private initializing: Promise<void> | null = null

  async initialize(): Promise<void> {
    if (this.initialized) return
    if (this.initializing) return this.initializing

    this.initializing = new Promise<void>(async (resolve, reject) => {
      try {
        this.worker = await createWorker({
          logLevel: "warn",
          logTags: ["info", "ice", "dtls", "rtp", "srtp", "rtcp"],
          rtcMinPort: 10000,
          rtcMaxPort: 10100,
        })

        console.log(`Mediasoup worker created with pid ${this.worker.pid}`)
        this.initialized = true
        resolve()
      } catch (error) {
        console.error("Failed to create mediasoup worker:", error)
        reject(error)
      }
    })

    return this.initializing
  }

  async getWorker(): Promise<types.Worker> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!this.worker) {
      throw new Error("Mediasoup worker not initialized")
    }

    return this.worker
  }

  async createRouter(): Promise<types.Router> {
    const worker = await this.getWorker()

    return worker.createRouter({
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
      ],
    })
  }

  async close(): Promise<void> {
    if (this.worker) {
      await this.worker.close()
      this.worker = null
      this.initialized = false
      this.initializing = null
    }
  }
}

export const mediasoupService = new MediasoupService()
