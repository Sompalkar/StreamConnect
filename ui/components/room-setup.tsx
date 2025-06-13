"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Users, ArrowRight } from "lucide-react"

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
    <div className="w-full max-w-2xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
          Start Streaming
        </h1>
        <p className="text-gray-600">Create a new room or join an existing one to start your streaming session</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Create Room Card */}
        <Card className="border-2 border-purple-100 hover:border-purple-200 transition-colors">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Create New Room</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Start a new streaming room and get unique codes to share with participants and viewers.
            </p>
            <Button
              onClick={onCreateRoom}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
            >
              {isLoading ? "Creating..." : "Create Room"}
            </Button>
          </CardContent>
        </Card>

        {/* Join Room Card */}
        <Card className="border-2 border-blue-100 hover:border-blue-200 transition-colors">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-xl">Join Existing Room</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-6 text-center">Enter a room code to join an existing streaming session.</p>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <Input
                placeholder="Enter room code (e.g., ABC123)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                className="text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
              <Button
                type="submit"
                disabled={isLoading || !roomCode.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 gap-2"
              >
                {isLoading ? "Joining..." : "Join Room"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Info section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
        <h3 className="font-semibold mb-3 text-center">How it works:</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
              1
            </div>
            <p>Create or join a room</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
              2
            </div>
            <p>Share codes with others</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 font-semibold">
              3
            </div>
            <p>Start streaming together</p>
          </div>
        </div>
      </div>
    </div>
  )
}
