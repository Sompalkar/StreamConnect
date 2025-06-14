"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Radio, BluetoothOffIcon as RadioOff } from "lucide-react"

interface LiveStreamControlsProps {
  isLive: boolean
  onGoLive: (title: string, description: string) => void
  onEndLive: () => void
  isLoading: boolean
}

export function LiveStreamControls({ isLive, onGoLive, onEndLive, isLoading }: LiveStreamControlsProps) {
  const [showGoLiveDialog, setShowGoLiveDialog] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  const handleGoLive = () => {
    onGoLive(title || "Live Stream", description || "Live streaming session")
    setShowGoLiveDialog(false)
    setTitle("")
    setDescription("")
  }

  if (isLive) {
    return (
      <Button
        variant="destructive"
        size="sm"
        onClick={onEndLive}
        disabled={isLoading}
        className="gap-2 bg-red-600 hover:bg-red-700"
      >
        <RadioOff className="h-4 w-4" />
        End Live
      </Button>
    )
  }

  return (
    <Dialog open={showGoLiveDialog} onOpenChange={setShowGoLiveDialog}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2 gradient-primary text-primary-foreground shadow-glow">
          <Radio className="h-4 w-4" />
          Go Live
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Go Live
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Stream Title</Label>
            <Input
              id="title"
              placeholder="Enter your stream title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what you'll be streaming about"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleGoLive} disabled={isLoading} className="flex-1 gradient-primary">
              {isLoading ? "Starting..." : "Start Live Stream"}
            </Button>
            <Button variant="outline" onClick={() => setShowGoLiveDialog(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
