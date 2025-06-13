"use client"

import { create } from "zustand"
import { io, type Socket } from "socket.io-client"
import { RTCSessionDescription, RTCIceCandidate } from "webrtc"

export interface ChatMessage {
  text: string
  sender: string
  timestamp: number
  isLocal: boolean
}

export interface Room {
  id: string
  roomCode: string
  watchCode: string
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

  // Actions
  initializeStream: () => Promise<void>
  toggleMic: () => void
  toggleCamera: () => void
  createRoom: () => Promise<Room>
  joinRoom: (roomCode: string) => Promise<void>
  connectToRoom: (roomId: string) => Promise<void>
  disconnectFromRoom: () => void
  sendChatMessage: (text: string) => void
}

// Configuration for WebRTC peer connections
const peerConfiguration: RTCConfiguration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
}

// Generate random room codes
const generateRoomCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

const generateWatchCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "WATCH"
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export const useStreamStore = create<StreamState>((set, get) => ({
  localStream: null,
  remoteStreams: [],
  isMicOn: true,
  isCameraOn: true,
  isConnected: false,
  socket: null,
  peerConnections: {},
  chatMessages: [],
  dataChannels: {},
  currentRoom: null,

  // Initialize media stream (camera and microphone)
  initializeStream: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })

      set({ localStream: stream, isMicOn: true, isCameraOn: true })
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
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

  // Toggle camera on/off
  toggleCamera: () => {
    const { localStream, isCameraOn } = get()
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOn
      })
      set({ isCameraOn: !isCameraOn })
    }
  },

  // Create a new room
  createRoom: async () => {
    const roomCode = generateRoomCode()
    const watchCode = generateWatchCode()

    const room: Room = {
      id: roomCode.toLowerCase(),
      roomCode,
      watchCode,
    }

    // Connect to the room immediately after creating
    await get().connectToRoom(room.id)

    set({ currentRoom: room })
    return room
  },

  // Join an existing room by room code
  joinRoom: async (roomCode: string) => {
    const roomId = roomCode.toLowerCase()

    // For simplicity, we'll generate a watch code for joined rooms
    // In a real app, this would come from the server
    const watchCode = generateWatchCode()

    const room: Room = {
      id: roomId,
      roomCode: roomCode.toUpperCase(),
      watchCode,
    }

    await get().connectToRoom(roomId)
    set({ currentRoom: room })
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
      if (socket.id < userId) {
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
      if (socket.id < userId) {
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
              sender: message.sender || userId,
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

  // Disconnect from room
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

    set({
      socket: null,
      peerConnections: {},
      dataChannels: {},
      remoteStreams: [],
      isConnected: false,
      currentRoom: null,
      chatMessages: [],
    })
  },

  // Send chat message via data channel
  sendChatMessage: (text: string) => {
    const { dataChannels, socket } = get()

    if (!text.trim() || !socket) return

    const message = {
      type: "chat",
      text,
      sender: socket.id,
      timestamp: Date.now(),
    }

    // Send to all peers via data channels
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
