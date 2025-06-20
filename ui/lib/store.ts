"use client"

import { create } from "zustand"
import { io, type Socket } from "socket.io-client"

export interface ChatMessage {
  text: string
  sender: string
  timestamp: number
  isLocal: boolean
}

export interface Room {
  id: string
  roomCode: string
  title?: string
  description?: string
  isLive?: boolean
  createdAt: Date
  hlsUrl?: string
}

interface StreamState {
  localStream: MediaStream | null
  remoteStreams: MediaStream[]
  isMicOn: boolean
  isCameraOn: boolean
  isConnected: boolean
  socket: Socket | null
  peerConnections: Record<string, RTCPeerConnection>
  chatMessages: ChatMessage[]
  dataChannels: Record<string, RTCDataChannel>
  currentRoom: Room | null
  isLive: boolean
  isCreator: boolean
  isInitialized: boolean

  // Actions
  initializeStream: () => Promise<void>
  stopStream: () => void
  toggleMic: () => void
  toggleCamera: () => void
  createRoom: () => Promise<Room>
  joinRoom: (roomCode: string) => Promise<void>
  connectToRoom: (roomId: string) => Promise<void>
  disconnectFromRoom: () => void
  sendChatMessage: (text: string) => void
  goLive: (title: string, description: string) => Promise<void>
  endLive: () => Promise<void>
}

// Configuration for WebRTC peer connections
const peerConfiguration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

export const useStreamStore = create<StreamState>((set, get) => ({
  localStream: null,
  remoteStreams: [],
  isMicOn: false,
  isCameraOn: false,
  isConnected: false,
  socket: null,
  peerConnections: {},
  chatMessages: [],
  dataChannels: {},
  currentRoom: null,
  isLive: false,
  isCreator: false,
  isInitialized: false,

  // Initialize media stream only when joining a room
  initializeStream: async () => {
    try {
      // Stop existing stream if any
      const existingStream = get().localStream
      if (existingStream) {
        existingStream.getTracks().forEach((track) => track.stop())
      }

      console.log("Requesting camera and microphone access...")
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      console.log("Media access granted")
      set({
        localStream: stream,
        isMicOn: true,
        isCameraOn: true,
        isInitialized: true,
      })
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  },

  // Stop media stream and revoke access
  stopStream: () => {
    const { localStream } = get()
    if (localStream) {
      console.log("Stopping media stream and revoking camera access...")
      localStream.getTracks().forEach((track) => {
        track.stop()
      })
      set({
        localStream: null,
        isMicOn: false,
        isCameraOn: false,
        isInitialized: false,
      })
    }
  },

  // Toggle microphone on/off
  toggleMic: () => {
    const { localStream, isMicOn } = get()
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn
      })
      set({ isMicOn: !isMicOn })
    }
  },

  // Toggle camera on/off with proper stream management
  toggleCamera: async () => {
    const { localStream, isCameraOn, peerConnections } = get()

    if (!localStream) return

    if (isCameraOn) {
      // Turn camera off - disable video tracks
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = false
      })
      set({ isCameraOn: false })
    } else {
      // Turn camera on - we need to get a fresh video track
      try {
        // Get new video stream
        const newVideoStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            frameRate: { ideal: 30 },
          },
        })

        const newVideoTrack = newVideoStream.getVideoTracks()[0]
        const oldVideoTrack = localStream.getVideoTracks()[0]

        if (oldVideoTrack) {
          // Replace the old video track with the new one
          localStream.removeTrack(oldVideoTrack)
          oldVideoTrack.stop()
        }

        // Add the new video track
        localStream.addTrack(newVideoTrack)

        // Update all peer connections with the new track
        Object.values(peerConnections).forEach(async (pc) => {
          const sender = pc.getSenders().find((s) => s.track?.kind === "video")
          if (sender) {
            try {
              await sender.replaceTrack(newVideoTrack)
            } catch (error) {
              console.error("Error replacing video track:", error)
            }
          } else {
            // If no video sender exists, add the track
            pc.addTrack(newVideoTrack, localStream)
          }
        })

        set({ isCameraOn: true })
      } catch (error) {
        console.error("Error restarting camera:", error)
        // Fallback: just enable the existing track
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = true
        })
        set({ isCameraOn: true })
      }
    }
  },

  // Create a new room
  createRoom: async () => {
    try {
      const response = await fetch("http://localhost:3001/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          creatorId: "user-" + Math.random().toString(36).substr(2, 9),
        }),
      })

      const data = await response.json()
      if (!data.success) {
        throw new Error(data.error)
      }

      const room: Room = {
        id: data.room.id,
        roomCode: data.room.roomCode,
        title: data.room.title,
        description: data.room.description,
        isLive: data.room.isLive,
        createdAt: new Date(),
      }

      // Connect to the room immediately after creating
      await get().connectToRoom(room.id)

      set({ currentRoom: room, isCreator: true })
      return room
    } catch (error) {
      console.error("Failed to create room:", error)
      throw error
    }
  },

  // Join an existing room by room code
  joinRoom: async (roomCode: string) => {
    const roomId = roomCode.toLowerCase()

    const room: Room = {
      id: roomId,
      roomCode: roomCode.toUpperCase(),
      createdAt: new Date(),
    }

    await get().connectToRoom(roomId)
    set({ currentRoom: room, isCreator: false })
  },

  // Connect to a room (WebRTC setup)
  connectToRoom: async (roomId: string) => {
    const { localStream } = get()
    if (!localStream) {
      throw new Error("Local stream not initialized")
    }

    // Connect to signaling server
    const socket = io("http://localhost:3001")

    // Set up socket event handlers
    socket.on("connect", () => {
      console.log("Connected to signaling server")
      socket.emit("join-room", roomId)
    })

    socket.on("user-connected", async (userId: string) => {
      console.log("User connected:", userId)
      await createPeerConnection(userId, socket, localStream)
    })

    socket.on("user-disconnected", (userId: string) => {
      console.log("User disconnected:", userId)
      closePeerConnection(userId)
    })

    socket.on("offer", async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      const { from, offer } = data
      console.log("Received offer from:", from)

      const pc = await createPeerConnection(from, socket, localStream)
      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      socket.emit("answer", {
        to: from,
        answer,
      })
    })

    socket.on("answer", async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      const { from, answer } = data
      console.log("Received answer from:", from)

      const pc = get().peerConnections[from]
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer))
      }
    })

    socket.on("ice-candidate", async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      const { from, candidate } = data
      console.log("Received ICE candidate from:", from)

      const pc = get().peerConnections[from]
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on(
      "room-live-status",
      (data: { isLive: boolean; title?: string; description?: string; hlsUrl?: string }) => {
        set({
          isLive: data.isLive,
          currentRoom: get().currentRoom
            ? {
                ...get().currentRoom!,
                title: data.title || get().currentRoom!.title,
                description: data.description || get().currentRoom!.description,
                isLive: data.isLive,
                hlsUrl: data.hlsUrl,
              }
            : null,
        })
      },
    )

    // Handle chat messages from socket
    socket.on("chat-message", (data: { from: string; message: string; timestamp: number }) => {
      const chatMessage: ChatMessage = {
        text: data.message,
        sender: data.from === socket.id ? "You" : `User ${data.from.slice(-4)}`,
        timestamp: data.timestamp,
        isLocal: data.from === socket.id,
      }
      set({ chatMessages: [...get().chatMessages, chatMessage] })
    })

    set({ socket, isConnected: true })

    // Helper function to create peer connections
    async function createPeerConnection(userId: string, socket: Socket, stream: MediaStream) {
      const peerConnections = get().peerConnections
      const dataChannels = get().dataChannels

      // Close existing connection if any
      if (peerConnections[userId]) {
        peerConnections[userId].close()
      }

      // Create new peer connection
      const pc = new RTCPeerConnection(peerConfiguration)

      // Add local tracks to the connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream)
      })

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: userId,
            candidate: event.candidate,
          })
        }
      }

      // Handle remote tracks
      pc.ontrack = (event) => {
        const remoteStream = event.streams[0]

        // Check if we already have this stream
        const remoteStreams = get().remoteStreams
        const exists = remoteStreams.some((s) => s.id === remoteStream.id)

        if (!exists) {
          set({ remoteStreams: [...remoteStreams, remoteStream] })
        }
      }

      // Create data channel for chat if we're the initiator
      if (socket.id! < userId) {
        const dataChannel = pc.createDataChannel("chat")
        setupDataChannel(dataChannel, userId)
      } else {
        // Otherwise listen for the data channel
        pc.ondatachannel = (event) => {
          setupDataChannel(event.channel, userId)
        }
      }

      // Store the peer connection
      set({
        peerConnections: {
          ...get().peerConnections,
          [userId]: pc,
        },
      })

      // Create and send offer if we're the initiator
      if (socket.id! < userId) {
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)

        socket.emit("offer", {
          to: userId,
          offer,
        })
      }

      return pc
    }

    // Helper function to set up data channel for chat
    function setupDataChannel(dataChannel: RTCDataChannel, userId: string) {
      dataChannel.onopen = () => {
        console.log(`Data channel with ${userId} opened`)
      }

      dataChannel.onclose = () => {
        console.log(`Data channel with ${userId} closed`)
      }

      dataChannel.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data)
          if (message.type === "chat") {
            const chatMessage: ChatMessage = {
              text: message.text,
              sender: message.sender || `User ${userId.slice(-4)}`,
              timestamp: message.timestamp || Date.now(),
              isLocal: false,
            }
            set({ chatMessages: [...get().chatMessages, chatMessage] })
          }
        } catch (error) {
          console.error("Error parsing message:", error)
        }
      }

      // Store the data channel
      set({
        dataChannels: {
          ...get().dataChannels,
          [userId]: dataChannel,
        },
      })
    }

    // Helper function to close peer connections
    function closePeerConnection(userId: string) {
      const { peerConnections, remoteStreams, dataChannels } = get()

      // Close the data channel
      if (dataChannels[userId]) {
        dataChannels[userId].close()
        const updatedDataChannels = { ...dataChannels }
        delete updatedDataChannels[userId]
        set({ dataChannels: updatedDataChannels })
      }

      // Close the connection
      if (peerConnections[userId]) {
        peerConnections[userId].close()

        // Remove the connection
        const updatedConnections = { ...peerConnections }
        delete updatedConnections[userId]

        // Remove the stream (simplified approach)
        const updatedStreams = remoteStreams.filter((_, index) => index !== 0) // Remove first stream as example

        set({
          peerConnections: updatedConnections,
          remoteStreams: updatedStreams,
        })
      }
    }
  },

  // Go live
  goLive: async (title: string, description: string) => {
    const { socket, currentRoom } = get()
    if (!socket || !currentRoom) {
      throw new Error("Not connected to a room")
    }

    socket.emit("go-live", {
      roomId: currentRoom.id,
      title,
      description,
    })

    // The live status will be updated via the socket event
  },

  // End live
  endLive: async () => {
    const { socket, currentRoom } = get()
    if (!socket || !currentRoom) {
      throw new Error("Not connected to a room")
    }

    socket.emit("end-live", {
      roomId: currentRoom.id,
    })

    // The live status will be updated via the socket event
  },

  // Disconnect from room and stop camera access
  disconnectFromRoom: () => {
    const { socket, peerConnections, dataChannels } = get()

    // Close all data channels
    Object.values(dataChannels).forEach((channel) => {
      channel.close()
    })

    // Close all peer connections
    Object.values(peerConnections).forEach((pc) => {
      pc.close()
    })

    // Disconnect socket
    if (socket) {
      socket.disconnect()
    }

    // Stop media stream and revoke camera access
    get().stopStream()

    set({
      socket: null,
      peerConnections: {},
      dataChannels: {},
      remoteStreams: [],
      isConnected: false,
      currentRoom: null,
      chatMessages: [],
      isLive: false,
      isCreator: false,
    })
  },

  // Send chat message via socket and data channel
  sendChatMessage: (text: string) => {
    const { dataChannels, socket } = get()

    if (!text.trim()) return

    const message = {
      type: "chat",
      text,
      sender: "You",
      timestamp: Date.now(),
    }

    // Send via socket for server-side broadcasting
    if (socket) {
      socket.emit("chat-message", { message: text })
    }

    // Send to all peers via data channels as backup
    Object.values(dataChannels).forEach((channel) => {
      if (channel.readyState === "open") {
        channel.send(JSON.stringify(message))
      }
    })

    // Add to local messages
    const chatMessage: ChatMessage = {
      text,
      sender: "You",
      timestamp: Date.now(),
      isLocal: true,
    }

    set({ chatMessages: [...get().chatMessages, chatMessage] })
  },
}))
