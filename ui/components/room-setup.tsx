"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Users, ArrowRight, Sparkles } from "lucide-react"
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
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Ready to Stream</span>
        </div>
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Start Your Streaming Session
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Create a new room or join an existing one to start your professional streaming experience
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Create Room Card */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="h-full border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 shadow-card hover:shadow-glow">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-primary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow">
                <Plus className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">Create New Room</CardTitle>
              <p className="text-muted-foreground">
                Start fresh with a new streaming room and get unique codes for participants and viewers
              </p>
            </CardHeader>
            <CardContent className="text-center">
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Get unique room code for streamers</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Receive watch code for viewers</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span>Full control over room settings</span>
                </div>
              </div>
              <Button
                onClick={onCreateRoom}
                disabled={isLoading}
                className="w-full gradient-primary text-primary-foreground shadow-glow hover:shadow-lg transition-all duration-300"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                    Creating Room...
                  </div>
                ) : (
                  "Create Room"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Join Room Card */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 shadow-card">
            <CardHeader className="text-center pb-6">
              <div className="w-20 h-20 gradient-secondary rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-primary-foreground" />
              </div>
              <CardTitle className="text-2xl mb-2">Join Existing Room</CardTitle>
              <p className="text-muted-foreground">
                Enter a room code to join an ongoing streaming session with other participants
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="roomCode" className="text-sm font-medium">
                    Room Code
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
                      Joining Room...
                    </div>
                  ) : (
                    <>
                      Join Room
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-12 p-8 bg-muted/50 rounded-2xl border"
      >
        <h3 className="font-semibold text-lg mb-6 text-center">How StreamConnect Works</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
              1
            </div>
            <h4 className="font-medium mb-2">Create or Join</h4>
            <p className="text-sm text-muted-foreground">
              Start a new room or join with a code to begin your streaming session
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 gradient-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
              2
            </div>
            <h4 className="font-medium mb-2">Share & Invite</h4>
            <p className="text-sm text-muted-foreground">
              Share room codes with streamers and watch codes with viewers
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center mx-auto mb-4 text-primary-foreground font-bold">
              3
            </div>
            <h4 className="font-medium mb-2">Stream & Engage</h4>
            <p className="text-sm text-muted-foreground">
              Start streaming with real-time chat and professional controls
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
