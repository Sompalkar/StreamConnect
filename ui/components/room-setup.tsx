"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Users, ArrowRight, Sparkles, Video, Mic, Camera } from "lucide-react"
import { motion } from "framer-motion"

interface RoomSetupProps {
  onCreateRoom: () => void
  onJoinRoom: (roomCode: string) => void
  isLoading: boolean
}

export function RoomSetup({ onCreateRoom, onJoinRoom, isLoading }: RoomSetupProps) {
  const [roomCode, setRoomCode] = useState("")

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault()
    if (roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase())
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Ready to Connect</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Start Your Meeting
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create a new room or join an existing one to start your video conference
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-8 mb-12">
        {/* Create Room Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Plus className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">Create New Room</CardTitle>
              <p className="text-muted-foreground">
                Start a new meeting room and invite others to join your video conference
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Instant room creation</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Share room code with participants</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Host controls and live streaming</span>
                </div>
              </div>
              <Button
                onClick={onCreateRoom}
                disabled={isLoading}
                className="w-full gradient-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Creating Room...
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Room Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">Join Meeting</CardTitle>
              <p className="text-muted-foreground">
                Enter a room code to join an ongoing meeting with other participants
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="roomCode" className="text-sm font-medium">
                    Meeting Room Code
                  </label>
                  <Input
                    id="roomCode"
                    placeholder="Enter 6-digit code (e.g., ABC123)"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider h-12 border-2 focus:border-primary"
                    maxLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading || !roomCode.trim()}
                  className="w-full gradient-secondary text-primary-foreground gap-2 transition-all duration-300"
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Joining...
                    </div>
                  ) : (
                    <>
                      Join Meeting
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Features section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid md:grid-cols-3 gap-6"
      >
        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Video className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-semibold mb-2">HD Video Quality</h3>
          <p className="text-sm text-muted-foreground">
            Crystal clear video calls with adaptive quality based on your connection
          </p>
        </Card>

        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <div className="w-12 h-12 gradient-secondary rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mic className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Clear Audio</h3>
          <p className="text-sm text-muted-foreground">
            High-quality audio with noise cancellation for better communication
          </p>
        </Card>

        <Card className="p-6 text-center border-2 border-transparent hover:border-primary/20 transition-all duration-300">
          <div className="w-12 h-12 gradient-accent rounded-xl flex items-center justify-center mx-auto mb-4">
            <Camera className="h-6 w-6 text-primary-foreground" />
          </div>
          <h3 className="font-semibold mb-2">Live Streaming</h3>
          <p className="text-sm text-muted-foreground">
            Broadcast your meetings to a wider audience with live streaming
          </p>
        </Card>
      </motion.div>

      {/* Privacy notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 p-4 bg-muted/50 rounded-lg border text-center"
      >
        <p className="text-sm text-muted-foreground">
          <strong>Privacy Notice:</strong> Your camera and microphone will be activated when you create or join a room.
          You can control these permissions at any time during the meeting.
        </p>
      </motion.div>
    </div>
  )
}
